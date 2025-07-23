'use client'

import { AlertTriangle, CheckCircle, RefreshCw, Thermometer, TrendingDown, TrendingUp } from 'lucide-react'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDeviceInfo } from '@/hooks/use-device-info'
import { useWeather } from '@/hooks/use-weather'

interface DeviceTemperatureCardProps {
  fallbackTemperature?: number
  trend?: number
}

export function DeviceTemperatureCard({
  fallbackTemperature = 42,
  trend = 2.1,
}: DeviceTemperatureCardProps) {
  const { data: deviceInfo, isLoading, error } = useDeviceInfo()

  const getTempStatus = (temp: number) => {
    if (temp > 75) {
      return { status: 'Critical', color: 'bg-red-500', textColor: 'text-red-600', icon: AlertTriangle }
    }
    if (temp > 65) {
      return { status: 'Hot', color: 'bg-orange-500', textColor: 'text-orange-600', icon: AlertTriangle }
    }
    if (temp > 55) {
      return { status: 'Warm', color: 'bg-amber-500', textColor: 'text-amber-600', icon: AlertTriangle }
    }
    return { status: 'Normal', color: 'bg-emerald-500', textColor: 'text-emerald-600', icon: CheckCircle }
  }

  const getAverageTemp = (coreTemps: number[]) => {
    if (!coreTemps || coreTemps.length === 0)
      return null
    return coreTemps.reduce((sum, temp) => sum + temp, 0) / coreTemps.length
  }

  if (isLoading) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Device Temperature
          </CardTitle>
          <div className="p-2 bg-emerald-100 rounded-lg">
            <RefreshCw className="h-5 w-5 text-emerald-600 animate-spin" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-sm">Loading temperature...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Use device temperature if available, otherwise fall back to provided temperature
  let temperature = fallbackTemperature
  let tempSource = 'Estimated'

  if (deviceInfo?.temperature?.cpu) {
    temperature = deviceInfo.temperature.cpu
    tempSource = 'CPU'
  }
  else if (deviceInfo?.temperature?.cores && deviceInfo.temperature.cores.length > 0) {
    const avgTemp = getAverageTemp(deviceInfo.temperature.cores)
    if (avgTemp) {
      temperature = avgTemp
      tempSource = 'CPU Cores'
    }
  }
  else if (deviceInfo?.temperature?.max) {
    temperature = deviceInfo.temperature.max
    tempSource = 'Max Sensor'
  }

  const tempStatus = getTempStatus(temperature)
  const StatusIcon = tempStatus.icon

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          Device Temperature
        </CardTitle>
        <div className="p-2 bg-emerald-100 rounded-lg">
          <Thermometer className="h-5 w-5 text-emerald-600" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {temperature.toFixed(1)}
            °C
          </div>
          <div className="flex items-center text-sm text-emerald-600 mb-3">
            <TrendingUp className="w-4 h-4 mr-1" />
            +
            {trend.toFixed(1)}
            °C from last hour
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Status</span>
            <Badge className={`${tempStatus.color} text-white text-xs px-2 py-1 flex items-center gap-1`}>
              <StatusIcon className="w-3 h-3" />
              {tempStatus.status}
            </Badge>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>
                Source:
                {tempSource}
              </span>
              {error && <span className="text-red-500">Data limited</span>}
            </div>
            {deviceInfo?.temperature?.cores && deviceInfo.temperature.cores.length > 0 && (
              <div className="text-xs text-gray-500 mb-2">
                Core temps:
                {' '}
                {deviceInfo.temperature.cores.slice(0, 4).map(temp => `${temp.toFixed(1)}°C`).join(', ')}
                {deviceInfo.temperature.cores.length > 4 && '...'}
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-blue-600 font-medium">
                Safe: &lt;55°C
              </span>
              <span className="text-red-600 font-medium">
                Critical: &gt;75°C
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function OutdoorTemperatureCard() {
  const { weatherData, isLoading, error } = useWeather()

  const getWeatherCondition = (temp: number) => {
    if (temp > 35) {
      return { condition: 'Very Hot', icon: '🔥' }
    }
    if (temp > 25) {
      return { condition: 'Warm', icon: '☀️' }
    }
    if (temp > 15) {
      return { condition: 'Mild', icon: '⛅' }
    }
    return { condition: 'Cool', icon: '🌤️' }
  }

  const getTrendIcon = (trend: number) => {
    if (Math.abs(trend) < 0.1) {
      // No significant change
      return (
        <div className="w-4 h-4 mr-1 flex items-center justify-center">
          <div className="w-3 h-0.5 bg-gray-400 rounded"></div>
        </div>
      )
    }
    return trend > 0
      ? <TrendingUp className="w-4 h-4 mr-1" />
      : <TrendingDown className="w-4 h-4 mr-1" />
  }

  const getTrendText = (trend: number) => {
    const absTramp = Math.abs(trend)
    if (absTramp < 0.1)
      return '0.0°C from last hour'

    const sign = trend > 0 ? '+' : ''
    return `${sign}${trend.toFixed(1)}°C from last hour`
  }

  const getTrendColor = (trend: number) => {
    if (Math.abs(trend) < 0.1)
      return 'text-gray-400'

    return trend > 0 ? 'text-red-400' : 'text-blue-400'
  }

  if (isLoading) {
    return (
      <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-800/50 hover:bg-gray-900/95 transition-all duration-300 shadow-lg hover:shadow-xl h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-300 uppercase tracking-wide">
            Outdoor Temperature
          </CardTitle>
          <div className="p-2 bg-teal-900/50 rounded-lg">
            <RefreshCw className="h-5 w-5 text-teal-400 animate-spin" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-sm">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !weatherData) {
    return (
      <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-800/50 hover:bg-gray-900/95 transition-all duration-300 shadow-lg hover:shadow-xl h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-300 uppercase tracking-wide">
            Outdoor Temperature
          </CardTitle>
          <div className="p-2 bg-red-900/50 rounded-lg">
            <Thermometer className="h-5 w-5 text-red-400" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-sm">Data unavailable</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const temperature = weatherData.temperature
  const trend = weatherData.temperatureTrend || 0
  const weather = getWeatherCondition(temperature)

  return (
    <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-800/50 hover:bg-gray-900/95 transition-all duration-300 shadow-lg hover:shadow-xl h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-300 uppercase tracking-wide">
          Outdoor Temperature
        </CardTitle>
        <div className="p-2 bg-teal-900/50 rounded-lg">
          <Thermometer className="h-5 w-5 text-teal-400" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="text-3xl font-bold text-white mb-1">
            {temperature.toFixed(1)}
            °C
          </div>
          <div className={`flex items-center text-sm mb-3 ${getTrendColor(trend)}`}>
            {getTrendIcon(trend)}
            {getTrendText(trend)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Condition</span>
            <div className="flex items-center space-x-1">
              <span className="text-lg">{weather.icon}</span>
              <span className="text-teal-300 text-xs font-medium">{weather.condition}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Feels Like</span>
            </div>
            <div className="text-center">
              <span className="text-white font-medium text-sm">
                {(temperature + 2).toFixed(1)}
                °C
              </span>
            </div>
            <div className="text-center text-xs text-gray-400 mt-1">
              {weatherData.lastReading
                ? `Last: ${weatherData.lastReading.temperature.toFixed(1)}°C`
                : 'Heat index adjusted'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
