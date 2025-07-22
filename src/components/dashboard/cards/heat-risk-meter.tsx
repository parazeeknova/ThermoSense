'use client'

import type { RiskStatus } from '@/types/dashboard'
import { AlertTriangle, Minus, Thermometer, TrendingDown, TrendingUp } from 'lucide-react'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface HeatRiskMeterProps {
  currentRisk: RiskStatus
  riskValue: number
  trend: 'increasing' | 'decreasing' | 'stable'
  deviceTemp: number
  ambientTemp: number
}

export function HeatRiskMeter({
  currentRisk,
  riskValue = 35,
  trend = 'stable',
  deviceTemp,
  ambientTemp,
}: HeatRiskMeterProps) {
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
        }
    }
  }

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
            Heat Risk
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
        {/* Main Risk Display */}
        <div className="text-center space-y-1">
          <div className="text-3xl font-bold text-gray-900">
            {riskPercentage}
          </div>
          <Badge className={`${riskConfig.bgColor} text-white text-xs px-3 py-1 font-semibold`}>
            {riskConfig.label}
          </Badge>
        </div>

        {/* Risk Progress Bar */}
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

        {/* Temperature Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
          <div className="text-center space-y-1">
            <div className="text-lg font-bold text-gray-900">
              {deviceTempDisplay}
            </div>
            <div className="text-xs text-gray-500">Device</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-lg font-bold text-gray-900">
              {ambientTempDisplay}
            </div>
            <div className="text-xs text-gray-500">Ambient</div>
          </div>
        </div>

        {/* Temperature Difference */}
        <div className={`text-center py-2 px-3 rounded-lg ${riskConfig.bgClass} border ${riskConfig.borderClass}`}>
          <div className="text-sm font-medium text-gray-700">
            <span className="text-gray-500">Temp Diff: </span>
            <span className={`font-bold ${riskConfig.textColor}`}>
              {tempDiffDisplay}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
