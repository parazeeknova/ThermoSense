'use client'

import { AlertTriangle, Battery, Clock, TrendingUp } from 'lucide-react'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useDeviceInfo } from '@/hooks/use-device-info'

export function BatteryCard() {
  const { data: deviceInfo, isLoading, error } = useDeviceInfo()

  const getBatteryStatus = (level: number) => {
    if (level > 80) {
      return { status: 'Excellent', color: 'bg-emerald-500', textColor: 'text-emerald-600' }
    }
    if (level > 50) {
      return { status: 'Good', color: 'bg-blue-500', textColor: 'text-blue-600' }
    }
    if (level > 20) {
      return { status: 'Low', color: 'bg-amber-500', textColor: 'text-amber-600' }
    }
    return { status: 'Critical', color: 'bg-red-500', textColor: 'text-red-600' }
  }

  const formatTimeRemaining = (minutes: number | null) => {
    if (!minutes || minutes <= 0)
      return 'Calculating...'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const calculateHealth = (maxCapacity: number, designedCapacity: number) => {
    if (!maxCapacity || !designedCapacity)
      return 0
    return Math.round((maxCapacity / designedCapacity) * 100)
  }

  if (isLoading) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Battery Level
          </CardTitle>
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Battery className="h-5 w-5 text-emerald-600 animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-sm">Loading battery info...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !deviceInfo?.battery) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Battery Level
          </CardTitle>
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-sm">Battery info unavailable</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { battery } = deviceInfo

  if (!battery.hasBattery) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Battery Level
          </CardTitle>
          <div className="p-2 bg-gray-100 rounded-lg">
            <Battery className="h-5 w-5 text-gray-600" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-sm">No battery detected</div>
            <div className="text-xs mt-1">AC powered device</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const batteryLevel = Math.round(battery.percent)
  const batteryStatus = getBatteryStatus(batteryLevel)
  const health = calculateHealth(battery.maxCapacity, battery.designedCapacity)

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          Battery Level
        </CardTitle>
        <div className="p-2 bg-emerald-100 rounded-lg">
          <Battery className={`h-5 w-5 text-emerald-600 ${battery.isCharging ? 'animate-pulse' : ''}`} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {batteryLevel}
            %
          </div>
          <Progress value={batteryLevel} className="h-3 bg-gray-200 [&>div]:bg-emerald-500 mb-3" />
          {battery.isCharging && (
            <div className="flex items-center text-sm text-emerald-600 mb-2">
              <TrendingUp className="w-4 h-4 mr-1" />
              Charging
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Status</span>
            <Badge className={`${batteryStatus.color} text-white text-xs px-2 py-1`}>
              {batteryStatus.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center text-xs text-gray-500 mb-1">
                <Clock className="w-3 h-3 mr-1" />
                {battery.isCharging ? 'Full in' : 'Time Left'}
              </div>
              <div className="text-sm font-medium text-gray-900">
                {formatTimeRemaining(battery.timeRemaining)}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-xs text-gray-500 mb-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                Health
              </div>
              <div className={`text-sm font-medium ${health > 80 ? 'text-emerald-600' : health > 60 ? 'text-amber-600' : 'text-red-600'}`}>
                {health}
                %
              </div>
            </div>
          </div>

          <div className="text-center pt-1">
            <div className="text-xs text-gray-400">
              Cycle Count:
              {' '}
              {battery.cycleCount || 'N/A'}
              {battery.model && (
                <div className="mt-1">
                  {battery.manufacturer}
                  {' '}
                  {battery.model}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
