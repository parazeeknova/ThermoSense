'use client'

import { Thermometer, TrendingDown, TrendingUp } from 'lucide-react'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DeviceTemperatureCard({
  temperature,
  trend = 2.1,
}: {
  temperature: number
  trend?: number
}) {
  return (
    <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          Device Temperature
        </CardTitle>
        <div className="p-2 bg-emerald-100 rounded-lg">
          <Thermometer className="h-5 w-5 text-emerald-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {temperature.toFixed(1)}
          °C
        </div>
        <div className="flex items-center text-sm text-emerald-600">
          <TrendingUp className="w-4 h-4 mr-1" />
          +
          {trend.toFixed(1)}
          °C from last hour
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
  return (
    <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-800/50 hover:bg-gray-900/95 transition-all duration-300 shadow-lg hover:shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-300 uppercase tracking-wide">
          Outdoor Temperature
        </CardTitle>
        <div className="p-2 bg-teal-900/50 rounded-lg">
          <Thermometer className="h-5 w-5 text-teal-400" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white mb-2">
          {temperature.toFixed(1)}
          °C
        </div>
        <div className="flex items-center text-sm text-teal-400">
          <TrendingDown className="w-4 h-4 mr-1" />
          {trend.toFixed(1)}
          °C from last hour
        </div>
      </CardContent>
    </Card>
  )
}
