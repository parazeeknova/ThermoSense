import type { WeatherData } from '@/types/dashboard'

export class WeatherService {
  static async getCurrentWeather(city: string): Promise<WeatherData> {
    try {
      const response = await fetch(`/api/weather/current?city=${encodeURIComponent(city)}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch weather data')
      }

      return await response.json()
    }
    catch (error) {
      console.error('Error fetching weather data:', error)
      throw error
    }
  }

  static async getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await fetch(`/api/weather/current?lat=${lat}&lon=${lon}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch weather data')
      }

      return await response.json()
    }
    catch (error) {
      console.error('Error fetching weather data by coordinates:', error)
      throw error
    }
  }

  static async getCurrentLocation(): Promise<{ lat: number, lon: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
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
}
