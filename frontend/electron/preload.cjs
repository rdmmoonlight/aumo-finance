// eslint-disable-next-line @typescript-eslint/no-require-imports
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Tempat menaruh fungsi jembatan antara Vue dan Node/OS jika diperlukan nanti
})
