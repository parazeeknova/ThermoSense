'use client'

import type { NotificationData, SystemInfo } from '@/types/electron-ipc'
import { useCallback, useEffect, useState } from 'react'

/**
 * Hook to check if we're running in Electron
 */
export function useIsElectron(): boolean {
  const [isElectron, setIsElectron] = useState(false)

  useEffect(() => {
    setIsElectron(typeof window !== 'undefined' && !!window.electronAPI)
  }, [])

  return isElectron
}

/**
 * Hook for Electron system information
 */
export function useElectronSystemInfo() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isElectron = useIsElectron()

  const fetchSystemInfo = useCallback(async () => {
    if (!isElectron || !window.electronAPI) {
      setError('Not running in Electron')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const info = await window.electronAPI.getSystemInfo()
      setSystemInfo(info)
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system info')
    }
    finally {
      setLoading(false)
    }
  }, [isElectron])

  useEffect(() => {
    if (isElectron) {
      fetchSystemInfo()
    }
  }, [isElectron, fetchSystemInfo])

  return {
    systemInfo,
    loading,
    error,
    refetch: fetchSystemInfo,
  }
}

/**
 * Hook for Electron notifications
 */
export function useElectronNotifications() {
  const isElectron = useIsElectron()

  const showNotification = useCallback(async (data: NotificationData): Promise<boolean> => {
    if (!isElectron || !window.electronAPI) {
      console.warn('Notifications not available - not running in Electron')
      return false
    }

    try {
      const result = await window.electronAPI.showNotification(data)
      return result.success
    }
    catch (error) {
      console.error('Failed to show notification:', error)
      return false
    }
  }, [isElectron])

  return {
    showNotification,
    isAvailable: isElectron,
  }
}

/**
 * Hook for Electron window management
 */
export function useElectronWindow() {
  const isElectron = useIsElectron()

  const minimizeWindow = useCallback(async (): Promise<boolean> => {
    if (!isElectron || !window.electronAPI)
      return false
    try {
      const result = await window.electronAPI.minimizeWindow()
      return result.success
    }
    catch (error) {
      console.error('Failed to minimize window:', error)
      return false
    }
  }, [isElectron])

  const maximizeWindow = useCallback(async (): Promise<boolean> => {
    if (!isElectron || !window.electronAPI)
      return false
    try {
      const result = await window.electronAPI.maximizeWindow()
      return result.success
    }
    catch (error) {
      console.error('Failed to maximize window:', error)
      return false
    }
  }, [isElectron])

  const closeWindow = useCallback(async (): Promise<boolean> => {
    if (!isElectron || !window.electronAPI)
      return false
    try {
      const result = await window.electronAPI.closeWindow()
      return result.success
    }
    catch (error) {
      console.error('Failed to close window:', error)
      return false
    }
  }, [isElectron])

  const openExternal = useCallback(async (url: string): Promise<boolean> => {
    if (!isElectron || !window.electronAPI) {
      // Fallback to regular window.open for web
      window.open(url, '_blank')
      return true
    }
    try {
      const result = await window.electronAPI.openExternal(url)
      return result.success
    }
    catch (error) {
      console.error('Failed to open external URL:', error)
      return false
    }
  }, [isElectron])

  return {
    minimizeWindow,
    maximizeWindow,
    closeWindow,
    openExternal,
    isAvailable: isElectron,
  }
}

/**
 * Hook for Electron app information
 */
export function useElectronAppInfo() {
  const [appVersion, setAppVersion] = useState<string | null>(null)
  const [platform, setPlatform] = useState<string | null>(null)
  const isElectron = useIsElectron()

  useEffect(() => {
    if (!isElectron || !window.electronAPI)
      return

    const fetchAppInfo = async () => {
      try {
        const [version, platformInfo] = await Promise.all([
          window.electronAPI.getAppVersion(),
          window.electronAPI.getPlatform(),
        ])
        setAppVersion(version)
        setPlatform(platformInfo)
      }
      catch (error) {
        console.error('Failed to fetch app info:', error)
      }
    }

    fetchAppInfo()
  }, [isElectron])

  return {
    appVersion,
    platform,
    isElectron,
  }
}
