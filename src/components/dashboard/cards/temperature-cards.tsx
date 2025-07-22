'use client'

import { AlertTriangle, CheckCircle, Thermometer, TrendingDown, TrendingUp } from 'lucide-react'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DeviceTemperatureCard({
  temperature,
  trend = 2.1,
}: {
  temperature: number
  trend?: number
}) {
  const getTempStatus = (temp: number) => {
    if (temp > 45) {
      return { status: 'Critical', color: 'bg-red-500', textColor: 'text-red-600', icon: AlertTriangle }
    }
    if (temp > 40) {
      return { status: 'Warm', color: 'bg-amber-500', textColor: 'text-amber-600', icon: AlertTriangle }
    }
    return { status: 'Normal', color: 'bg-emerald-500', textColor: 'text-emerald-600', icon: CheckCircle }
  }

  const tempStatus = getTempStatus(temperature)

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
            <Badge className={`${tempStatus.color} text-white text-xs px-2 py-1`}>
              {tempStatus.status}
            </Badge>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Today's Range</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-600 font-medium">
                {(temperature - 5).toFixed(1)}
                °C
              </span>
              <span className="text-gray-400">to</span>
              <span className="text-red-600 font-medium">
                {(temperature + 3).toFixed(1)}
                °C
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function OutdoorTemperatureCard({
  temperature,
  trend = -0.5,
}: {
  temperature: number
  trend?: number
}) {
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
          <div className="flex items-center text-sm text-teal-400 mb-3">
            <TrendingDown className="w-4 h-4 mr-1" />
            {trend.toFixed(1)}
            °C from last hour
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
              Heat index adjusted
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
