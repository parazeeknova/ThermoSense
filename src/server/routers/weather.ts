import { z } from 'zod'
import { env } from '@/env'
import { keyStorageService } from '@/lib/key-storage-service'
import { publicProcedure, router } from '../trpc'

const LocationByNameInput = z.object({
  city: z.string(),
})

const LocationByCoordsInput = z.object({
  latitude: z.number(),
  longitude: z.number(),
})

async function getOpenWeatherAPIKey(): Promise<string> {
  try {
    const userKey = await keyStorageService.getKey('openweather')
    if (userKey) {
      return userKey
    }
  }
  catch (error) {
    console.warn('Failed to retrieve user-configured OpenWeather API key:', error)
  }

  const envKey = env.NEXT_PUBLIC_OPENWEATHER_API_KEY || ''
  if (!envKey) {
    console.warn('No OpenWeather API key found. Please configure one in the dashboard or set NEXT_PUBLIC_OPENWEATHER_API_KEY environment variable.')
  }
  return envKey
}

async function fetchWeatherData(url: string) {
  const response = await fetch(url)

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid API key')
    }
    if (response.status === 404) {
      throw new Error('Location not found')
    }
    throw new Error(`Weather API responded with status ${response.status}`)
  }

  return response.json()
}

export const weatherRouter = router({
  getCurrentByCity: publicProcedure
    .input(LocationByNameInput)
    .query(async ({ input }) => {
      try {
        const apiKey = await getOpenWeatherAPIKey()
        if (!apiKey) {
          throw new Error('Weather API key not configured')
        }

        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(input.city)}&appid=${apiKey}&units=metric`
        const weatherData = await fetchWeatherData(weatherUrl)

        const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${apiKey}`
        let uvIndex = 0
        try {
          const uvResponse = await fetch(uvUrl)
          if (uvResponse.ok) {
            const uvData = await uvResponse.json()
            uvIndex = uvData.value || 0
          }
        }
        catch (error) {
          console.warn('Failed to fetch UV index:', error)
        }

        // Map weather condition
        const conditionMap: Record<string, string> = {
          Clear: 'Clear',
          Clouds: 'Partly Cloudy',
          Rain: 'Rainy',
          Drizzle: 'Rainy',
          Thunderstorm: 'Rainy',
          Snow: 'Cloudy',
          Mist: 'Cloudy',
          Fog: 'Cloudy',
          Haze: 'Cloudy',
        }

        return {
          temperature: Math.round(weatherData.main.temp * 10) / 10,
          humidity: weatherData.main.humidity,
          windSpeed: Math.round(weatherData.wind.speed * 3.6 * 10) / 10,
          condition: conditionMap[weatherData.weather[0].main] || 'Clear',
          uvIndex: Math.round(uvIndex * 10) / 10,
          location: `${weatherData.name}, ${weatherData.sys.country}`,
          coordinates: {
            lat: weatherData.coord.lat,
            lng: weatherData.coord.lon,
          },
          lastUpdated: new Date().toISOString(),
        }
      }
      catch (error) {
        console.error('Error fetching weather:', error)
        throw new Error('Failed to fetch weather information')
      }
    }),

  getCurrentByCoords: publicProcedure
    .input(LocationByCoordsInput)
    .query(async ({ input }) => {
      try {
        const apiKey = await getOpenWeatherAPIKey()
        if (!apiKey) {
          throw new Error('Weather API key not configured')
        }

        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${input.latitude}&lon=${input.longitude}&appid=${apiKey}&units=metric`
        const weatherData = await fetchWeatherData(weatherUrl)

        const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${apiKey}`
        let uvIndex = 0
        try {
          const uvResponse = await fetch(uvUrl)
          if (uvResponse.ok) {
            const uvData = await uvResponse.json()
            uvIndex = uvData.value || 0
          }
        }
        catch (error) {
          console.warn('Failed to fetch UV index:', error)
        }

        // Map weather condition
        const conditionMap: Record<string, string> = {
          Clear: 'Clear',
          Clouds: 'Partly Cloudy',
          Rain: 'Rainy',
          Drizzle: 'Rainy',
          Thunderstorm: 'Rainy',
          Snow: 'Cloudy',
          Mist: 'Cloudy',
          Fog: 'Cloudy',
          Haze: 'Cloudy',
        }

        return {
          temperature: Math.round(weatherData.main.temp * 10) / 10,
          humidity: weatherData.main.humidity,
          windSpeed: Math.round(weatherData.wind.speed * 3.6 * 10) / 10,
          condition: conditionMap[weatherData.weather[0].main] || 'Clear',
          uvIndex: Math.round(uvIndex * 10) / 10,
          location: `${weatherData.name}, ${weatherData.sys.country}`,
          coordinates: {
            lat: weatherData.coord.lat,
            lng: weatherData.coord.lon,
          },
          lastUpdated: new Date().toISOString(),
        }
      }
      catch (error) {
        console.error('Error fetching weather by coordinates:', error)
        throw new Error('Failed to fetch weather information')
      }
    }),

  getForecast: publicProcedure
    .input(LocationByCoordsInput)
    .query(async ({ input }) => {
      try {
        const apiKey = await getOpenWeatherAPIKey()
        if (!apiKey) {
          throw new Error('Weather API key not configured')
        }

        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${input.latitude}&lon=${input.longitude}&appid=${apiKey}&units=metric`
        const forecastData = await fetchWeatherData(forecastUrl)

        interface ForecastItem {
          dt: number
          main: {
            temp_min: number
            temp_max: number
            humidity: number
          }
          weather: Array<{
            description: string
            icon: string
          }>
        }

        const dailyForecasts = (forecastData.list as ForecastItem[])
          .filter((_, index: number) => index % 8 === 0) // Get one forecast per day (every 8th item = 24 hours)
          .slice(0, 5) // Get 5 days
          .map((item: ForecastItem) => ({
            date: new Date(item.dt * 1000).toISOString(),
            temperature: {
              min: Math.round(item.main.temp_min * 10) / 10,
              max: Math.round(item.main.temp_max * 10) / 10,
            },
            humidity: item.main.humidity,
            description: item.weather[0].description,
            icon: item.weather[0].icon,
          }))

        return {
          location: {
            latitude: input.latitude,
            longitude: input.longitude,
          },
          forecast: dailyForecasts,
          timestamp: new Date().toISOString(),
        }
      }
      catch (error) {
        console.error('Error fetching forecast:', error)
        throw new Error('Failed to fetch weather forecast')
      }
    }),
})
