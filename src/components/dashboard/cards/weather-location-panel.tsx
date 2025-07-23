'use client'

import { AlertCircle, BarChart3, Calendar, Cloud, CloudRain, Droplets, Eye, MapPin, Navigation, Plus, RefreshCw, Sun, Thermometer, TrendingUp, Wind, X } from 'lucide-react'
import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useWeather } from '@/hooks/use-weather'

const weatherConditions = {
  'Clear': { icon: <Sun className="w-6 h-6 text-yellow-500" />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  'Partly Cloudy': { icon: <Cloud className="w-6 h-6 text-gray-500" />, color: 'text-gray-600', bg: 'bg-gray-50' },
  'Cloudy': { icon: <Cloud className="w-6 h-6 text-gray-600" />, color: 'text-gray-700', bg: 'bg-gray-100' },
  'Rainy': { icon: <CloudRain className="w-6 h-6 text-blue-500" />, color: 'text-blue-600', bg: 'bg-blue-50' },
}

interface WeatherLocationPanelProps {
  onRefresh?: () => void
  onLocationChange?: (location: string) => void
}

interface ForecastDay {
  date: string
  day: string
  high: number
  low: number
  condition: string
  humidity: number
  windSpeed: number
  uvIndex: number
}

interface CompareLocation {
  id: string
  name: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  uvIndex: number
}

export function WeatherLocationPanel({
  onRefresh,
  onLocationChange,
}: WeatherLocationPanelProps) {
  const {
    weatherData,
    isLoading,
    isUpdatingLocation,
    isAutoLocating,
    error,
    updateLocation,
    autoLocate,
    refreshWeather,
  } = useWeather()

  const [showLocationInput, setShowLocationInput] = useState(false)
  const [newLocation, setNewLocation] = useState('')
  const [showForecast, setShowForecast] = useState(false)
  const [showCompare, setShowCompare] = useState(false)
  const [compareLocations, setCompareLocations] = useState<CompareLocation[]>([])
  const [newCompareLocation, setNewCompareLocation] = useState('')
  const [isLoadingForecast, setIsLoadingForecast] = useState(false)
  const [isLoadingCompare, setIsLoadingCompare] = useState(false)

  // Mock forecast data - in real implementation, this would come from an API
  const [forecastData] = useState<ForecastDay[]>([
    { date: '2024-01-15', day: 'Today', high: 25, low: 18, condition: 'Clear', humidity: 65, windSpeed: 12, uvIndex: 6 },
    { date: '2024-01-16', day: 'Tomorrow', high: 27, low: 19, condition: 'Partly Cloudy', humidity: 70, windSpeed: 15, uvIndex: 7 },
    { date: '2024-01-17', day: 'Wednesday', high: 23, low: 16, condition: 'Rainy', humidity: 85, windSpeed: 18, uvIndex: 3 },
    { date: '2024-01-18', day: 'Thursday', high: 22, low: 15, condition: 'Cloudy', humidity: 75, windSpeed: 10, uvIndex: 4 },
    { date: '2024-01-19', day: 'Friday', high: 26, low: 17, condition: 'Clear', humidity: 60, windSpeed: 8, uvIndex: 8 },
  ])

  const handleRefresh = async () => {
    refreshWeather()
    onRefresh?.()
  }

  const handleLocationUpdate = async () => {
    if (newLocation.trim()) {
      try {
        await updateLocation(newLocation.trim())
        onLocationChange?.(newLocation.trim())
        setShowLocationInput(false)
        setNewLocation('')
      }
      catch (err) {
        console.error('Failed to update location:', err)
      }
    }
  }

  const handleAutoLocate = async () => {
    try {
      await autoLocate()
    }
    catch (err) {
      console.error('Failed to auto-locate:', err)
    }
  }

  const handleShowForecast = async () => {
    setIsLoadingForecast(true)
    try {
      // In real implementation, fetch forecast data here
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      setShowForecast(true)
    }
    catch (err) {
      console.error('Failed to load forecast:', err)
    }
    finally {
      setIsLoadingForecast(false)
    }
  }

  const handleAddCompareLocation = async () => {
    if (!newCompareLocation.trim())
      return

    setIsLoadingCompare(true)
    try {
      // In real implementation, fetch weather data for the new location
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      const newLocation: CompareLocation = {
        id: Date.now().toString(),
        name: newCompareLocation.trim(),
        temperature: 20 + Math.random() * 15,
        condition: ['Clear', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
        humidity: 40 + Math.random() * 40,
        windSpeed: 5 + Math.random() * 20,
        uvIndex: Math.random() * 10,
      }

      setCompareLocations(prev => [...prev, newLocation])
      setNewCompareLocation('')
    }
    catch (err) {
      console.error('Failed to add compare location:', err)
    }
    finally {
      setIsLoadingCompare(false)
    }
  }

  const removeCompareLocation = (id: string) => {
    setCompareLocations(prev => prev.filter(loc => loc.id !== id))
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
              <div className="text-sm text-gray-600 mt-1">
                {error instanceof Error ? error.message : 'Unknown error'}
              </div>
              <Button
                onClick={refreshWeather}
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
              disabled={isUpdatingLocation}
            >
              <Navigation className="w-4 h-4 mr-1" />
              Change
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardTitle>
        <p className="text-sm text-gray-600">Current conditions affecting your device thermal state</p>
        {error && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            {error instanceof Error ? error.message : 'An error occurred'}
            {error instanceof Error && error.message.includes('API key') && (
              <div className="mt-2 text-xs space-y-1">
                <div>
                  Create a .env.local file with:
                </div>
                <code className="block bg-gray-100 p-1 rounded">
                  NEXT_PUBLIC_OPENWEATHER_API_KEY=your_key_here
                </code>
                <div>
                  Get a free key at:
                  {' '}
                  <a
                    href="https://openweathermap.org/api"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    openweathermap.org
                  </a>
                </div>
              </div>
            )}
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
                disabled={isUpdatingLocation}
              />
              <Button
                size="sm"
                onClick={handleLocationUpdate}
                disabled={isUpdatingLocation || !newLocation.trim()}
              >
                {isUpdatingLocation ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Update'}
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
            disabled={isAutoLocating}
          >
            {isAutoLocating ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <MapPin className="w-4 h-4 mr-1" />}
            Auto-locate
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleShowForecast}
            disabled={isLoadingForecast}
          >
            {isLoadingForecast ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Calendar className="w-4 h-4 mr-1" />}
            Forecast
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setShowCompare(true)}
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            Compare
          </Button>
        </div>

        {/* Forecast Section */}
        {showForecast && (
          <div className="mt-6 border-t border-gray-200 pt-6 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                5-Day Weather Forecast
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowForecast(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {forecastData.map((day, index) => {
                const condition = weatherConditions[day.condition as keyof typeof weatherConditions] || weatherConditions.Clear
                return (
                  <Card key={index} className={`${condition.bg} border`}>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="font-medium text-sm text-gray-900 mb-2">{day.day}</div>
                        <div className="flex justify-center mb-3">
                          {condition.icon}
                        </div>
                        <div className="space-y-2">
                          <div>
                            <div className="text-lg font-bold text-gray-900">
                              {day.high}
                              °
                            </div>
                            <div className="text-sm text-gray-600">
                              {day.low}
                              °
                            </div>
                          </div>
                          <div className="text-xs space-y-1">
                            <div className="flex items-center justify-center space-x-1">
                              <Droplets className="w-3 h-3 text-blue-500" />
                              <span>
                                {day.humidity}
                                %
                              </span>
                            </div>
                            <div className="flex items-center justify-center space-x-1">
                              <Wind className="w-3 h-3 text-gray-500" />
                              <span>
                                {day.windSpeed}
                                {' '}
                                km/h
                              </span>
                            </div>
                            <div className="flex items-center justify-center space-x-1">
                              <Sun className="w-3 h-3 text-orange-500" />
                              <span>
                                UV
                                {' '}
                                {day.uvIndex}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <div className="font-medium text-blue-900">Forecast Analysis</div>
                  <div className="text-sm text-blue-800 mt-1">
                    Temperature trending
                    {' '}
                    {forecastData[1].high > forecastData[0].high ? 'up' : 'down'}
                    {' '}
                    tomorrow.
                    {forecastData.some(day => day.condition === 'Rainy') && ' Rain expected this week - consider indoor activities for device protection.'}
                    {Math.max(...forecastData.map(d => d.high)) > 30 && ' High temperatures ahead may increase device thermal stress.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compare Section */}
        {showCompare && (
          <div className="mt-6 border-t border-gray-200 pt-6 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                Compare Weather Conditions
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowCompare(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Add Location Input */}
            <div className="mb-6">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add city to compare (e.g., Tokyo, London, Paris)"
                  value={newCompareLocation}
                  onChange={e => setNewCompareLocation(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCompareLocation()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={isLoadingCompare}
                />
                <Button
                  size="sm"
                  onClick={handleAddCompareLocation}
                  disabled={isLoadingCompare || !newCompareLocation.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoadingCompare ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Current Location */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Location</h4>
              {weatherData && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">{weatherData.location}</div>
                        <div className="text-sm text-gray-600">{weatherData.condition}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {weatherData.temperature.toFixed(1)}
                          °C
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mt-2">
                          <div>
                            Humidity:
                            {weatherData.humidity}
                            %
                          </div>
                          <div>
                            Wind:
                            {weatherData.windSpeed}
                            {' '}
                            km/h
                          </div>
                          <div>
                            UV:
                            {weatherData.uvIndex}
                          </div>
                          <div className={getUVIndexColor(weatherData.uvIndex)}>
                            {getUVIndexLabel(weatherData.uvIndex)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Compare Locations */}
            {compareLocations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Comparison Locations</h4>
                <div className="space-y-3">
                  {compareLocations.map((location) => {
                    const condition = weatherConditions[location.condition as keyof typeof weatherConditions] || weatherConditions.Clear
                    return (
                      <Card key={location.id} className={condition.bg}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              {condition.icon}
                              <div>
                                <div className="font-medium text-gray-900">{location.name}</div>
                                <div className="text-sm text-gray-600">{location.condition}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900">
                                  {location.temperature.toFixed(1)}
                                  °C
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mt-2">
                                  <div>
                                    Humidity:
                                    {location.humidity.toFixed(0)}
                                    %
                                  </div>
                                  <div>
                                    Wind:
                                    {location.windSpeed.toFixed(1)}
                                    {' '}
                                    km/h
                                  </div>
                                  <div>
                                    UV:
                                    {location.uvIndex.toFixed(1)}
                                  </div>
                                  <div className={getUVIndexColor(location.uvIndex)}>
                                    {getUVIndexLabel(location.uvIndex)}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCompareLocation(location.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Comparison Analysis */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <div className="font-medium text-blue-900">Location Comparison Analysis</div>
                      <div className="text-sm text-blue-800 mt-1">
                        {weatherData && compareLocations.length > 0 && (
                          <div className="space-y-1">
                            <div>
                              Your current location (
                              {weatherData.temperature.toFixed(1)}
                              °C) vs average of comparison locations (
                              {(compareLocations.reduce((sum, loc) => sum + loc.temperature, 0) / compareLocations.length).toFixed(1)}
                              °C)
                            </div>
                            {compareLocations.some(loc => Math.abs(loc.temperature - weatherData.temperature) > 10) && (
                              <div>⚠️ Significant temperature differences detected - consider location-specific device thermal management.</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {compareLocations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <div>Add locations above to start comparing weather conditions</div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
