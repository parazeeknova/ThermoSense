/* eslint-disable node/prefer-global/process */
import * as path from 'node:path'
import { app, BrowserWindow, ipcMain, Notification, shell } from 'electron'
import * as si from 'systeminformation'
import { isDev } from './src/lib/electron-utils'

// eslint-disable-next-line import/no-mutable-exports
let mainWindow: BrowserWindow | null = null

function createMainWindow(): BrowserWindow {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false, // Don't show until ready-to-show
    titleBarStyle: 'default',
    icon: path.join(__dirname, 'assets/icon.png'), // We'll add this later
  })

  // Load the app
  if (isDev() || process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || '3000'
    mainWindow.loadURL(`http://localhost:${port}`)
    // Open DevTools in development
    mainWindow.webContents.openDevTools()
  }
  else {
    mainWindow.loadFile(path.join(__dirname, '../.next/standalone/server.js'))
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()

    if (isDev() || process.env.NODE_ENV !== 'production') {
      mainWindow?.webContents.openDevTools()
    }
  })

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  return mainWindow
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createMainWindow()

  // On macOS, re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent) => {
    navigationEvent.preventDefault()
    // You could open the URL in the default browser here if needed
  })
})

// Handle app protocol for deep linking (optional)
app.setAsDefaultProtocolClient('thermosense')

// System information handler
ipcMain.handle('get-system-info', async () => {
  try {
    const [cpuTemp, battery, currentLoad, cpu] = await Promise.all([
      si.cpuTemperature(),
      si.battery(),
      si.currentLoad(),
      si.cpu(),
    ])

    return {
      temperature: {
        cpu: cpuTemp.main || null,
        cores: cpuTemp.cores || [],
        max: cpuTemp.max || null,
        socket: cpuTemp.socket || [],
        chipset: cpuTemp.chipset || null,
      },
      battery: {
        hasBattery: battery.hasBattery || false,
        cycleCount: battery.cycleCount || 0,
        isCharging: battery.isCharging || false,
        designedCapacity: battery.designedCapacity || 0,
        maxCapacity: battery.maxCapacity || 0,
        currentCapacity: battery.currentCapacity || 0,
        voltage: battery.voltage || 0,
        capacityUnit: battery.capacityUnit || '',
        percent: battery.percent || 0,
        timeRemaining: battery.timeRemaining || null,
        acConnected: battery.acConnected || false,
        type: battery.type || '',
        model: battery.model || '',
        manufacturer: battery.manufacturer || '',
        serial: battery.serial || '',
      },
      cpu: {
        manufacturer: cpu.manufacturer || '',
        brand: cpu.brand || '',
        speed: cpu.speed || 0,
        cores: cpu.cores || 0,
        physicalCores: cpu.physicalCores || 0,
        processors: cpu.processors || 0,
      },
      load: {
        avgLoad: currentLoad.avgLoad || 0,
        currentLoad: currentLoad.currentLoad || 0,
        currentLoadUser: currentLoad.currentLoadUser || 0,
        currentLoadSystem: currentLoad.currentLoadSystem || 0,
      },
      timestamp: new Date().toISOString(),
    }
  }
  catch (error) {
    console.error('Error fetching system info:', error)
    throw error
  }
})

// Notification handler
ipcMain.handle('show-notification', async (event, data: { title: string, body: string, icon?: string }) => {
  try {
    const notification = new Notification({
      title: data.title,
      body: data.body,
      icon: data.icon,
    })
    notification.show()
  }
  catch (error) {
    console.error('Error showing notification:', error)
    throw error
  }
})

// Window management handlers
ipcMain.handle('minimize-window', async () => {
  mainWindow?.minimize()
})

ipcMain.handle('maximize-window', async () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  }
  else {
    mainWindow?.maximize()
  }
})

ipcMain.handle('close-window', async () => {
  mainWindow?.close()
})

// External link handler
ipcMain.handle('open-external', async (event, url: string) => {
  await shell.openExternal(url)
})

// App info handlers
ipcMain.handle('get-app-version', async () => {
  return app.getVersion()
})

ipcMain.handle('get-platform', async () => {
  return process.platform
})

export { mainWindow }
