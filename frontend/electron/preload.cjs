// eslint-disable-next-line @typescript-eslint/no-require-imports
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('electronEnv', {
  isElectron: true,
})
