/* eslint-disable node/prefer-global/process */
/**
 * IPC Handlers for Electron Main Process
 * Provides type-safe communication between main and renderer processes
 */

import type {
  AppInfo,
  EnhancedSystemInfo,
  IPCChannels,
  NotificationData,
  SystemInfo,
  WindowState,
} from '../types/electron'
import * as os from 'node:os'
import { app, BrowserWindow, ipcMain, Notification, shell } from 'electron'

// Type-safe IPC handler wrapper
function createIPCHandler<K extends keyof IPCChannels>(
  channel: K,
  handler: (event: Electron.IpcMainInvokeEvent, data: IPCChannels[K]['request']) => Promise<IPCChannels[K]['response']>,
) {
  ipcMain.handle(channel, handler)
}

/**
 * System Information Handlers
 */
export function setupSystemHandlers() {
  // Basic system information
  createIPCHandler('system:get-info', async () => {
    const systemInfo: SystemInfo = {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome,
      appVersion: app.getVersion(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpuCount: os.cpus().length,
      uptime: os.uptime(),
      hostname: os.hostname(),
      userInfo: os.userInfo(),
      timestamp: new Date().toISOString(),
    }
    return systemInfo
  })

  // Enhanced system information (placeholder for future implementation)
  createIPCHandler('system:get-enhanced-info', async () => {
    const basicInfo = await getBasicSystemInfo()

    // For now, return basic info with placeholder enhanced data
    // This will be expanded when system monitoring libraries are integrated
    const enhancedInfo: EnhancedSystemInfo = {
      ...basicInfo,
      temperature: {
        cpu: null,
        cores: [],
        max: null,
        socket: [],
        chipset: null,
      },
      battery: {
        hasBattery: false,
        cycleCount: 0,
        isCharging: false,
        designedCapacity: 0,
        maxCapacity: 0,
        currentCapacity: 0,
        voltage: 0,
        capacityUnit: 'mWh',
        percent: 0,
        timeRemaining: null,
        acConnected: true,
        type: 'Unknown',
        model: 'Unknown',
        manufacturer: 'Unknown',
        serial: 'Unknown',
      },
      cpu: {
        manufacturer: os.cpus()[0]?.model.split(' ')[0] || 'Unknown',
        brand: os.cpus()[0]?.model || 'Unknown',
        speed: os.cpus()[0]?.speed || 0,
        cores: os.cpus().length,
        physicalCores: os.cpus().length, // Simplified
        processors: 1,
      },
      load: {
        avgLoad: os.loadavg()[0] || 0,
        currentLoad: 0, // Placeholder
        currentLoadUser: 0, // Placeholder
        currentLoadSystem: 0, // Placeholder
      },
    }

    return enhancedInfo
  })
}

/**
 * Notification Handlers
 */
export function setupNotificationHandlers() {
  createIPCHandler('notification:show', async (event, data: NotificationData) => {
    try {
      if (!Notification.isSupported()) {
        return {
          success: false,
          error: 'Notifications not supported on this platform',
        }
      }

      const notification = new Notification({
        title: data.title,
        body: data.body,
        icon: data.icon,
        urgency: data.urgency,
      })

      // Handle notification click
      notification.on('click', () => {
        // Bring window to front
        const focusedWindow = BrowserWindow.getFocusedWindow()
        if (focusedWindow) {
          if (focusedWindow.isMinimized()) {
            focusedWindow.restore()
          }
          focusedWindow.focus()
        }

        // Send notification click event to renderer
        event.sender.send('notification:clicked', data)
      })

      notification.show()

      return { success: true }
    }
    catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  })
}

/**
 * Window Management Handlers
 */
export function setupWindowHandlers() {
  createIPCHandler('window:minimize', async (event) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (window) {
        window.minimize()
        return { success: true }
      }
      return { success: false, error: 'Window not found' }
    }
    catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  })

  createIPCHandler('window:maximize', async (event) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (window) {
        if (window.isMaximized()) {
          window.unmaximize()
        }
        else {
          window.maximize()
        }
        return { success: true }
      }
      return { success: false, error: 'Window not found' }
    }
    catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  })

  createIPCHandler('window:close', async (event) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (window) {
        window.close()
        return { success: true }
      }
      return { success: false, error: 'Window not found' }
    }
    catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  })

  createIPCHandler('window:get-state', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) {
      throw new Error('Window not found')
    }

    const bounds = window.getBounds()
    const state: WindowState = {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
      isMaximized: window.isMaximized(),
      isMinimized: window.isMinimized(),
      isFullScreen: window.isFullScreen(),
    }

    return state
  })

  createIPCHandler('window:set-state', async (event, state) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (!window) {
        return { success: false, error: 'Window not found' }
      }

      if (state.width !== undefined || state.height !== undefined
        || state.x !== undefined || state.y !== undefined) {
        const currentBounds = window.getBounds()
        window.setBounds({
          x: state.x ?? currentBounds.x,
          y: state.y ?? currentBounds.y,
          width: state.width ?? currentBounds.width,
          height: state.height ?? currentBounds.height,
        })
      }

      if (state.isMaximized !== undefined) {
        if (state.isMaximized) {
          window.maximize()
        }
        else {
          window.unmaximize()
        }
      }

      if (state.isMinimized !== undefined) {
        if (state.isMinimized) {
          window.minimize()
        }
        else {
          window.restore()
        }
      }

      if (state.isFullScreen !== undefined) {
        window.setFullScreen(state.isFullScreen)
      }

      return { success: true }
    }
    catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  })
}

/**
 * App Information Handlers
 */
export function setupAppHandlers() {
  createIPCHandler('app:get-info', async () => {
    const appInfo: AppInfo = {
      version: app.getVersion(),
      name: app.getName(),
      platform: process.platform,
      isDev: process.env.NODE_ENV === 'development',
    }
    return appInfo
  })

  createIPCHandler('app:get-version', async () => {
    return app.getVersion()
  })

  createIPCHandler('app:get-platform', async () => {
    return process.platform
  })
}

/**
 * External Link Handlers
 */
export function setupExternalHandlers() {
  createIPCHandler('external:open', async (event, url: string) => {
    try {
      await shell.openExternal(url)
      return { success: true }
    }
    catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to open external URL',
      }
    }
  })
}

/**
 * Initialize all IPC handlers
 */
export function setupAllIPCHandlers() {
  setupSystemHandlers()
  setupNotificationHandlers()
  setupWindowHandlers()
  setupAppHandlers()
  setupExternalHandlers()
}

/**
 * Helper function to get basic system info
 */
async function getBasicSystemInfo(): Promise<SystemInfo> {
  return {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    electronVersion: process.versions.electron,
    chromeVersion: process.versions.chrome,
    appVersion: app.getVersion(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    cpuCount: os.cpus().length,
    uptime: os.uptime(),
    hostname: os.hostname(),
    userInfo: os.userInfo(),
    timestamp: new Date().toISOString(),
  }
}

/**
 * Cleanup function to remove all IPC handlers
 */
export function removeAllIPCHandlers() {
  const channels: (keyof IPCChannels)[] = [
    'system:get-info',
    'system:get-enhanced-info',
    'notification:show',
    'window:minimize',
    'window:maximize',
    'window:close',
    'window:get-state',
    'window:set-state',
    'app:get-info',
    'app:get-version',
    'app:get-platform',
    'external:open',
  ]

  channels.forEach((channel) => {
    ipcMain.removeAllListeners(channel)
  })
}
