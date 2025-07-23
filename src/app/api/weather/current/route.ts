import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { env } from '@/env'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')

    if (!env.NEXT_PUBLIC_OPENWEATHER_API_KEY) {
      return NextResponse.json(
        { error: 'Weather API key not configured' },
        { status: 500 },
      )
    }

    let weatherUrl: string
    if (city) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=metric`
    }
    else if (lat && lon) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=metric`
    }
    else {
      return NextResponse.json(
        { error: 'Either city or coordinates (lat, lon) are required' },
        { status: 400 },
      )
    }

    // Fetch weather data
    const weatherResponse = await fetch(weatherUrl)

    if (!weatherResponse.ok) {
      if (weatherResponse.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 },
        )
      }
      if (weatherResponse.status === 404) {
        return NextResponse.json(
          { error: `Location "${city || `${lat}, ${lon}`}" not found. Try using just the city name (e.g., "London", "Tokyo", "Paris")` },
          { status: 404 },
        )
      }
      throw new Error(`Weather API responded with status ${weatherResponse.status}`)
    }

    const weatherData = await weatherResponse.json()

    // Fetch UV index
    const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
    const uvResponse = await fetch(uvUrl)

    let uvIndex = 0
    if (uvResponse.ok) {
      const uvData = await uvResponse.json()
      uvIndex = uvData.value || 0
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

    const response = {
      temperature: Math.round(weatherData.main.temp * 10) / 10,
      humidity: weatherData.main.humidity,
      // Convert m/s to km/h
      windSpeed: Math.round(weatherData.wind.speed * 3.6 * 10) / 10,
      condition: conditionMap[weatherData.weather[0].main] || 'Clear',
      uvIndex: Math.round(uvIndex * 10) / 10,
      location: `${weatherData.name}, ${weatherData.sys.country}`,
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json(response)
  }
  catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 },
    )
  }
}
