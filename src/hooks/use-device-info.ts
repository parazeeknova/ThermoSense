import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

interface DeviceBattery {
  hasBattery: boolean
  cycleCount: number
  isCharging: boolean
  designedCapacity: number
  maxCapacity: number
  currentCapacity: number
  voltage: number
  capacityUnit: string
  percent: number
  timeRemaining: number | null
  acConnected: boolean
  type: string
  model: string
  manufacturer: string
  serial: string
}

interface DeviceCpu {
  manufacturer: string
  brand: string
  speed: number
  cores: number
  physicalCores: number
  processors: number
}

interface DeviceInfo {
  temperature: DeviceTemperature
  battery: DeviceBattery
  cpu: DeviceCpu
  load: DeviceLoad
  timestamp: string
}

interface DeviceLoad {
  avgLoad: number
  currentLoad: number
  currentLoadUser: number
  currentLoadSystem: number
}

interface DeviceTemperature {
  cpu: number | null
  cores: number[]
  max: number | null
  socket: number[]
  chipset: number | null
}

export const deviceInfoKeys = {
  all: ['device-info'] as const,
  current: () => [...deviceInfoKeys.all, 'current'] as const,
}

async function fetchDeviceInfo(): Promise<DeviceInfo> {
  const response = await fetch('/api/device/info')
  if (!response.ok) {
    throw new Error('Failed to fetch device information')
  }
  return response.json()
}

export function useDeviceInfo() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: deviceInfoKeys.current(),
    queryFn: fetchDeviceInfo,
    refetchInterval: 2000, // Refresh every 2 seconds
    staleTime: 1000, // Consider data stale after 1 second
    gcTime: 5000, // Keep in cache for 5 seconds
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Use effect to handle cache coordination when data changes
  useEffect(() => {
    if (query.data?.timestamp) {
      queryClient.invalidateQueries({
        queryKey: ['historical-data'],
        exact: false,
      })
    }
  }, [query.data?.timestamp, queryClient])

  return query
}

// Hook to coordinate device info with other data sources
export function useDeviceInfoSync() {
  const queryClient = useQueryClient()

  const refreshDeviceInfo = () => {
    queryClient.invalidateQueries({ queryKey: deviceInfoKeys.all })
  }

  const getLatestDeviceInfo = () => {
    return queryClient.getQueryData(deviceInfoKeys.current())
  }

  return {
    refreshDeviceInfo,
    getLatestDeviceInfo,
  }
}

export type { DeviceBattery, DeviceCpu, DeviceInfo, DeviceLoad, DeviceTemperature }
