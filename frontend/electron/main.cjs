async function startElectron() {
  const { app, BrowserWindow } = await import('electron')

  const isDev = !app.isPackaged

  async function createWindow() {
    const { default: path } = await import('node:path')
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
