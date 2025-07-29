'use client'

import type { SystemInfo } from '@/types/electron-ipc'
import { useCallback, useEffect, useState } from 'react'
import { trpc } from '@/lib/trpc'
import { useElectronAppInfo, useElectronSystemInfo, useIsElectron } from './use-electron-ipc'

interface EnhancedSystemInfo {
  // Basic system info (available in both web and Electron)
  platform: string
  arch: string
  nodeVersion: string
  timestamp: string

  // Electron-specific info (only available in Electron)
  electronVersion?: string
  chromeVersion?: string
  appVersion?: string
  totalMemory?: number
  freeMemory?: number
  cpuCount?: number
  uptime?: number
  hostname?: string
  userInfo?: SystemInfo['userInfo']

  // Runtime info
  isElectron: boolean
  source: 'electron-ipc' | 'trpc' | 'hybrid'
}

/**
 * Enhanced system information hook that combines tRPC and Electron IPC data
 */
export function useEnhancedSystemInfo() {
  const [enhancedInfo, setEnhancedInfo] = useState<EnhancedSystemInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isElectron = useIsElectron()

  // Get basic system info from tRPC
  const tRPCSystemInfo = trpc.system.getElectronSystemInfo.useQuery(undefined, {
    staleTime: 30000, // 30 seconds
    retry: 2,
  })

  // Get app info from tRPC
  const tRPCAppInfo = trpc.system.getAppInfo.useQuery(undefined, {
    staleTime: 60000, // 1 minute
    retry: 2,
  })

  // Get enhanced info from Electron IPC (if available)
  const {
    systemInfo: electronSystemInfo,
    loading: electronLoading,
    error: electronError,
  } = useElectronSystemInfo()

  const { appVersion, platform: electronPlatform } = useElectronAppInfo()

  const combineSystemInfo = useCallback(() => {
    setLoading(true)
    setError(null)

    try {
      let combined: EnhancedSystemInfo

      if (isElectron && electronSystemInfo) {
        // Use Electron IPC data as primary source
        combined = {
          platform: electronSystemInfo.platform,
          arch: electronSystemInfo.arch,
          nodeVersion: electronSystemInfo.nodeVersion,
          electronVersion: electronSystemInfo.electronVersion,
          chromeVersion: electronSystemInfo.chromeVersion,
          appVersion: electronSystemInfo.appVersion,
          totalMemory: electronSystemInfo.totalMemory,
          freeMemory: electronSystemInfo.freeMemory,
          cpuCount: electronSystemInfo.cpuCount,
          uptime: electronSystemInfo.uptime,
          hostname: electronSystemInfo.hostname,
          userInfo: electronSystemInfo.userInfo,
          timestamp: electronSystemInfo.timestamp,
          isElectron: true,
          source: 'electron-ipc',
        }

        // Supplement with tRPC data if available
        if (tRPCSystemInfo.data) {
          combined = {
            ...combined,
            // Use tRPC data as fallback for missing Electron data
            platform: combined.platform || tRPCSystemInfo.data.platform,
            arch: combined.arch || tRPCSystemInfo.data.arch,
            nodeVersion: combined.nodeVersion || tRPCSystemInfo.data.nodeVersion,
            source: 'hybrid',
          }
        }
      }
      else if (tRPCSystemInfo.data) {
        // Use tRPC data as primary source (web environment)
        combined = {
          platform: tRPCSystemInfo.data.platform,
          arch: tRPCSystemInfo.data.arch,
          nodeVersion: tRPCSystemInfo.data.nodeVersion,
          totalMemory: tRPCSystemInfo.data.totalMemory,
          freeMemory: tRPCSystemInfo.data.freeMemory,
          cpuCount: tRPCSystemInfo.data.cpuCount,
          uptime: tRPCSystemInfo.data.uptime,
          hostname: tRPCSystemInfo.data.hostname,
          timestamp: tRPCSystemInfo.data.timestamp,
          isElectron: false,
          source: 'trpc',
        }

        // Add app info if available
        if (tRPCAppInfo.data) {
          combined.appVersion = tRPCAppInfo.data.version
        }
      }
      else {
        // Fallback to basic info
        combined = {
          platform: electronPlatform || 'unknown',
          arch: 'unknown',
          nodeVersion: 'unknown',
          appVersion: appVersion || '1.0.0',
          timestamp: new Date().toISOString(),
          isElectron,
          source: isElectron ? 'electron-ipc' : 'trpc',
        }
      }

      setEnhancedInfo(combined)
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to combine system info')
    }
    finally {
      setLoading(false)
    }
  }, [
    isElectron,
    electronSystemInfo,
    tRPCSystemInfo.data,
    tRPCAppInfo.data,
    appVersion,
    electronPlatform,
  ])

  useEffect(() => {
    combineSystemInfo()
  }, [
    combineSystemInfo,
    tRPCSystemInfo.isSuccess,
    tRPCAppInfo.isSuccess,
    electronSystemInfo,
  ])

  const refresh = useCallback(() => {
    tRPCSystemInfo.refetch()
    tRPCAppInfo.refetch()
    combineSystemInfo()
  }, [tRPCSystemInfo, tRPCAppInfo, combineSystemInfo])

  return {
    systemInfo: enhancedInfo,
    loading: loading || tRPCSystemInfo.isLoading || tRPCAppInfo.isLoading || electronLoading,
    error: error || tRPCSystemInfo.error?.message || tRPCAppInfo.error?.message || electronError,
    isElectron,
    refresh,

    // Individual data sources for debugging
    sources: {
      trpcSystem: tRPCSystemInfo.data,
      trpcApp: tRPCAppInfo.data,
      electronSystem: electronSystemInfo,
    },
  }
}

/**
 * Hook for memory information with real-time updates
 */
export function useMemoryInfo(refreshInterval = 5000) {
  const [memoryInfo, setMemoryInfo] = useState<{
    total: number
    free: number
    used: number
    usedPercentage: number
  } | null>(null)

  const isElectron = useIsElectron()
  const { systemInfo } = useEnhancedSystemInfo()

  useEffect(() => {
    if (!systemInfo?.totalMemory || !systemInfo?.freeMemory)
      return

    const updateMemoryInfo = () => {
      const total = systemInfo.totalMemory!
      const free = systemInfo.freeMemory!
      const used = total - free
      const usedPercentage = (used / total) * 100

      setMemoryInfo({
        total,
        free,
        used,
        usedPercentage,
      })
    }

    updateMemoryInfo()

    // Set up interval for real-time updates (only in Electron)
    if (isElectron) {
      const interval = setInterval(updateMemoryInfo, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [systemInfo, isElectron, refreshInterval])

  return memoryInfo
}
