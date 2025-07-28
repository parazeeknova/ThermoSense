import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // System information
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),

  // Notifications
  showNotification: (data: { title: string, body: string, icon?: string }) =>
    ipcRenderer.invoke('show-notification', data),

  // Window management
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),

  // External links
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),

  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
})

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      getSystemInfo: () => Promise<any>
      showNotification: (data: { title: string, body: string, icon?: string }) => Promise<void>
      minimizeWindow: () => Promise<void>
      maximizeWindow: () => Promise<void>
      closeWindow: () => Promise<void>
      openExternal: (url: string) => Promise<void>
      getAppVersion: () => Promise<string>
      getPlatform: () => Promise<string>
    }
  }
}
