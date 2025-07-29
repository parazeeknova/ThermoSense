import type {
  AppInfo,
  ElectronAPI,
  EnhancedSystemInfo,
  NotificationData,
  NotificationResponse,
  SystemInfo,
  WindowOperation,
  WindowState,
} from './src/types/electron'
import { contextBridge, ipcRenderer } from 'electron'

// Type-safe IPC invoke wrapper
function invoke<T>(channel: string, data?: unknown): Promise<T> {
  return ipcRenderer.invoke(channel, data)
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI: ElectronAPI = {
  // System information
  getSystemInfo: (): Promise<SystemInfo> =>
    invoke<SystemInfo>('system:get-info'),

  getEnhancedSystemInfo: (): Promise<EnhancedSystemInfo> =>
    invoke<EnhancedSystemInfo>('system:get-enhanced-info'),

  // Notifications
  showNotification: (data: NotificationData): Promise<NotificationResponse> =>
    invoke<NotificationResponse>('notification:show', data),

  // Window management
  minimizeWindow: (): Promise<WindowOperation> =>
    invoke<WindowOperation>('window:minimize'),

  maximizeWindow: (): Promise<WindowOperation> =>
    invoke<WindowOperation>('window:maximize'),

  closeWindow: (): Promise<WindowOperation> =>
    invoke<WindowOperation>('window:close'),

  getWindowState: (): Promise<WindowState> =>
    invoke<WindowState>('window:get-state'),

  setWindowState: (state: Partial<WindowState>): Promise<WindowOperation> =>
    invoke<WindowOperation>('window:set-state', state),

  // External links
  openExternal: (url: string): Promise<WindowOperation> =>
    invoke<WindowOperation>('external:open', url),

  // App info
  getAppInfo: (): Promise<AppInfo> =>
    invoke<AppInfo>('app:get-info'),

  getAppVersion: (): Promise<string> =>
    invoke<string>('app:get-version'),

  getPlatform: (): Promise<string> =>
    invoke<string>('app:get-platform'),

  // Event listeners
  onWindowStateChanged: (callback: (state: WindowState) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, state: WindowState) => {
      callback(state)
    }
    ipcRenderer.on('window:state-changed', listener)

    // Return cleanup function
    return () => {
      ipcRenderer.removeListener('window:state-changed', listener)
    }
  },

  onNotificationClicked: (callback: (data: NotificationData) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, data: NotificationData) => {
      callback(data)
    }
    ipcRenderer.on('notification:clicked', listener)

    // Return cleanup function
    return () => {
      ipcRenderer.removeListener('notification:clicked', listener)
    }
  },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
