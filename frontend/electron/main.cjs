async function startElectron() {
  const { app, BrowserWindow } = await import('electron')
  const { default: path } = await import('node:path')
  const { default: fs } = await import('node:fs')

  const isDev = !app.isPackaged

  // Muat file .env dari root (saat dev) atau dari dalam app.asar (saat .exe)
  const envPath = isDev
    ? path.join(__dirname, '../.env')
    : path.join(process.resourcesPath, 'app.asar', '.env')

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    envContent.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
      if (match) {
        const key = match[1]
        const value = (match[2] || '').replace(/^['"]|['"]$/g, '')
        process.env[key] = value
      }
    })
  }

  // Sekarang bisa diakses langsung di main.js:
  const apiBaseUrl = process.env.VITE_API_BASE_URL
  const googleClientId = process.env.VITE_GOOGLE_CLIENT_ID

  async function createWindow() {
    const mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    })

    if (isDev) {
      // Saat development, muat server Vite
      mainWindow.loadURL('http://localhost:5173')
      mainWindow.webContents.openDevTools()
    } else {
      // Saat production (.exe), muat hasil build Vue di folder dist
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
    }
  }

  app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}

startElectron()
