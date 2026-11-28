const { app, BrowserWindow, session, protocol, net, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { spawn } = require('child_process');

const GITHUB_OWNER = 'rdmmoonlight';
const GITHUB_REPO = 'aumo-finance';
const PARTITION_NAME = 'persist:aumo-finance';
const isDev = !app.isPackaged;

// 1. Daftarkan custom scheme 'app' agar Cookie, LocalStorage, & Fetch API bekerja normal di production
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      allowServiceWorkers: true,
    },
  },
]);

// Pastikan folder penyimpanan userData (cookie, localStorage, cache) konsisten
app.setPath('userData', path.join(app.getPath('appData'), 'AumoFinance'));

// --- Helper Auto-Update CalVer (.EL) ---
function parseCalVer(versionStr) {
  const clean = versionStr.replace(/^v/i, '').replace(/\.EL$/i, '');
  return clean.split('.').map((num) => parseInt(num, 10) || 0);
}

function isNewerVersion(remoteStr, currentStr) {
  const remote = parseCalVer(remoteStr);
  const current = parseCalVer(currentStr);
  const len = Math.max(remote.length, current.length);

  for (let i = 0; i < len; i++) {
    const r = remote[i] || 0;
    const c = current[i] || 0;
    if (r > c) return true;
    if (r < c) return false;
  }
  return false;
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const request = net.request(url);
    request.setHeader('User-Agent', 'AumoFinance-Desktop-Updater');

    request.on('response', (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(destPath);
      response.on('data', (chunk) => fileStream.write(chunk));
      response.on('end', () => {
        fileStream.end();
        fileStream.on('finish', () => resolve(destPath));
      });
      response.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    });

    request.on('error', reject);
    request.end();
  });
}

async function checkForUpdatesInBackground() {
  if (isDev) return;

  try {
    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases?per_page=30`;
    const response = await net.fetch(apiUrl, {
      headers: {
        'User-Agent': 'AumoFinance-Desktop-Updater',
        Accept: 'application/vnd.github+json',
      },
    });

    if (!response.ok) return;

    const releases = await response.json();
    const latestElRelease = releases.find(
      (rel) =>
        !rel.draft &&
        !rel.prerelease &&
        typeof rel.tag_name === 'string' &&
        rel.tag_name.endsWith('.EL')
    );

    if (!latestElRelease) return;

    const currentVersion = app.getVersion();
    const latestTag = latestElRelease.tag_name;

    if (!isNewerVersion(latestTag, currentVersion)) return;

    const exeAsset = latestElRelease.assets?.find((asset) =>
      asset.name.toLowerCase().endsWith('.exe')
    );

    if (!exeAsset) return;

    const tempInstallerPath = path.join(app.getPath('temp'), exeAsset.name);
    await downloadFile(exeAsset.browser_download_url, tempInstallerPath);

    const { response: buttonIndex } = await dialog.showMessageBox({
      type: 'info',
      title: 'Pembaruan Tersedia',
      message: `Aumo Finance versi ${latestTag} sudah siap dipasang.`,
      detail: `Versi saat ini: v${currentVersion}.EL\nAplikasi akan menutup dan memasang pembaruan secara otomatis.`,
      buttons: ['Install & Restart Sekarang', 'Nanti Saja'],
      defaultId: 0,
      cancelId: 1,
    });

    if (buttonIndex === 0) {
      spawn(tempInstallerPath, ['/S'], {
        detached: true,
        stdio: 'ignore',
      }).unref();

      app.quit();
    }
  } catch (err) {
    console.error('[Updater] Background update check failed:', err.message);
  }
}

// --- Main Window ---
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      partition: PARTITION_NAME,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL('app://aumo-finance/index.html');
  }
}

app.whenReady().then(() => {
  const customSession = session.fromPartition(PARTITION_NAME);

  // Tangani protokol 'app://' ke folder hasil build '../dist'
  if (!isDev) {
    protocol.handle('app', (request) => {
      const url = new URL(request.url);
      let relativePath = decodeURIComponent(url.pathname);

      if (relativePath === '/' || relativePath === '') {
        relativePath = '/index.html';
      }

      const filePath = path.join(__dirname, '../dist', relativePath);
      return net.fetch(pathToFileURL(filePath).toString());
    });
  }

  // Izinkan cookie lintas-domain dari backend (HTTPS) agar tidak diblokir kebijakan SameSite
  customSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders };

    if (responseHeaders['set-cookie']) {
      responseHeaders['set-cookie'] = responseHeaders['set-cookie'].map((cookie) => {
        let updatedCookie = cookie.replace(/SameSite=(Lax|Strict)/gi, 'SameSite=None');
        if (!/SameSite=/i.test(updatedCookie)) {
          updatedCookie += '; SameSite=None';
        }
        if (!/Secure/i.test(updatedCookie)) {
          updatedCookie += '; Secure';
        }
        return updatedCookie;
      });
    }

    callback({ responseHeaders });
  });

  createWindow();

  // Cek update 5 detik setelah startup, lalu ulangi setiap 4 jam di background
  setTimeout(() => {
    checkForUpdatesInBackground();
  }, 5000);

  setInterval(() => {
    checkForUpdatesInBackground();
  }, 4 * 60 * 60 * 1000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', async () => {
  await session.fromPartition(PARTITION_NAME).cookies.flushStore();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
