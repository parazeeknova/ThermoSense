import type { WeatherData } from '@/types/dashboard'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocationContext } from '@/contexts/location-context'
import { WeatherService } from '@/lib/weather-service'

export const weatherKeys = {
  all: ['weather'] as const,
  byLocation: (location: string) => [...weatherKeys.all, 'location', location] as const,
  byCoords: (lat: number, lon: number) => [...weatherKeys.all, 'coords', lat, lon] as const,
  history: ['weather', 'history'] as const,
}

export interface WeatherDataWithTrend extends WeatherData {
  temperatureTrend?: number
  lastReading?: {
    temperature: number
    timestamp: string
  }
}

// Weather history management
function getWeatherHistory(): Array<{ temperature: number, timestamp: string, location: string }> {
  if (typeof window === 'undefined')
    return []
  const stored = localStorage.getItem('weather-history')
  return stored ? JSON.parse(stored) : []
}

function saveWeatherReading(temperature: number, location: string) {
  if (typeof window === 'undefined')
    return

  const history = getWeatherHistory()
  const now = new Date().toISOString()

  history.push({ temperature, timestamp: now, location })

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const recentHistory = history.filter(reading => reading.timestamp > oneDayAgo)

  localStorage.setItem('weather-history', JSON.stringify(recentHistory))
}

function calculateTemperatureTrend(currentTemp: number, location: string): number {
  const history = getWeatherHistory().filter(reading => reading.location === location)

  if (history.length < 2)
    return 0

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const recentReadings = history.filter(reading => reading.timestamp > oneHourAgo)

  if (recentReadings.length === 0) {
    const lastReading = history[history.length - 1]
    return currentTemp - lastReading.temperature
  }

  const avgRecentTemp = recentReadings.reduce((sum, reading) => sum + reading.temperature, 0) / recentReadings.length
  return currentTemp - avgRecentTemp
}

// Hook for getting weather by location
export function useWeatherByLocation(location: string) {
  return useQuery({
    queryKey: weatherKeys.byLocation(location),
    queryFn: async (): Promise<WeatherDataWithTrend> => {
      const data = await WeatherService.getCurrentWeather(location)

      const temperatureTrend = calculateTemperatureTrend(data.temperature, data.location)
      saveWeatherReading(data.temperature, data.location)

      const history = getWeatherHistory().filter(reading => reading.location === data.location)
      const lastReading = history.length > 1 ? history[history.length - 2] : undefined

      return {
        ...data,
        temperatureTrend,
        lastReading,
      }
    },
    enabled: !!location,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

// Hook for getting weather by coordinates
export function useWeatherByCoords(lat?: number, lon?: number) {
  return useQuery({
    queryKey: lat !== undefined && lon !== undefined ? weatherKeys.byCoords(lat, lon) : ['weather', 'coords', 'disabled'],
    queryFn: async (): Promise<WeatherDataWithTrend> => {
      const data = await WeatherService.getWeatherByCoordinates(lat!, lon!)
      const temperatureTrend = calculateTemperatureTrend(data.temperature, data.location)
      saveWeatherReading(data.temperature, data.location)

      const history = getWeatherHistory().filter(reading => reading.location === data.location)
      const lastReading = history.length > 1 ? history[history.length - 2] : undefined

      return {
        ...data,
        temperatureTrend,
        lastReading,
      }
    },
    enabled: lat !== undefined && lon !== undefined,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}

// Hook for changing location with mutation
export function useLocationMutation() {
  const queryClient = useQueryClient()
  const { updateGlobalLocation } = useLocationContext()

  return useMutation({
    mutationFn: async (location: string): Promise<{ data: WeatherDataWithTrend, location: string }> => {
      const data = await WeatherService.getCurrentWeather(location)

      const temperatureTrend = calculateTemperatureTrend(data.temperature, data.location)
      saveWeatherReading(data.temperature, data.location)

      const history = getWeatherHistory().filter(reading => reading.location === data.location)
      const lastReading = history.length > 1 ? history[history.length - 2] : undefined

      const enhancedData: WeatherDataWithTrend = {
        ...data,
        temperatureTrend,
        lastReading,
      }

      return { data: enhancedData, location }
    },
    onSuccess: ({ data, location }) => {
      updateGlobalLocation(location)

      queryClient.setQueryData(weatherKeys.byLocation(location), data)

      queryClient.invalidateQueries({ queryKey: weatherKeys.all })

      queryClient.removeQueries({
        queryKey: weatherKeys.all,
        predicate: (query) => {
          const queryKey = query.queryKey
          if (queryKey.length >= 3 && queryKey[1] === 'location' && queryKey[2] !== location) {
            return true
          }
          return false
        },
      })
    },
    onError: (error) => {
      console.error('Location change failed:', error)
    },
  })
}

// Hook for auto-location with mutation
export function useAutoLocationMutation() {
  const queryClient = useQueryClient()
  const { updateGlobalLocation, setCoordinates } = useLocationContext()

  return useMutation({
    mutationFn: async (): Promise<{ data: WeatherDataWithTrend, coords: { lat: number, lon: number } }> => {
      const coords = await WeatherService.getCurrentLocation()
      const data = await WeatherService.getWeatherByCoordinates(coords.lat, coords.lon)

      const temperatureTrend = calculateTemperatureTrend(data.temperature, data.location)
      saveWeatherReading(data.temperature, data.location)

      const history = getWeatherHistory().filter(reading => reading.location === data.location)
      const lastReading = history.length > 1 ? history[history.length - 2] : undefined

      const enhancedData: WeatherDataWithTrend = {
        ...data,
        temperatureTrend,
        lastReading,
      }

      return { data: enhancedData, coords }
    },
    onSuccess: ({ data, coords }) => {
      updateGlobalLocation(data.location)
      setCoordinates(coords)

      queryClient.setQueryData(weatherKeys.byCoords(coords.lat, coords.lon), data)
      if (data.location) {
        queryClient.setQueryData(weatherKeys.byLocation(data.location), data)
      }

      queryClient.invalidateQueries({ queryKey: weatherKeys.all })
    },
    onError: (error) => {
      console.error('Auto-location failed:', error)
    },
  })
}

// Main weather hook that provides a unified interface using global location state
export function useWeather() {
  const { currentLocation, coordinates } = useLocationContext()

  // Use coordinates if available, otherwise use location name
  const locationQuery = useWeatherByLocation(currentLocation)
  const coordsQuery = useWeatherByCoords(coordinates?.lat, coordinates?.lon)

  // Prefer coordinates data if available and enabled
  const activeQuery = coordinates ? coordsQuery : locationQuery

  const locationMutation = useLocationMutation()
  const autoLocationMutation = useAutoLocationMutation()

  const updateLocation = async (location: string) => {
    return locationMutation.mutateAsync(location)
  }

  const autoLocate = async () => {
    return autoLocationMutation.mutateAsync()
  }

  const refreshWeather = () => {
    activeQuery.refetch()
  }

  return {
    weatherData: activeQuery.data,
    currentLocation,
    coordinates,

    isLoading: activeQuery.isLoading || activeQuery.isFetching,
    isUpdatingLocation: locationMutation.isPending,
    isAutoLocating: autoLocationMutation.isPending,

    error: activeQuery.error || locationMutation.error || autoLocationMutation.error,

    updateLocation,
    autoLocate,
    refreshWeather,

    isSuccess: activeQuery.isSuccess,
    isError: activeQuery.isError,
  }
}

// Legacy hooks for backwards compatibility
export function useWeatherByLocationLegacy(location: string = 'Bhopal') {
  return useWeatherByLocation(location)
}
