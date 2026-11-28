const { app, BrowserWindow, session, protocol, net } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

// 1. Daftarkan custom scheme 'app' agar mendukung Cookie, LocalStorage, & Fetch API
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

// Pastikan lokasi penyimpanan cookie & cache konsisten
app.setPath('userData', path.join(app.getPath('appData'), 'AumoFinance'));

const isDev = !app.isPackaged;
const PARTITION_NAME = 'persist:aumo-finance';

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
    // Muat melalui protokol 'app://' (bukan loadFile / file://) agar cookie berjalan normal
    mainWindow.loadURL('app://aumo-finance/index.html');
  }
}

app.whenReady().then(() => {
  const customSession = session.fromPartition(PARTITION_NAME);

  // 2. Tangani request 'app://aumo-finance/...' dan arahkan ke folder 'dist/'
  if (!isDev) {
    protocol.handle('app', (request) => {
      const url = new URL(request.url);
      let relativePath = decodeURIComponent(url.pathname);

      // Default ke index.html jika root atau route SPA diakses langsung
      if (relativePath === '/' || relativePath === '') {
        relativePath = '/index.html';
      }

      const filePath = path.join(__dirname, '../dist', relativePath);
      return net.fetch(pathToFileURL(filePath).toString());
    });
  }

  // 3. Pastikan cookie lintas-domain dari backend (HTTPS) tidak diblokir kebijakan SameSite Chromium
  customSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders };

    if (responseHeaders['set-cookie']) {
      responseHeaders['set-cookie'] = responseHeaders['set-cookie'].map((cookie) => {
        // Ubah SameSite=Lax/Strict menjadi SameSite=None; Secure agar diterima oleh origin app://
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

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 4. Paksa tulis sisa cookie ke disk sebelum aplikasi benar-benar tertutup
app.on('before-quit', async () => {
  await session.fromPartition(PARTITION_NAME).cookies.flushStore();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
