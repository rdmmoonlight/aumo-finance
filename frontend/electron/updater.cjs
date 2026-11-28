const { app, dialog, net } = require('electron');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const GITHUB_OWNER = 'rdmmoonlight';
const GITHUB_REPO = 'aumo-finance';

// Mengubah "v26.11.2.EL" atau "26.11.2" menjadi array angka [26, 11, 2]
function parseCalVer(versionStr) {
  const clean = versionStr.replace(/^v/i, '').replace(/\.EL$/i, '');
  return clean.split('.').map((num) => parseInt(num, 10) || 0);
}

// Mengembalikan true jika remoteVersion > currentVersion
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

// Mengunduh file installer .exe di background
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const request = net.request(url);
    request.setHeader('User-Agent', 'AumoFinance-Desktop-Updater');

    request.on('response', (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Ikuti redirect S3/CDN GitHub
        downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Gagal mengunduh update: HTTP ${response.statusCode}`));
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
  // Jangan jalankan saat mode development
  if (!app.isPackaged) return;

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

    // Cari rilis pertama (terbaru) yang bukan draft/prerelease dan berakhiran .EL
    const latestElRelease = releases.find(
      (rel) => !rel.draft && !rel.prerelease && typeof rel.tag_name === 'string' && rel.tag_name.endsWith('.EL')
    );

    if (!latestElRelease) return;

    const currentVersion = app.getVersion(); // Contoh: "26.11.1"
    const latestTag = latestElRelease.tag_name; // Contoh: "v26.11.2.EL"

    if (!isNewerVersion(latestTag, currentVersion)) {
      return; // Aplikasi sudah versi terbaru
    }

    // Cari file installer .exe di aset rilis GitHub
    const exeAsset = latestElRelease.assets?.find((asset) =>
      asset.name.toLowerCase().endsWith('.exe')
    );

    if (!exeAsset) return;

    const tempInstallerPath = path.join(app.getPath('temp'), exeAsset.name);

    // Unduh diam-diam di background
    await downloadFile(exeAsset.browser_download_url, tempInstallerPath);

    // Beri tahu user setelah file siap diinstal
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
      // Jalankan installer NSIS dalam mode silent/otomatis lalu tutup aplikasi
      spawn(tempInstallerPath, ['/S'], {
        detached: true,
        stdio: 'ignore',
      }).unref();

      app.quit();
    }
  } catch (err) {
    // Gagal cek update (misalnya offline) diabaikan secara diam-diam agar tidak mengganggu user
    console.error('[Updater] Background update check failed:', err.message);
  }
}

module.exports = { checkForUpdatesInBackground };
