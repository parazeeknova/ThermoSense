import type {
  AppInfo,
  EnhancedSystemInfo,
  NotificationData,
  SystemInfo,
  WindowState,
} from '@/types/electron'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { ipcClient, safeIPCCall } from '@/lib/ipc-client'

// eslint-disable-next-line react-hooks-extra/no-unnecessary-use-prefix
export function useIsElectron(): boolean {
  return ipcClient.isElectron
}

export function useElectronSystemInfo() {
  const isElectron = useIsElectron()

  return useQuery({
    queryKey: ['electron-system-info'],
    queryFn: async (): Promise<SystemInfo> => {
      return ipcClient.getSystemInfo()
    },
    enabled: isElectron,
    refetchInterval: 5000, // Refresh every 5 seconds
    staleTime: 2000, // Consider data stale after 2 seconds
    retry: 3,
  })
}

export function useElectronEnhancedSystemInfo() {
  const isElectron = useIsElectron()

  return useQuery({
    queryKey: ['electron-enhanced-system-info'],
    queryFn: async (): Promise<EnhancedSystemInfo> => {
      return ipcClient.getEnhancedSystemInfo()
    },
    enabled: isElectron,
    refetchInterval: 3000, // Refresh every 3 seconds
    staleTime: 1500, // Consider data stale after 1.5 seconds
    retry: 3,
  })
}

export function useElectronNotifications() {
  const isElectron = useIsElectron()

  const showNotification = useCallback(async (data: NotificationData) => {
    if (!isElectron) {
      // Fallback to web notifications
      if ('Notification' in window && Notification.permission === 'granted') {
        // eslint-disable-next-line no-new
        new Notification(data.title, {
          body: data.body,
          icon: data.icon,
        })
      }
      else if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          // eslint-disable-next-line no-new
          new Notification(data.title, {
            body: data.body,
            icon: data.icon,
          })
        }
      }
      return { success: false, error: 'Not in Electron environment' }
    }

    return safeIPCCall(
      () => ipcClient.showNotification(data),
      { success: false, error: 'IPC call failed' },
    )
  }, [isElectron])

  const onNotificationClicked = useCallback((callback: (data: NotificationData) => void) => {
    if (!isElectron) {
      return () => {} // No-op cleanup function
    }

    return ipcClient.onNotificationClicked(callback)
  }, [isElectron])

  return {
    showNotification,
    onNotificationClicked,
    isElectron,
  }
}

export function useElectronWindow() {
  const isElectron = useIsElectron()
  const queryClient = useQueryClient()

  const minimizeWindow = useCallback(async () => {
    if (!isElectron)
      return { success: false, error: 'Not in Electron environment' }

    return safeIPCCall(
      () => ipcClient.minimizeWindow(),
      { success: false, error: 'IPC call failed' },
    )
  }, [isElectron])

  const maximizeWindow = useCallback(async () => {
    if (!isElectron)
      return { success: false, error: 'Not in Electron environment' }

    return safeIPCCall(
      () => ipcClient.maximizeWindow(),
      { success: false, error: 'IPC call failed' },
    )
  }, [isElectron])

  const closeWindow = useCallback(async () => {
    if (!isElectron)
      return { success: false, error: 'Not in Electron environment' }

    return safeIPCCall(
      () => ipcClient.closeWindow(),
      { success: false, error: 'IPC call failed' },
    )
  }, [isElectron])

  // Window state management
  const windowStateQuery = useQuery({
    queryKey: ['electron-window-state'],
    queryFn: async (): Promise<WindowState> => {
      return ipcClient.getWindowState()
    },
    enabled: isElectron,
    staleTime: 1000,
    retry: 2,
  })

  const setWindowState = useCallback(async (state: Partial<WindowState>) => {
    if (!isElectron)
      return { success: false, error: 'Not in Electron environment' }

    const result = await safeIPCCall(
      () => ipcClient.setWindowState(state),
      { success: false, error: 'IPC call failed' },
    )

    // Invalidate window state query to refresh
    if (result?.success) {
      queryClient.invalidateQueries({ queryKey: ['electron-window-state'] })
    }

    return result
  }, [isElectron, queryClient])

  // Listen for window state changes
  useEffect(() => {
    if (!isElectron)
      return

    const cleanup = ipcClient.onWindowStateChanged((state) => {
      queryClient.setQueryData(['electron-window-state'], state)
    })

    return cleanup
  }, [isElectron, queryClient])

  return {
    minimizeWindow,
    maximizeWindow,
    closeWindow,
    windowState: windowStateQuery.data,
    setWindowState,
    isWindowStateLoading: windowStateQuery.isLoading,
    isElectron,
  }
}

export function useElectronAppInfo() {
  const isElectron = useIsElectron()

  const appInfoQuery = useQuery({
    queryKey: ['electron-app-info'],
    queryFn: async (): Promise<AppInfo> => {
      return ipcClient.getAppInfo()
    },
    enabled: isElectron,
    staleTime: Infinity, // App info doesn't change during runtime
    retry: 2,
  })

  return {
    appInfo: appInfoQuery.data,
    appVersion: appInfoQuery.data?.version,
    platform: appInfoQuery.data?.platform,
    isDev: appInfoQuery.data?.isDev,
    isElectron,
    isLoading: appInfoQuery.isLoading,
  }
}

export function useElectronExternal() {
  const isElectron = useIsElectron()

  const openExternal = useCallback(async (url: string) => {
    if (!isElectron) {
      // Fallback to web behavior
      window.open(url, '_blank', 'noopener,noreferrer')
      return { success: true }
    }

    return safeIPCCall(
      () => ipcClient.openExternal(url),
      { success: false, error: 'IPC call failed' },
    )
  }, [isElectron])

  return {
    openExternal,
    isElectron,
  }
}

// Comprehensive hook that combines all Electron functionality
export function useElectron() {
  const isElectron = useIsElectron()
  const systemInfo = useElectronSystemInfo()
  const enhancedSystemInfo = useElectronEnhancedSystemInfo()
  const notifications = useElectronNotifications()
  const window = useElectronWindow()
  const appInfo = useElectronAppInfo()
  const external = useElectronExternal()

  const { isElectron: notificationIsElectron, ...notificationMethods } = notifications
  const { isElectron: windowIsElectron, ...windowMethods } = window
  const { isElectron: appIsElectron, ...appMethods } = appInfo
  const { isElectron: externalIsElectron, ...externalMethods } = external

  return {
    isElectron,
    systemInfo: systemInfo.data,
    enhancedSystemInfo: enhancedSystemInfo.data,
    isSystemInfoLoading: systemInfo.isLoading || enhancedSystemInfo.isLoading,
    ...notificationMethods,
    ...windowMethods,
    ...appMethods,
    ...externalMethods,
  }
}
