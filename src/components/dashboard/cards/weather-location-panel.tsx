'use client'

import type { WeatherData } from '@/types/dashboard'
import { AlertCircle, Cloud, CloudRain, Droplets, Eye, MapPin, Navigation, RefreshCw, Sun, Thermometer, Wind } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { WeatherService } from '@/lib/weather-service'

const weatherConditions = {
  'Clear': { icon: <Sun className="w-6 h-6 text-yellow-500" />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  'Partly Cloudy': { icon: <Cloud className="w-6 h-6 text-gray-500" />, color: 'text-gray-600', bg: 'bg-gray-50' },
  'Cloudy': { icon: <Cloud className="w-6 h-6 text-gray-600" />, color: 'text-gray-700', bg: 'bg-gray-100' },
  'Rainy': { icon: <CloudRain className="w-6 h-6 text-blue-500" />, color: 'text-blue-600', bg: 'bg-blue-50' },
}

interface WeatherLocationPanelProps {
  onRefresh?: () => void
  onLocationChange?: (location: string) => void
  defaultLocation?: string
}

export function WeatherLocationPanel({
  onRefresh,
  onLocationChange,
  defaultLocation = 'Bhopal',
}: WeatherLocationPanelProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLocationInput, setShowLocationInput] = useState(false)
  const [newLocation, setNewLocation] = useState('')
  const [currentLocation, setCurrentLocation] = useState(defaultLocation)

  const fetchWeatherData = async (location: string) => {
    try {
      setError(null)
      const data = await WeatherService.getCurrentWeather(location)
      setWeatherData(data)
      setCurrentLocation(location)
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data'
      setError(errorMessage)
      console.error('Weather fetch error:', err)
    }
  }

  const fetchWeatherByLocation = async () => {
    try {
      setError(null)
      const coords = await WeatherService.getCurrentLocation()
      const data = await WeatherService.getWeatherByCoordinates(coords.lat, coords.lon)
      setWeatherData(data)
      setCurrentLocation(data.location)
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get current location'
      setError(errorMessage)
      // Fallback to default location
      await fetchWeatherData(defaultLocation)
    }
  }

  useEffect(() => {
    const loadInitialWeather = async () => {
      setIsLoading(true)
      await fetchWeatherData(currentLocation)
      setIsLoading(false)
    }
    loadInitialWeather()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchWeatherData(currentLocation)
    onRefresh?.()
    setIsRefreshing(false)
  }

  const handleLocationUpdate = async () => {
    if (newLocation.trim()) {
      setIsLoading(true)
      await fetchWeatherData(newLocation.trim())
      onLocationChange?.(newLocation.trim())
      setShowLocationInput(false)
      setNewLocation('')
      setIsLoading(false)
    }
  }

  const handleAutoLocate = async () => {
    setIsLoading(true)
    await fetchWeatherByLocation()
    setIsLoading(false)
  }

  const getUVIndexColor = (uvIndex: number) => {
    if (uvIndex <= 2)
      return 'text-emerald-600'
    if (uvIndex <= 5)
      return 'text-yellow-600'
    if (uvIndex <= 7)
      return 'text-orange-600'
    if (uvIndex <= 10)
      return 'text-red-600'
    return 'text-purple-600'
  }

  const getUVIndexLabel = (uvIndex: number) => {
    if (uvIndex <= 2)
      return 'Low'
    if (uvIndex <= 5)
      return 'Moderate'
    if (uvIndex <= 7)
      return 'High'
    if (uvIndex <= 10)
      return 'Very High'
    return 'Extreme'
  }

  const getHumidityStatus = (humidity: number) => {
    if (humidity < 30)
      return { label: 'Low', color: 'text-red-500', description: 'Dry conditions' }
    if (humidity < 60)
      return { label: 'Optimal', color: 'text-emerald-500', description: 'Comfortable' }
    if (humidity < 80)
      return { label: 'High', color: 'text-yellow-500', description: 'Humid' }
    return { label: 'Very High', color: 'text-red-500', description: 'Very humid' }
  }

  if (isLoading) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
            Weather & Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="ml-2 text-gray-600">Loading weather data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && !weatherData) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
            Weather & Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="w-6 h-6 mr-2" />
            <div className="text-center">
              <div className="font-medium">Weather data unavailable</div>
              <div className="text-sm text-gray-600 mt-1">{error}</div>
              <Button
                onClick={() => fetchWeatherData(currentLocation)}
                className="mt-4"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!weatherData)
    return null

  const weatherCondition = weatherConditions[weatherData.condition as keyof typeof weatherConditions] || weatherConditions.Clear
  const humidityStatus = getHumidityStatus(weatherData.humidity)
  const lastUpdated = new Date(weatherData.lastUpdated).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-gray-900 flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
            Weather & Location
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLocationInput(!showLocationInput)}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Navigation className="w-4 h-4 mr-1" />
              Change
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardTitle>
        <p className="text-sm text-gray-600">Current conditions affecting your device thermal state</p>
        {error && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            {error}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {showLocationInput && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter city (e.g., London, Tokyo, Paris)"
                value={newLocation}
                onChange={e => setNewLocation(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLocationUpdate()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button size="sm" onClick={handleLocationUpdate}>
                Update
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowLocationInput(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="font-medium text-gray-900">{weatherData.location}</div>
              <div className="text-sm text-gray-600">
                Updated:
                {' '}
                {lastUpdated}
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-emerald-600 border-emerald-200">
            Live Data
          </Badge>
        </div>

        <div className={`p-6 rounded-lg ${weatherCondition.bg} border`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {weatherCondition.icon}
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {weatherData.temperature.toFixed(1)}
                  °C
                </div>
                <div className={`text-sm font-medium ${weatherCondition.color}`}>
                  {weatherData.condition}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Feels Like</div>
              <div className="text-lg font-semibold text-gray-900">
                {(weatherData.temperature + 2).toFixed(1)}
                °C
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Droplets className="w-4 h-4 text-blue-500" />
              <div>
                <div className="text-sm text-gray-600">Humidity</div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">
                    {weatherData.humidity}
                    %
                  </span>
                  <Badge variant="outline" className={`text-xs ${humidityStatus.color} border-current`}>
                    {humidityStatus.label}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Wind className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-sm text-gray-600">Wind Speed</div>
                <div className="font-semibold text-gray-900">
                  {weatherData.windSpeed}
                  {' '}
                  km/h
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Sun className="w-4 h-4 text-orange-500" />
              <div>
                <div className="text-sm text-gray-600">UV Index</div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">{weatherData.uvIndex}</span>
                  <Badge variant="outline" className={`text-xs ${getUVIndexColor(weatherData.uvIndex)} border-current`}>
                    {getUVIndexLabel(weatherData.uvIndex)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Eye className="w-4 h-4 text-purple-500" />
              <div>
                <div className="text-sm text-gray-600">Visibility</div>
                <div className="font-semibold text-gray-900">10+ km</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Humidity Level</span>
            <span className={`text-sm ${humidityStatus.color}`}>{humidityStatus.description}</span>
          </div>
          <Progress value={weatherData.humidity} className="h-3" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0% (Very Dry)</span>
            <span>50% (Optimal)</span>
            <span>100% (Saturated)</span>
          </div>
        </div>

        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-start space-x-3">
            <Thermometer className="w-5 h-5 text-orange-600 mt-1" />
            <div>
              <div className="font-medium text-orange-900">Thermal Impact Assessment</div>
              <div className="text-sm text-orange-800 mt-1">
                {weatherData.temperature > 30
                  ? `High ambient temperature (${weatherData.temperature.toFixed(1)}°C) may increase device thermal stress. Consider indoor use with air conditioning.`
                  : weatherData.temperature < 10
                    ? `Cold weather conditions may affect battery performance. Keep device warm when possible.`
                    : `Current temperature (${weatherData.temperature.toFixed(1)}°C) is optimal for device thermal management.`}
              </div>
              {weatherData.humidity > 70 && (
                <div className="text-sm text-orange-800 mt-2">
                  High humidity (
                  {weatherData.humidity}
                  %) may affect cooling efficiency. Ensure good ventilation.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleAutoLocate}
            disabled={isLoading}
          >
            <MapPin className="w-4 h-4 mr-1" />
            Auto-locate
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Cloud className="w-4 h-4 mr-1" />
            Forecast
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Thermometer className="w-4 h-4 mr-1" />
            Compare
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
