/* eslint-disable node/prefer-global/process */
import * as path from 'node:path'
import { app, BrowserWindow } from 'electron'
import { removeAllIPCHandlers, setupAllIPCHandlers } from './src/lib/ipc-handlers'

function isDev(): boolean {
  return process.env.NODE_ENV === 'development'
}

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

  // Setup window state notifications
  setupWindowStateNotifications(mainWindow)

  return mainWindow
}

// Setup window state change notifications
function setupWindowStateNotifications(window: BrowserWindow) {
  const sendWindowState = () => {
    const bounds = window.getBounds()
    const state = {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
      isMaximized: window.isMaximized(),
      isMinimized: window.isMinimized(),
      isFullScreen: window.isFullScreen(),
    }
    window.webContents.send('window:state-changed', state)
  }

  window.on('resize', sendWindowState)
  window.on('move', sendWindowState)
  window.on('maximize', sendWindowState)
  window.on('unmaximize', sendWindowState)
  window.on('minimize', sendWindowState)
  window.on('restore', sendWindowState)
  window.on('enter-full-screen', sendWindowState)
  window.on('leave-full-screen', sendWindowState)
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Setup all IPC handlers
  setupAllIPCHandlers()

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

// Cleanup IPC handlers on app quit
app.on('before-quit', () => {
  removeAllIPCHandlers()
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

export { mainWindow }
