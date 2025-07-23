'use client'

import type { RiskStatus } from '@/types/dashboard'
import { AlertTriangle, Loader2, Minus, Thermometer, TrendingDown, TrendingUp } from 'lucide-react'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useDeviceInfo } from '@/hooks/use-device-info'
import { useWeather } from '@/hooks/use-weather'

export function HeatRiskMeter() {
  const { data: deviceInfo, isLoading: deviceLoading, error: deviceError } = useDeviceInfo()
  const { weatherData, isLoading: weatherLoading, error: weatherError } = useWeather()

  const getRiskLevel = (deviceTemp: number, ambientTemp: number, cpuLoad?: number): RiskStatus => {
    const tempDiff = deviceTemp - ambientTemp
    const loadFactor = cpuLoad ? cpuLoad / 100 : 0.5

    // Enhanced risk calculation considering multiple factors
    if (deviceTemp > 80 || tempDiff > 25)
      return 'critical'
    if (deviceTemp > 70 || tempDiff > 15 || (deviceTemp > 60 && loadFactor > 0.8))
      return 'critical'
    if (deviceTemp > 60 || tempDiff > 10 || (deviceTemp > 50 && loadFactor > 0.7))
      return 'caution'
    if (deviceTemp > 50 || tempDiff > 5)
      return 'caution'
    return 'safe'
  }

  const calculateRiskValue = (deviceTemp: number, ambientTemp: number, cpuLoad?: number): number => {
    const tempDiff = deviceTemp - ambientTemp
    const loadFactor = cpuLoad ? cpuLoad / 100 : 0.5

    // Multi-factor risk calculation (0-100%)
    let risk = 0

    // Temperature difference factor (0-40 points)
    risk += Math.min(40, (tempDiff / 30) * 40)

    // Absolute temperature factor (0-35 points)
    risk += Math.min(35, Math.max(0, (deviceTemp - 30) / 50 * 35))

    // CPU load factor (0-25 points)
    risk += loadFactor * 25

    return Math.min(100, Math.max(0, risk))
  }

  const getRiskConfig = (risk: RiskStatus) => {
    switch (risk) {
      case 'safe':
        return {
          color: '#10B981',
          bgColor: 'bg-emerald-500',
          textColor: 'text-emerald-600',
          bgClass: 'bg-emerald-50/50',
          borderClass: 'border-emerald-200',
          progressColor: 'bg-emerald-500',
          label: 'SAFE',
          icon: <Thermometer className="w-4 h-4" />,
          recommendation: 'Operating within safe parameters',
        }
      case 'caution':
        return {
          color: '#F59E0B',
          bgColor: 'bg-amber-500',
          textColor: 'text-amber-600',
          bgClass: 'bg-amber-50/50',
          borderClass: 'border-amber-200',
          progressColor: 'bg-amber-500',
          label: 'CAUTION',
          icon: <AlertTriangle className="w-4 h-4" />,
          recommendation: 'Monitor temperature closely',
        }
      case 'critical':
        return {
          color: '#EF4444',
          bgColor: 'bg-red-500',
          textColor: 'text-red-600',
          bgClass: 'bg-red-50/50',
          borderClass: 'border-red-200',
          progressColor: 'bg-red-500',
          label: 'CRITICAL',
          icon: <AlertTriangle className="w-4 h-4" />,
          recommendation: 'Take immediate action to cool down',
        }
    }
  }

  const getDeviceTemperature = () => {
    if (deviceInfo?.temperature?.cpu)
      return deviceInfo.temperature.cpu
    if (deviceInfo?.temperature?.cores && deviceInfo.temperature.cores.length > 0) {
      return deviceInfo.temperature.cores.reduce((sum, temp) => sum + temp, 0) / deviceInfo.temperature.cores.length
    }
    if (deviceInfo?.temperature?.max)
      return deviceInfo.temperature.max
    return 45 // Fallback
  }

  const getAmbientTemperature = () => {
    return weatherData?.temperature || 25 // Fallback to 25°C
  }

  const getCpuLoad = () => {
    return deviceInfo?.load?.currentLoad || undefined
  }

  const getTrend = (deviceTemp: number, riskValue: number): 'increasing' | 'decreasing' | 'stable' => {
    if (deviceTemp > 70 || riskValue > 75)
      return 'increasing'
    if (deviceTemp < 45 || riskValue < 25)
      return 'decreasing'
    return 'stable'
  }

  // Loading state
  if (deviceLoading || weatherLoading) {
    return (
      <Card className="backdrop-blur-sm border transition-all duration-300 shadow-lg hover:shadow-xl bg-gray-50/50 border-gray-200 h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Thermometer className="w-4 h-4" />
            Heat Risk
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
            <div className="text-sm text-gray-500">
              {deviceLoading && weatherLoading
                ? 'Loading device & weather...'
                : deviceLoading ? 'Loading device data...' : 'Loading weather data...'}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (deviceError && weatherError) {
    return (
      <Card className="backdrop-blur-sm border transition-all duration-300 shadow-lg hover:shadow-xl bg-red-50/50 border-red-200 h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Heat Risk
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center space-y-2">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
            <div className="text-sm text-red-600">Data unavailable</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const deviceTemp = getDeviceTemperature()
  const ambientTemp = getAmbientTemperature()
  const cpuLoad = getCpuLoad()
  const currentRisk = getRiskLevel(deviceTemp, ambientTemp, cpuLoad)
  const riskValue = calculateRiskValue(deviceTemp, ambientTemp, cpuLoad)
  const trend = getTrend(deviceTemp, riskValue)
  const riskConfig = getRiskConfig(currentRisk)

  const tempDiff = deviceTemp - ambientTemp
  const clampedRiskValue = Math.min(100, Math.max(0, riskValue))

  const getTrendIcon = () => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-3 h-3 text-red-500" />
      case 'decreasing':
        return <TrendingDown className="w-3 h-3 text-emerald-500" />
      case 'stable':
        return <Minus className="w-3 h-3 text-gray-500" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'increasing': return 'text-red-500'
      case 'decreasing': return 'text-emerald-500'
      case 'stable': return 'text-gray-500'
    }
  }

  const riskPercentage = `${clampedRiskValue.toFixed(1)}%`
  const deviceTempDisplay = `${deviceTemp.toFixed(1)}°C`
  const ambientTempDisplay = `${ambientTemp.toFixed(1)}°C`
  const tempDiffDisplay = `+${tempDiff.toFixed(1)}°C`

  return (
    <Card className={`backdrop-blur-sm border transition-all duration-300 shadow-lg hover:shadow-xl ${riskConfig.bgClass} ${riskConfig.borderClass} h-full`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={riskConfig.textColor}>
              {riskConfig.icon}
            </div>
            Heat Risk Monitor
          </div>
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className={`text-xs ${getTrendColor()}`}>
              {trend}
            </span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-center space-y-1">
          <div className="text-3xl font-bold text-gray-900">
            {riskPercentage}
          </div>
          <Badge className={`${riskConfig.bgColor} text-white text-xs px-3 py-1 font-semibold`}>
            {riskConfig.label}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Risk Level</span>
            <span>{riskPercentage}</span>
          </div>
          <div className="relative">
            <Progress
              value={clampedRiskValue}
              className="h-2 bg-gray-200"
            />
            <div
              className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ${riskConfig.progressColor}`}
              style={{ width: `${clampedRiskValue}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Safe</span>
            <span>Critical</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
          <div className="text-center space-y-1">
            <div className="text-lg font-bold text-gray-900">
              {deviceTempDisplay}
            </div>
            <div className="text-xs text-gray-500">
              {deviceError ? 'Device (Est.)' : 'Device'}
            </div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-lg font-bold text-gray-900">
              {ambientTempDisplay}
            </div>
            <div className="text-xs text-gray-500">
              {weatherError ? 'Ambient (Est.)' : 'Outdoor'}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className={`text-center py-2 px-3 rounded-lg ${riskConfig.bgClass} border ${riskConfig.borderClass}`}>
            <div className="text-sm font-medium text-gray-700">
              <span className="text-gray-500">Temp Diff: </span>
              <span className={`font-bold ${riskConfig.textColor}`}>
                {tempDiffDisplay}
              </span>
            </div>
          </div>

          {cpuLoad !== undefined && (
            <div className="text-center py-1">
              <div className="text-xs text-gray-500">
                CPU Load:
                {' '}
                <span className="font-medium text-gray-700">
                  {cpuLoad.toFixed(1)}
                  %
                </span>
              </div>
            </div>
          )}

          <div className="text-center">
            <div className="text-xs text-gray-600 italic">
              {riskConfig.recommendation}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
