'use client'

import { Activity, BarChart3, TrendingDown, TrendingUp, Zap } from 'lucide-react'
import React, { useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { chartConfig, deviceUsageData, riskLevels, temperatureData } from '@/lib/dashboard-utils'

// Enhanced temperature correlation data with statistical analysis
const correlationData = temperatureData.map((item, _index) => ({
  ...item,
  correlation: ((item.deviceTemp - item.outdoorTemp) / item.outdoorTemp * 100).toFixed(1),
  efficiency: Math.max(70, 100 - (item.deviceTemp - item.outdoorTemp) * 2),
  riskScore: item.deviceTemp > 45 ? 'high' : item.deviceTemp > 40 ? 'medium' : 'low',
}))

const correlationStats = {
  avgCorrelation: correlationData.reduce((sum, item) => sum + Number.parseFloat(item.correlation), 0) / correlationData.length,
  maxTempDiff: Math.max(...correlationData.map(item => item.deviceTemp - item.outdoorTemp)),
  minTempDiff: Math.min(...correlationData.map(item => item.deviceTemp - item.outdoorTemp)),
  correlationCoefficient: 0.87, // Mock correlation coefficient
  peakTime: '2:30 PM',
  coolestTime: '6:00 AM',
}

const batteryImpactData = temperatureData.map((item, _index) => ({
  ...item,
  healthDegradation: Math.max(0, (item.deviceTemp - 35) * 0.15),
  chargeEfficiency: Math.max(75, 100 - (item.deviceTemp - 25) * 0.8),
  lifespan: Math.max(85, 100 - (item.deviceTemp - 30) * 0.5),
  cycleImpact: item.deviceTemp > 40 ? 'accelerated' : 'normal',
}))

const batteryStats = {
  avgHealthDegradation: batteryImpactData.reduce((sum, item) => sum + item.healthDegradation, 0) / batteryImpactData.length,
  worstEfficiency: Math.min(...batteryImpactData.map(item => item.chargeEfficiency)),
  bestEfficiency: Math.max(...batteryImpactData.map(item => item.chargeEfficiency)),
  estimatedLifespan: Math.min(...batteryImpactData.map(item => item.lifespan)),
  cyclesAtRisk: batteryImpactData.filter(item => item.cycleImpact === 'accelerated').length,
  optimalHours: batteryImpactData.filter(item => item.lifespan > 95).length,
}

export function TemperatureCorrelationCard() {
  const [viewMode, setViewMode] = useState<'correlation' | 'scatter' | 'efficiency'>('correlation')

  const renderChart = () => {
    switch (viewMode) {
      case 'scatter':
        return (
          <ScatterChart data={correlationData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#374151" opacity={0.3} />
            <XAxis dataKey="outdoorTemp" stroke="#9CA3AF" fontSize={10} />
            <YAxis dataKey="deviceTemp" stroke="#9CA3AF" fontSize={10} />
            <ChartTooltip
              content={<ChartTooltipContent />}
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB',
              }}
            />
            <Scatter dataKey="deviceTemp" fill="#EF4444" />
          </ScatterChart>
        )
      case 'efficiency':
        return (
          <AreaChart data={correlationData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#374151" opacity={0.3} />
            <XAxis dataKey="time" stroke="#9CA3AF" fontSize={10} />
            <YAxis stroke="#9CA3AF" fontSize={10} domain={[70, 100]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="efficiency"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        )
      default:
        return (
          <LineChart data={correlationData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#374151" opacity={0.3} />
            <XAxis dataKey="time" stroke="#9CA3AF" fontSize={10} />
            <YAxis stroke="#9CA3AF" fontSize={10} />
            <ChartTooltip
              content={<ChartTooltipContent />}
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB',
              }}
            />
            <Line
              type="monotone"
              dataKey="deviceTemp"
              stroke="#EF4444"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 4, fill: '#EF4444' }}
            />
            <Line
              type="monotone"
              dataKey="outdoorTemp"
              stroke="#10B981"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 4, fill: '#10B981' }}
            />
          </LineChart>
        )
    }
  }

  return (
    <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-800/50 hover:bg-gray-900/95 transition-all duration-300 shadow-lg hover:shadow-xl h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <CardTitle className="text-sm font-bold text-white">Temperature Correlation</CardTitle>
          </div>
          <Badge className="bg-blue-900/50 text-blue-300 border-blue-600 text-xs">
            r =
            {' '}
            {correlationStats.correlationCoefficient}
          </Badge>
        </div>
        <p className="text-xs text-gray-400">24-hour thermal relationship analysis</p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-2 p-4">
        <div className="flex space-x-1">
          {[
            { key: 'correlation', label: 'Trend', icon: TrendingUp },
            { key: 'scatter', label: 'Plot', icon: BarChart3 },
            { key: 'efficiency', label: 'Impact', icon: Zap },
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={viewMode === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode(key as any)}
              className="flex-1 h-7 px-2 text-xs"
            >
              <Icon className="w-3 h-3 mr-1" />
              {label}
            </Button>
          ))}
        </div>

        <div className="flex-1 min-h-0">
          <ChartContainer config={chartConfig} className="h-32">
            {renderChart()}
          </ChartContainer>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-700">
          <div className="text-center">
            <div className="text-xs font-bold text-red-400">
              +
              {correlationStats.maxTempDiff.toFixed(1)}
              °C
            </div>
            <div className="text-xs text-gray-500">Peak Diff</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold text-emerald-400">
              {correlationStats.avgCorrelation.toFixed(1)}
              %
            </div>
            <div className="text-xs text-gray-500">Avg Corr</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold text-blue-400">
              {correlationStats.peakTime}
            </div>
            <div className="text-xs text-gray-500">Peak Time</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function BatteryHealthCard() {
  const [viewMode, setViewMode] = useState<'health' | 'efficiency' | 'lifespan'>('health')

  const renderChart = () => {
    switch (viewMode) {
      case 'efficiency':
        return (
          <AreaChart data={batteryImpactData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#E5E7EB" opacity={0.5} />
            <XAxis dataKey="time" stroke="#6B7280" fontSize={10} />
            <YAxis stroke="#6B7280" domain={[75, 100]} fontSize={10} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="chargeEfficiency"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        )
      case 'lifespan':
        return (
          <LineChart data={batteryImpactData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#E5E7EB" opacity={0.5} />
            <XAxis dataKey="time" stroke="#6B7280" fontSize={10} />
            <YAxis stroke="#6B7280" domain={[85, 100]} fontSize={10} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="lifespan"
              stroke="#8B5CF6"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 4, fill: '#8B5CF6' }}
            />
          </LineChart>
        )
      default:
        return (
          <AreaChart data={batteryImpactData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#E5E7EB" opacity={0.5} />
            <XAxis dataKey="time" stroke="#6B7280" fontSize={10} />
            <YAxis stroke="#6B7280" fontSize={10} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="healthDegradation"
              stroke="#EF4444"
              fill="#EF4444"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        )
    }
  }

  const getHealthStatus = () => {
    const avgDegradation = batteryStats.avgHealthDegradation
    if (avgDegradation < 0.5)
      return { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-100' }
    if (avgDegradation < 1.0)
      return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (avgDegradation < 2.0)
      return { label: 'Caution', color: 'text-amber-600', bg: 'bg-amber-100' }
    return { label: 'Risk', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const healthStatus = getHealthStatus()

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-emerald-600" />
            <CardTitle className="text-sm font-bold text-gray-900">Battery Health Impact</CardTitle>
          </div>
          <Badge className={`${healthStatus.bg} ${healthStatus.color} border-current text-xs`}>
            {healthStatus.label}
          </Badge>
        </div>
        <p className="text-xs text-gray-600">Temperature effects on battery performance</p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-2 p-4">
        <div className="flex space-x-1">
          {[
            { key: 'health', label: 'Degrad', icon: TrendingDown },
            { key: 'efficiency', label: 'Charge', icon: Zap },
            { key: 'lifespan', label: 'Life', icon: Activity },
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={viewMode === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode(key as any)}
              className="flex-1 h-7 px-2 text-xs"
            >
              <Icon className="w-3 h-3 mr-1" />
              {label}
            </Button>
          ))}
        </div>

        <div className="flex-1 min-h-0">
          <ChartContainer config={chartConfig} className="h-32">
            {renderChart()}
          </ChartContainer>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
          <div className="text-center">
            <div className="text-xs font-bold text-red-600">
              {batteryStats.avgHealthDegradation.toFixed(1)}
              %
            </div>
            <div className="text-xs text-gray-500">Avg Degrad</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold text-blue-600">
              {batteryStats.worstEfficiency.toFixed(0)}
              %
            </div>
            <div className="text-xs text-gray-500">Min Eff</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold text-emerald-600">
              {batteryStats.optimalHours}
              h
            </div>
            <div className="text-xs text-gray-500">Optimal</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function RiskDistributionCard() {
  return (
    <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-800/50 hover:bg-gray-900/95 transition-all duration-300 shadow-lg hover:shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-white">Risk Distribution</CardTitle>
        <p className="text-sm text-gray-400">Temperature risk levels over 7 days</p>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskLevels}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {riskLevels.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                }}
              />
              <Legend wrapperStyle={{ color: '#9CA3AF', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function DeviceUsageCard() {
  return (
    <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl md:col-span-2 lg:col-span-1">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-gray-900">Device Usage</CardTitle>
        <p className="text-sm text-gray-600">Daily usage hours by device type</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px]">
          <BarChart data={deviceUsageData} margin={{ top: 10, right: 15, left: 15, bottom: 30 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#E5E7EB" opacity={0.5} />
            <XAxis
              dataKey="device"
              stroke="#6B7280"
              fontSize={11}
              interval={0}
              angle={0}
              textAnchor="middle"
              height={60}
            />
            <YAxis stroke="#6B7280" fontSize={11} />
            <ChartTooltip
              content={<ChartTooltipContent />}
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                color: '#1F2937',
              }}
            />
            <Bar dataKey="usage" fill="var(--color-usage)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
