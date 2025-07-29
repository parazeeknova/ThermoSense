/**
 * IPC Client for Renderer Process
 * Provides a clean interface for communicating with the main process
 */

import type {
  AppInfo,
  EnhancedSystemInfo,
  NotificationData,
  NotificationResponse,
  SystemInfo,
  WindowOperation,
  WindowState,
} from '@/types/electron'

/**
 * Type-safe IPC client wrapper
 */
class IPCClient {
  private get api() {
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('Electron API not available. Make sure you are running in Electron environment.')
    }
    return window.electronAPI
  }

  /**
   * Check if running in Electron environment
   */
  get isElectron(): boolean {
    return typeof window !== 'undefined' && !!window.electronAPI
  }

  // System Information Methods
  async getSystemInfo(): Promise<SystemInfo> {
    return this.api.getSystemInfo()
  }

  async getEnhancedSystemInfo(): Promise<EnhancedSystemInfo> {
    return this.api.getEnhancedSystemInfo()
  }

  // Notification Methods
  async showNotification(data: NotificationData): Promise<NotificationResponse> {
    return this.api.showNotification(data)
  }

  onNotificationClicked(callback: (data: NotificationData) => void): () => void {
    return this.api.onNotificationClicked(callback)
  }

  // Window Management Methods
  async minimizeWindow(): Promise<WindowOperation> {
    return this.api.minimizeWindow()
  }

  async maximizeWindow(): Promise<WindowOperation> {
    return this.api.maximizeWindow()
  }

  async closeWindow(): Promise<WindowOperation> {
    return this.api.closeWindow()
  }

  async getWindowState(): Promise<WindowState> {
    return this.api.getWindowState()
  }

  async setWindowState(state: Partial<WindowState>): Promise<WindowOperation> {
    return this.api.setWindowState(state)
  }

  onWindowStateChanged(callback: (state: WindowState) => void): () => void {
    return this.api.onWindowStateChanged(callback)
  }

  // External Methods
  async openExternal(url: string): Promise<WindowOperation> {
    return this.api.openExternal(url)
  }

  // App Information Methods
  async getAppInfo(): Promise<AppInfo> {
    return this.api.getAppInfo()
  }

  async getAppVersion(): Promise<string> {
    return this.api.getAppVersion()
  }

  async getPlatform(): Promise<string> {
    return this.api.getPlatform()
  }
}

// Create singleton instance
export const ipcClient = new IPCClient()

// Export individual methods for convenience
export const {
  isElectron,
  getSystemInfo,
  getEnhancedSystemInfo,
  showNotification,
  onNotificationClicked,
  minimizeWindow,
  maximizeWindow,
  closeWindow,
  getWindowState,
  setWindowState,
  onWindowStateChanged,
  openExternal,
  getAppInfo,
  getAppVersion,
  getPlatform,
} = ipcClient

// Export class for advanced usage
export { IPCClient }

/**
 * Hook-like wrapper for React components
 */
export function useIPCClient() {
  return ipcClient
}

/**
 * Utility function to safely execute IPC calls with error handling
 */
export async function safeIPCCall<T>(
  operation: () => Promise<T>,
  fallback?: T,
  onError?: (error: Error) => void,
): Promise<T | undefined> {
  try {
    return await operation()
  }
  catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown IPC error')

    if (onError) {
      onError(err)
    }
    else {
      console.error('IPC call failed:', err.message)
    }

    return fallback
  }
}

/**
 * Batch IPC operations with error handling
 */
export async function batchIPCCalls<T extends Record<string, () => Promise<any>>>(
  operations: T,
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> | null }> {
  const results = {} as { [K in keyof T]: Awaited<ReturnType<T[K]>> | null }

  await Promise.allSettled(
    Object.entries(operations).map(async ([key, operation]) => {
      try {
        results[key as keyof T] = await operation()
      }
      catch (error) {
        console.error(`IPC operation '${key}' failed:`, error)
        results[key as keyof T] = null
      }
    }),
  )

  return results
}
