import { useLocationContext } from '@/contexts/location-context'
import { trpc } from '@/lib/trpc'

export const weatherKeys = {
  all: ['weather'] as const,
  byLocation: (location: string) => [...weatherKeys.all, 'location', location] as const,
  byCoords: (lat: number, lon: number) => [...weatherKeys.all, 'coords', lat, lon] as const,
  history: ['weather', 'history'] as const,
}

export interface WeatherDataWithTrend {
  temperature: number
  humidity: number
  windSpeed: number
  condition: string
  uvIndex: number
  location: string
  coordinates: {
    lat: number
    lng: number
  }
  lastUpdated: string
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

// Hook for getting weather by city name
export function useWeatherByCity(city: string) {
  return trpc.weather.getCurrentByCity.useQuery(
    { city },
    {
      enabled: !!city,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      select: (data): WeatherDataWithTrend => {
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
    },
  )
}

// Hook for getting weather by coordinates
export function useWeatherByCoords(lat?: number, lon?: number) {
  return trpc.weather.getCurrentByCoords.useQuery(
    { latitude: lat!, longitude: lon! },
    {
      enabled: lat !== undefined && lon !== undefined,
      staleTime: 5 * 60 * 1000,
      retry: 2,
      select: (data): WeatherDataWithTrend => {
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
    },
  )
}

// Hook for getting weather forecast
export function useWeatherForecast(lat?: number, lon?: number) {
  return trpc.weather.getForecast.useQuery(
    { latitude: lat!, longitude: lon! },
    {
      enabled: lat !== undefined && lon !== undefined,
      staleTime: 10 * 60 * 1000, // 10 minutes for forecast
      retry: 2,
    },
  )
}

// Main weather hook that provides a unified interface using global location state
export function useWeather() {
  const { currentLocation, coordinates } = useLocationContext()

  // Use coordinates if available, otherwise use location name
  const locationQuery = useWeatherByCity(currentLocation)
  const coordsQuery = useWeatherByCoords(coordinates?.lat, coordinates?.lon)

  // Prefer coordinates data if available and enabled
  const activeQuery = coordinates ? coordsQuery : locationQuery

  const refreshWeather = () => {
    activeQuery.refetch()
  }

  return {
    weatherData: activeQuery.data,
    currentLocation,
    coordinates,

    isLoading: activeQuery.isLoading || activeQuery.isFetching,
    error: activeQuery.error,

    refreshWeather,

    isSuccess: activeQuery.isSuccess,
    isError: activeQuery.isError,
  }
}

// Hook for changing location (you'll need to implement mutation logic)
export function useLocationMutation() {
  const { updateGlobalLocation: _updateGlobalLocation } = useLocationContext()

  // This would be implemented as a mutation that updates the location context
  // and invalidates relevant queries
  const updateLocation = async (location: string) => {
    _updateGlobalLocation(location)
    // Invalidate weather queries here
  }

  return {
    updateLocation,
    isPending: false, // Implement actual loading state
  }
}

// Hook for auto-location
export function useAutoLocationMutation() {
  const { updateGlobalLocation: _updateGlobalLocation, setCoordinates } = useLocationContext()

  const autoLocate = async () => {
    return new Promise<{ lat: number, lon: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          }
          setCoordinates(coords)
          resolve(coords)
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        },
      )
    })
  }

  return {
    autoLocate,
    isPending: false, // Implement actual loading state
  }
}
