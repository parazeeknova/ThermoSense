'use client'

import type { RiskStatus } from '@/types/dashboard'
import { AlertTriangle, Droplets, Info, Loader2, Minus, Thermometer, TrendingDown, TrendingUp, Wind, Zap } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDeviceInfo } from '@/hooks/use-device-info'
import { useWeather } from '@/hooks/use-weather'

interface TemperatureHistory {
  timestamp: number
  temperature: number
  cpuLoad?: number
  ambientTemp: number
}

interface RiskFactors {
  tempDifference: number
  absoluteTemp: number
  cpuLoad: number
  trend: number
  humidity: number
  timeOfDay: number
}

interface RiskBreakdown {
  tempDiffScore: number
  absoluteTempScore: number
  cpuLoadScore: number
  trendScore: number
  humidityScore: number
  timeScore: number
  total: number
}

export function HeatRiskMeter() {
  const { data: deviceInfo, isLoading: deviceLoading, error: deviceError } = useDeviceInfo()
  const { weatherData, isLoading: weatherLoading, error: weatherError } = useWeather()

  const [temperatureHistory, setTemperatureHistory] = useState<TemperatureHistory[]>([])
  const [showDetails, setShowDetails] = useState(false)
  const [animatedRiskValue, setAnimatedRiskValue] = useState(0)

  const calculateAdvancedRisk = (
    deviceTemp: number,
    ambientTemp: number,
    cpuLoad: number = 50,
    history: TemperatureHistory[] = [],
    humidity: number = 50,
  ): { risk: RiskStatus, value: number, breakdown: RiskBreakdown, prediction: number } => {
    const tempDiff = deviceTemp - ambientTemp
    const currentHour = new Date().getHours()

    let trend = 0
    if (history.length >= 3) {
      const recent = history.slice(-3)
      const tempTrend = (recent[2].temperature - recent[0].temperature) / 2
      trend = Math.max(-10, Math.min(10, tempTrend))
    }

    const factors: RiskFactors = {
      tempDifference: Math.min(100, Math.max(0, (tempDiff / 35) * 100)),
      absoluteTemp: Math.min(100, Math.max(0, (deviceTemp - 20) / 60 * 100)),
      cpuLoad,
      trend: Math.min(100, Math.max(0, (trend + 10) / 20 * 100)),
      humidity,
      timeOfDay: currentHour >= 12 && currentHour <= 18 ? 20 : 0, // Peak hours penalty
    }

    // Weighted scoring
    const weights = {
      tempDiff: 0.3,
      absoluteTemp: 0.25,
      cpuLoad: 0.2,
      trend: 0.15,
      humidity: 0.05,
      timeOfDay: 0.05,
    }

    const breakdown: RiskBreakdown = {
      tempDiffScore: factors.tempDifference * weights.tempDiff,
      absoluteTempScore: factors.absoluteTemp * weights.absoluteTemp,
      cpuLoadScore: factors.cpuLoad * weights.cpuLoad,
      trendScore: factors.trend * weights.trend,
      humidityScore: (factors.humidity / 100) * 15 * weights.humidity,
      timeScore: factors.timeOfDay * weights.timeOfDay,
      total: 0,
    }

    breakdown.total = breakdown.tempDiffScore + breakdown.absoluteTempScore
      + breakdown.cpuLoadScore + breakdown.trendScore
      + breakdown.humidityScore + breakdown.timeScore

    const riskValue = Math.min(100, Math.max(0, breakdown.total))

    // Determine risk level with more nuanced thresholds
    let riskLevel: RiskStatus
    if (riskValue >= 75 || deviceTemp >= 85) {
      riskLevel = 'critical'
    }
    else if (riskValue >= 45 || deviceTemp >= 65) {
      riskLevel = 'caution'
    }
    else {
      riskLevel = 'safe'
    }

    // Simple prediction (next 30 minutes)
    const prediction = Math.min(100, Math.max(0, riskValue + (trend * 2)))

    return { risk: riskLevel, value: riskValue, breakdown, prediction }
  }

  const getRiskConfig = (risk: RiskStatus, value: number) => {
    const baseConfig = {
      safe: {
        color: '#10B981',
        bgColor: 'bg-emerald-500',
        textColor: 'text-emerald-600',
        bgClass: 'bg-emerald-50/50',
        borderClass: 'border-emerald-200',
        progressColor: 'bg-gradient-to-r from-emerald-400 to-emerald-600',
        label: 'SAFE',
        icon: <Thermometer className="w-4 h-4" />,
        pulse: false,
      },
      caution: {
        color: '#F59E0B',
        bgColor: 'bg-amber-500',
        textColor: 'text-amber-600',
        bgClass: 'bg-amber-50/50',
        borderClass: 'border-amber-200',
        progressColor: 'bg-gradient-to-r from-amber-400 to-amber-600',
        label: 'CAUTION',
        icon: <AlertTriangle className="w-4 h-4" />,
        pulse: true,
      },
      critical: {
        color: '#EF4444',
        bgColor: 'bg-red-500',
        textColor: 'text-red-600',
        bgClass: 'bg-red-50/50',
        borderClass: 'border-red-200',
        progressColor: 'bg-gradient-to-r from-red-400 to-red-600',
        label: 'CRITICAL',
        icon: <AlertTriangle className="w-4 h-4" />,
        pulse: true,
      },
    }

    const config = baseConfig[risk]

    // Enhanced recommendations based on risk value
    let recommendation = ''
    if (risk === 'critical') {
      if (value > 90)
        recommendation = 'IMMEDIATE ACTION: Shut down non-essential processes'
      else recommendation = 'Reduce CPU load and improve ventilation'
    }
    else if (risk === 'caution') {
      if (value > 60)
        recommendation = 'Monitor closely, consider reducing workload'
      else recommendation = 'Watch temperature trends'
    }
    else {
      recommendation = 'Operating optimally'
    }

    return { ...config, recommendation }
  }

  const getTemperatureData = () => {
    const deviceTemp = deviceInfo?.temperature?.cpu
      || (deviceInfo?.temperature?.cores?.reduce((sum, temp) => sum + temp, 0) || 0) / (deviceInfo?.temperature?.cores?.length || 1)
      || deviceInfo?.temperature?.max || 45

    const ambientTemp = weatherData?.temperature || 25
    const cpuLoad = deviceInfo?.load?.currentLoad || 50
    const humidity = weatherData?.humidity || 50

    return { deviceTemp, ambientTemp, cpuLoad, humidity }
  }

  // Update temperature history
  useEffect(() => {
    if (deviceInfo && weatherData) {
      const { deviceTemp, ambientTemp, cpuLoad } = getTemperatureData()
      const now = Date.now()

      setTemperatureHistory((prev) => {
        const newEntry: TemperatureHistory = {
          timestamp: now,
          temperature: deviceTemp,
          cpuLoad,
          ambientTemp,
        }

        // Keep last 20 entries (for trends)
        const updated = [...prev, newEntry].slice(-20)
        return updated
      })
    }
  }, [deviceInfo, weatherData])

  useEffect(() => {
    if (deviceInfo && weatherData) {
      const { deviceTemp, ambientTemp, cpuLoad, humidity } = getTemperatureData()
      const { value } = calculateAdvancedRisk(deviceTemp, ambientTemp, cpuLoad, temperatureHistory, humidity)

      const interval = setInterval(() => {
        setAnimatedRiskValue((prev) => {
          const diff = value - prev
          if (Math.abs(diff) < 0.5)
            return value
          return prev + (diff * 0.1)
        })
      }, 50)

      return () => clearInterval(interval)
    }
  }, [deviceInfo, weatherData, temperatureHistory])

  const currentData = useMemo(() => {
    if (!deviceInfo && !weatherData)
      return null

    const { deviceTemp, ambientTemp, cpuLoad, humidity } = getTemperatureData()
    return calculateAdvancedRisk(deviceTemp, ambientTemp, cpuLoad, temperatureHistory, humidity)
  }, [deviceInfo, weatherData, temperatureHistory])

  const getTrendIndicator = () => {
    if (temperatureHistory.length < 3)
      return { icon: <Minus className="w-3 h-3" />, color: 'text-gray-500', label: 'stable' }

    const recent = temperatureHistory.slice(-3)
    const trend = (recent[2].temperature - recent[0].temperature) / 2

    if (trend > 1)
      return { icon: <TrendingUp className="w-3 h-3" />, color: 'text-red-500', label: 'rising' }
    if (trend < -1)
      return { icon: <TrendingDown className="w-3 h-3" />, color: 'text-emerald-500', label: 'falling' }
    return { icon: <Minus className="w-3 h-3" />, color: 'text-gray-500', label: 'stable' }
  }

  // Loading state with enhanced animation
  if (deviceLoading || weatherLoading) {
    return (
      <Card className="backdrop-blur-sm border transition-all duration-300 shadow-lg hover:shadow-xl bg-gray-50/50 border-gray-200 h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <div className="animate-pulse">
              <Thermometer className="w-4 h-4" />
            </div>
            Advanced Heat Risk Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <div className="text-center space-y-3">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
              <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-blue-200 mx-auto"></div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-600">
                Analyzing thermal conditions...
              </div>
              <div className="text-xs text-gray-500">
                {deviceLoading && weatherLoading
                  ? 'Loading device & weather data'
                  : deviceLoading ? 'Loading device sensors' : 'Loading weather conditions'}
              </div>
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
            Heat Risk Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <div className="text-center space-y-2">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
            <div className="text-sm text-red-600 font-medium">Sensors Unavailable</div>
            <div className="text-xs text-red-500">Check device connections</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentData)
    return null

  const { risk, value, breakdown, prediction } = currentData
  const { deviceTemp, ambientTemp, cpuLoad, humidity } = getTemperatureData()
  const riskConfig = getRiskConfig(risk, value)
  const trendIndicator = getTrendIndicator()
  const tempDiff = deviceTemp - ambientTemp

  return (
    <Card className={`backdrop-blur-sm border transition-all duration-500 shadow-lg hover:shadow-xl ${riskConfig.bgClass} ${riskConfig.borderClass} h-full relative overflow-hidden group`}>
      {/* Animated background for critical alerts */}
      {riskConfig.pulse && (
        <div className={`absolute inset-0 ${riskConfig.bgClass} opacity-30 animate-pulse`}></div>
      )}

      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`${riskConfig.textColor} ${riskConfig.pulse ? 'animate-pulse' : ''}`}>
              {riskConfig.icon}
            </div>
            <span>Advanced Heat Risk</span>
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="opacity-50 hover:opacity-100 transition-opacity"
              title="Show risk breakdown"
            >
              <Info className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {trendIndicator.icon}
              <span className={`text-xs ${trendIndicator.color} font-medium`}>
                {trendIndicator.label}
              </span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        {/* Main Risk Display */}
        <div className="text-center space-y-2">
          <div className="relative">
            <div className="text-4xl font-bold text-gray-900 transition-all duration-500">
              {animatedRiskValue.toFixed(1)}
              %
            </div>
            {prediction > value + 5 && (
              <div className="text-xs text-orange-600 flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                Predicted:
                {' '}
                {prediction.toFixed(1)}
                %
              </div>
            )}
          </div>
          <Badge className={`${riskConfig.bgColor} text-white text-xs px-4 py-1.5 font-semibold transition-all duration-300 hover:scale-105`}>
            {riskConfig.label}
          </Badge>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Risk Level</span>
            <span>
              {animatedRiskValue.toFixed(1)}
              %
            </span>
          </div>
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out ${riskConfig.progressColor}`}
              style={{ width: `${Math.min(100, animatedRiskValue)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
            {/* Risk zone indicators */}
            <div className="absolute top-0 left-[45%] w-px h-full bg-amber-400/50"></div>
            <div className="absolute top-0 left-[75%] w-px h-full bg-red-400/50"></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Safe</span>
            <span className="text-amber-500">Caution</span>
            <span className="text-red-500">Critical</span>
          </div>
        </div>

        {/* Temperature Information */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
          <div className="text-center space-y-1">
            <div className="text-lg font-bold text-gray-900">
              {deviceTemp.toFixed(1)}
              °C
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
              <Zap className="w-3 h-3" />
              Device
            </div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-lg font-bold text-gray-900">
              {ambientTemp.toFixed(1)}
              °C
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
              <Wind className="w-3 h-3" />
              Ambient
            </div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-lg font-bold text-gray-900">
              +
              {tempDiff.toFixed(1)}
              °C
            </div>
            <div className="text-xs text-gray-500">
              Diff
            </div>
          </div>
        </div>

        {/* Detailed Breakdown (Expandable) */}
        {showDetails && (
          <div className="space-y-3 pt-2 border-t border-gray-200 animate-in slide-in-from-top-2 duration-300">
            <div className="text-xs font-semibold text-gray-600 mb-2">Risk Factors Breakdown:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Temp Diff:</span>
                <span className="font-medium">{breakdown.tempDiffScore.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Absolute:</span>
                <span className="font-medium">{breakdown.absoluteTempScore.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">CPU Load:</span>
                <span className="font-medium">{breakdown.cpuLoadScore.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Trend:</span>
                <span className="font-medium">{breakdown.trendScore.toFixed(1)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Additional Metrics */}
        <div className="flex justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>
              CPU:
              {cpuLoad.toFixed(1)}
              %
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Droplets className="w-3 h-3" />
            <span>
              Humidity:
              {humidity.toFixed(0)}
              %
            </span>
          </div>
        </div>

        {/* Recommendation */}
        <div className={`text-center py-2 px-3 rounded-lg ${riskConfig.bgClass} border ${riskConfig.borderClass} transition-all duration-300`}>
          <div className="text-sm font-medium text-gray-700">
            {riskConfig.recommendation}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
