import { useQuery } from '@tanstack/react-query'

interface SystemHealth {
  isHealthy: boolean
  uptime: number
  lastCheck: string
  status: 'healthy' | 'warning' | 'error'
}

interface InternetConnection {
  isOnline: boolean
  speed: number | null
  latency: number | null
  status: 'stable' | 'slow' | 'disconnected'
}

interface SystemStatus {
  health: SystemHealth
  connection: InternetConnection
  lastSync: string
}

export const systemStatusKeys = {
  all: ['system-status'] as const,
  health: () => [...systemStatusKeys.all, 'health'] as const,
  connection: () => [...systemStatusKeys.all, 'connection'] as const,
}

async function fetchSystemHealth(): Promise<SystemHealth> {
  try {
    const response = await fetch('/api/device/info', {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000),
    })

    return {
      isHealthy: response.ok,
      uptime: Date.now(),
      lastCheck: new Date().toISOString(),
      status: response.ok ? 'healthy' : 'error',
    }
  }
  catch {
    return {
      isHealthy: false,
      uptime: 0,
      lastCheck: new Date().toISOString(),
      status: 'error',
    }
  }
}

async function fetchConnectionStatus(): Promise<InternetConnection> {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    if (!navigator.onLine) {
      return {
        isOnline: false,
        speed: null,
        latency: null,
        status: 'disconnected',
      }
    }
  }

  // Test connection with a lightweight GET request to weather API
  try {
    const startTime = performance.now()
    const response = await fetch('/api/weather/current?city=London', {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    })
    const endTime = performance.now()
    const latency = endTime - startTime

    let status: 'stable' | 'slow' | 'disconnected' = 'stable'
    if (!response.ok) {
      status = 'disconnected'
    }
    else if (latency > 2000) {
      status = 'slow'
    }

    return {
      isOnline: response.ok,
      speed: null,
      latency: Math.round(latency),
      status,
    }
  }
  catch {
    return {
      isOnline: false,
      speed: null,
      latency: null,
      status: 'disconnected',
    }
  }
}

export function useSystemHealth() {
  return useQuery({
    queryKey: systemStatusKeys.health(),
    queryFn: fetchSystemHealth,
    refetchInterval: 10000, // Check every 10 seconds
    staleTime: 5000, // Consider stale after 5 seconds
    retry: 2,
    retryDelay: 1000,
  })
}

export function useConnectionStatus() {
  return useQuery({
    queryKey: systemStatusKeys.connection(),
    queryFn: fetchConnectionStatus,
    refetchInterval: 15000, // Check every 15 seconds
    staleTime: 8000, // Consider stale after 8 seconds
    retry: 1,
    retryDelay: 2000,
  })
}

export function useSystemStatus() {
  const healthQuery = useSystemHealth()
  const connectionQuery = useConnectionStatus()

  return {
    health: healthQuery.data,
    connection: connectionQuery.data,
    lastSync: healthQuery.data?.lastCheck || new Date().toISOString(),
    isLoading: healthQuery.isLoading || connectionQuery.isLoading,
    isError: healthQuery.isError || connectionQuery.isError,
  }
}

export type { InternetConnection, SystemHealth, SystemStatus }
