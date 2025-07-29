import { trpc } from '@/lib/trpc'

export interface AIContext {
  deviceTemp: number
  batteryLevel: number
  weatherTemp: number
  cpuUsage: number
  screenBrightness?: number
  activeApps?: number
}

export function useAIPredictiveAnalytics() {
  return trpc.ai.generatePredictiveAnalytics.useMutation()
}

export function useAIRecommendations() {
  return trpc.ai.generateRecommendations.useMutation()
}

export function useDeviceHistory() {
  return trpc.device.getHistory.useQuery({
    timeRange: '30min',
    limit: 30,
  }, {
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  })
}
