import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

interface HistoricalReading {
  timestamp: string
  batteryTemp: number
  ambientTemp: number
  cpuLoad: number
  deviceState: 'active' | 'idle' | 'sleep'
  location?: {
    lat: number
    lng: number
    city: string
  }
  batteryLevel: number
  batteryHealth: number
  correlation: string
  efficiency: number
  healthDegradation: number
  chargeEfficiency: number
  lifespan: number
}

interface HistoricalDataResponse {
  data: HistoricalReading[]
  timeRange: string
  totalReadings: number
  latestReading: HistoricalReading | null
  summary: {
    avgDeviceTemp: number
    avgAmbientTemp: number
    avgCpuLoad: number
    maxTempDiff: number
    avgBatteryHealth: number
  }
  message?: string
  isBootstrapping?: boolean
  collectedReadings?: number
  isRealData?: boolean
}

export const historicalDataKeys = {
  all: ['historical-data'] as const,
  byRange: (timeRange: string, limit: number, location?: string) =>
    [...historicalDataKeys.all, 'range', timeRange, limit, location] as const,
}

async function fetchHistoricalData(
  timeRange: string = '30min',
  limit: number = 30,
  location?: { lat: number, lng: number, city: string },
): Promise<HistoricalDataResponse> {
  const params = new URLSearchParams({ timeRange, limit: limit.toString() })

  if (location) {
    params.append('lat', location.lat.toString())
    params.append('lng', location.lng.toString())
    params.append('city', location.city)
  }

  const response = await fetch(`/api/device/history?${params}`)

  if (!response.ok) {
    throw new Error('Failed to fetch historical data')
  }

  return response.json()
}

export function useHistoricalData(
  timeRange: '30min' | '1hour' | '6hours' | '24hours' = '30min',
  limit: number = 30,
  location?: { lat: number, lng: number, city: string },
) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: historicalDataKeys.byRange(timeRange, limit, location?.city),
    queryFn: () => fetchHistoricalData(timeRange, limit, location),
    refetchInterval: (query) => {
      // If bootstrapping, refetch more frequently
      if (query.state.data?.isBootstrapping) {
        return 5000 // Every 5 seconds during bootstrap
      }
      return 30000 // Every 30 seconds normally
    },
    staleTime: 15000, // Consider data stale after 15 seconds
    gcTime: 60000, // Keep in cache for 1 minute
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Use effect to handle cache coordination when data changes
  useEffect(() => {
    if (query.data?.latestReading) {
      // Invalidate device-info cache when we get new historical data
      // to ensure consistency between current and historical data
      queryClient.invalidateQueries({ queryKey: ['device-info'] })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data?.latestReading?.timestamp, queryClient])

  return query
}

// Hook to refresh historical data when device info changes
export function useHistoricalDataSync() {
  const queryClient = useQueryClient()
  const syncHistoricalData = () => {
    queryClient.invalidateQueries({ queryKey: historicalDataKeys.all })
  }

  return { syncHistoricalData }
}

export type { HistoricalDataResponse, HistoricalReading }
