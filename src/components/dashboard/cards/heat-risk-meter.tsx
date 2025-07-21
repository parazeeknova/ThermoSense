'use client'

import type { RiskStatus } from '@/types/dashboard'
import { Minus, Thermometer, TrendingDown, TrendingUp } from 'lucide-react'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
          bgClass: 'bg-emerald-50',
          borderClass: 'border-emerald-200',
          label: 'SAFE',
          description: 'Optimal conditions',
        }
      case 'caution':
        return {
          color: '#F59E0B',
          bgColor: 'bg-amber-500',
          textColor: 'text-amber-600',
          bgClass: 'bg-amber-50',
          borderClass: 'border-amber-200',
          label: 'CAUTION',
          description: 'Monitor closely',
        }
      case 'critical':
        return {
          color: '#EF4444',
          bgColor: 'bg-red-500',
          textColor: 'text-red-600',
          bgClass: 'bg-red-50',
          borderClass: 'border-red-200',
          label: 'CRITICAL',
          description: 'Take action now',
        }
    }
  }

  const riskConfig = getRiskConfig(currentRisk)
  const tempDiff = deviceTemp - ambientTemp

  const getTrendIcon = () => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-red-500" />
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-emerald-500" />
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'increasing': return 'text-red-500'
      case 'decreasing': return 'text-emerald-500'
      case 'stable': return 'text-gray-500'
    }
  }

  const gaugeRotation = -90 + (riskValue / 100) * 180

  return (
    <Card className={`backdrop-blur-sm border transition-all duration-300 shadow-lg hover:shadow-xl ${riskConfig.bgClass} ${riskConfig.borderClass}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-900 flex items-center justify-between">
          <div className="flex items-center">
            <Thermometer className={`w-5 h-5 mr-2 ${riskConfig.textColor}`} />
            Heat Risk Meter
          </div>
          <div className="flex items-center space-x-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {trend.charAt(0).toUpperCase() + trend.slice(1)}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative flex items-center justify-center">
          <div className="relative w-48 h-24 overflow-hidden">
            <svg
              className="w-full h-full"
              viewBox="0 0 200 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
              </defs>

              <path
                d="M 25 75 A 75 75 0 0 1 175 75"
                stroke="#E5E7EB"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
              />

              <path
                d="M 25 75 A 75 75 0 0 1 175 75"
                stroke="url(#riskGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(riskValue / 100) * 235.6} 235.6`}
                className="transition-all duration-700 ease-out"
              />

              <g stroke="#9CA3AF" strokeWidth="1" opacity="0.5">
                <line x1="25" y1="75" x2="35" y2="85" />
                <line x1="100" y1="25" x2="100" y2="35" />
                <line x1="175" y1="75" x2="165" y2="85" />
              </g>
            </svg>

            <div
              className="absolute top-1/2 left-1/2 w-1 h-16 bg-gray-800 origin-bottom transform -translate-x-1/2 transition-transform duration-700 ease-out"
              style={{
                transform: `translate(-50%, -100%) rotate(${gaugeRotation}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div className="absolute -top-2 -left-1 w-3 h-3 bg-gray-800 rounded-full"></div>
            </div>

            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-gray-800 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>

          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {riskValue}
              %
            </div>
            <div className="text-xs text-gray-600">Risk Level</div>
          </div>
        </div>

        <div className="text-center">
          <Badge className={`${riskConfig.bgColor} text-white text-sm px-4 py-2 font-bold`}>
            {riskConfig.label}
          </Badge>
          <p className="text-sm text-gray-600 mt-1">{riskConfig.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {deviceTemp.toFixed(1)}
              °C
            </div>
            <div className="text-xs text-gray-600">Device Temp</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {ambientTemp.toFixed(1)}
              °C
            </div>
            <div className="text-xs text-gray-600">Ambient Temp</div>
          </div>
        </div>

        <div className="text-center py-2 bg-gray-100 rounded-lg">
          <div className="text-sm font-medium text-gray-700">
            Temperature Difference:
            {' '}
            <span className={riskConfig.textColor}>
              +
              {tempDiff.toFixed(1)}
              °C
            </span>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-500 px-2">
          <span>Safe</span>
          <span>Caution</span>
          <span>Critical</span>
        </div>
      </CardContent>
    </Card>
  )
}
