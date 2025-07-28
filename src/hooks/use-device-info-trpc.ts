import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { trpc } from '@/lib/trpc'

export const deviceInfoKeys = {
  all: ['device-info'] as const,
  current: () => [...deviceInfoKeys.all, 'current'] as const,
}

export function useDeviceInfo() {
  const queryClient = useQueryClient()

  const query = trpc.device.getInfo.useQuery(undefined, {
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

// Individual hooks for specific device data
export function useDeviceTemperature() {
  return trpc.device.getTemperature.useQuery(undefined, {
    refetchInterval: 2000,
    staleTime: 1000,
  })
}

export function useDeviceBattery() {
  return trpc.device.getBattery.useQuery(undefined, {
    refetchInterval: 5000, // Battery info doesn't change as frequently
    staleTime: 2000,
  })
}
