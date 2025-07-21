'use client'

import type { SensorReading } from '@/types/dashboard'
import { Activity, Clock, Download, History, MapPin, Thermometer, Zap } from 'lucide-react'
import React, { useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

// Mock historical data - replace with actual 30-min readings
const mockHistoricalData: SensorReading[] = Array.from({ length: 30 }, (_, i) => {
  const timestamp = new Date(Date.now() - (29 - i) * 60 * 1000).toISOString()
  const baseTemp = 35 + Math.sin(i * 0.2) * 5 + Math.random() * 3
  const ambientTemp = 28 + Math.sin(i * 0.1) * 4 + Math.random() * 2

  return {
    timestamp,
    batteryTemp: baseTemp,
    ambientTemp,
    cpuLoad: 30 + Math.sin(i * 0.3) * 20 + Math.random() * 15,
    deviceState: ['active', 'idle', 'sleep'][Math.floor(Math.random() * 3)] as 'active' | 'idle' | 'sleep',
    location: {
      lat: 37.7749 + (Math.random() - 0.5) * 0.01,
      lng: -122.4194 + (Math.random() - 0.5) * 0.01,
      city: 'San Francisco',
    },
  }
})

const chartConfig = {
  batteryTemp: { label: 'Battery Temp', color: '#EF4444' },
  ambientTemp: { label: 'Ambient Temp', color: '#10B981' },
  cpuLoad: { label: 'CPU Load', color: '#3B82F6' },
}

interface HistoricalDataPanelProps {
  data?: SensorReading[]
  timeRange?: '30min' | '1hour' | '6hours' | '24hours'
}

export function HistoricalDataPanel({
  data = mockHistoricalData,
  timeRange = '30min',
}: HistoricalDataPanelProps) {
  const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'performance' | 'correlation'>('temperature')
  const [showRawData, setShowRawData] = useState(false)

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  const getDeviceStateColor = (state: 'active' | 'idle' | 'sleep') => {
    switch (state) {
      case 'active': return 'bg-green-500'
      case 'idle': return 'bg-yellow-500'
      case 'sleep': return 'bg-gray-500'
    }
  }

  const exportData = () => {
    const csvContent = [
      'Timestamp,Battery Temp (°C),Ambient Temp (°C),CPU Load (%),Device State,Location',
      ...data.map(reading =>
        `${reading.timestamp},${reading.batteryTemp.toFixed(2)},${reading.ambientTemp.toFixed(2)},${reading.cpuLoad.toFixed(1)},${reading.deviceState},${reading.location?.city || 'Unknown'}`,
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sensor-data-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const renderChart = () => {
    switch (selectedMetric) {
      case 'temperature':
        return (
          <ChartContainer config={chartConfig} className="h-64">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTime}
                stroke="#6B7280"
                fontSize={11}
                interval="preserveStartEnd"
              />
              <YAxis stroke="#6B7280" fontSize={11} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                labelFormatter={value => `Time: ${formatTime(value as string)}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="batteryTemp"
                stroke={chartConfig.batteryTemp.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Battery Temperature (°C)"
              />
              <Line
                type="monotone"
                dataKey="ambientTemp"
                stroke={chartConfig.ambientTemp.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Ambient Temperature (°C)"
              />
            </LineChart>
          </ChartContainer>
        )

      case 'performance':
        return (
          <ChartContainer config={chartConfig} className="h-64">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTime}
                stroke="#6B7280"
                fontSize={11}
                interval="preserveStartEnd"
              />
              <YAxis stroke="#6B7280" fontSize={11} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                labelFormatter={value => `Time: ${formatTime(value as string)}`}
              />
              <Legend />
              <Bar
                dataKey="cpuLoad"
                fill={chartConfig.cpuLoad.color}
                name="CPU Load (%)"
                opacity={0.7}
              />
              <Line
                type="monotone"
                dataKey="batteryTemp"
                stroke={chartConfig.batteryTemp.color}
                strokeWidth={2}
                name="Battery Temp (°C)"
              />
            </ComposedChart>
          </ChartContainer>
        )

      case 'correlation':
        return (
          <ChartContainer config={chartConfig} className="h-64">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTime}
                stroke="#6B7280"
                fontSize={11}
                interval="preserveStartEnd"
              />
              <YAxis stroke="#6B7280" fontSize={11} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                labelFormatter={value => `Time: ${formatTime(value as string)}`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="batteryTemp"
                stackId="1"
                stroke={chartConfig.batteryTemp.color}
                fill={chartConfig.batteryTemp.color}
                fillOpacity={0.3}
                name="Battery Temp (°C)"
              />
              <Area
                type="monotone"
                dataKey="ambientTemp"
                stackId="2"
                stroke={chartConfig.ambientTemp.color}
                fill={chartConfig.ambientTemp.color}
                fillOpacity={0.3}
                name="Ambient Temp (°C)"
              />
            </AreaChart>
          </ChartContainer>
        )

      default:
        return null
    }
  }

  const avgBatteryTemp = data.reduce((sum, reading) => sum + reading.batteryTemp, 0) / data.length
  const avgAmbientTemp = data.reduce((sum, reading) => sum + reading.ambientTemp, 0) / data.length
  const avgCpuLoad = data.reduce((sum, reading) => sum + reading.cpuLoad, 0) / data.length
  const maxTempDiff = Math.max(...data.map(reading => reading.batteryTemp - reading.ambientTemp))

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl col-span-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
            <History className="w-5 h-5 mr-2 text-blue-600" />
            Historical Data Panel (
            {timeRange}
            )
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="w-4 h-4 mr-1" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRawData(!showRawData)}
            >
              {showRawData ? 'Hide' : 'Show'}
              {' '}
              Raw Data
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Last
          {' '}
          {data.length}
          {' '}
          sensor readings with battery temperature, ambient conditions, and device performance metrics
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              {avgBatteryTemp.toFixed(1)}
              °C
            </div>
            <div className="text-xs text-gray-600">Avg Battery Temp</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-600">
              {avgAmbientTemp.toFixed(1)}
              °C
            </div>
            <div className="text-xs text-gray-600">Avg Ambient Temp</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {avgCpuLoad.toFixed(1)}
              %
            </div>
            <div className="text-xs text-gray-600">Avg CPU Load</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              +
              {maxTempDiff.toFixed(1)}
              °C
            </div>
            <div className="text-xs text-gray-600">Max Temp Diff</div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant={selectedMetric === 'temperature' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric('temperature')}
          >
            <Thermometer className="w-4 h-4 mr-1" />
            Temperature
          </Button>
          <Button
            variant={selectedMetric === 'performance' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric('performance')}
          >
            <Zap className="w-4 h-4 mr-1" />
            Performance
          </Button>
          <Button
            variant={selectedMetric === 'correlation' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric('correlation')}
          >
            <Activity className="w-4 h-4 mr-1" />
            Correlation
          </Button>
        </div>

        <div className="border rounded-lg p-4 bg-white">
          {renderChart()}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center">
            <Activity className="w-4 h-4 mr-1" />
            Device State Timeline
          </h4>
          <div className="flex space-x-1 overflow-x-auto">
            {data.map((reading, index) => (
              <div
                key={index}
                className={`w-3 h-6 rounded-sm ${getDeviceStateColor(reading.deviceState)} opacity-80 hover:opacity-100 transition-opacity`}
                title={`${formatTime(reading.timestamp)}: ${reading.deviceState}`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatTime(data[0]?.timestamp || '')}</span>
            <span>{formatTime(data[data.length - 1]?.timestamp || '')}</span>
          </div>
        </div>

        {data[0]?.location && (
          <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
            <MapPin className="w-4 h-4 text-blue-600" />
            <div>
              <div className="text-sm font-medium text-gray-900">
                Location:
                {' '}
                {data[0].location.city}
              </div>
              <div className="text-xs text-gray-600">
                {data[0].location.lat.toFixed(4)}
                ,
                {data[0].location.lng.toFixed(4)}
              </div>
            </div>
            <Clock className="w-4 h-4 text-blue-600" />
            <div className="text-xs text-gray-600">
              Updated:
              {' '}
              {formatTime(data[data.length - 1]?.timestamp || '')}
            </div>
          </div>
        )}

        {showRawData && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-2">Time</th>
                  <th className="text-left p-2">Battery °C</th>
                  <th className="text-left p-2">Ambient °C</th>
                  <th className="text-left p-2">CPU %</th>
                  <th className="text-left p-2">State</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(-10).map((reading, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-2">{formatTime(reading.timestamp)}</td>
                    <td className="p-2 text-red-600">{reading.batteryTemp.toFixed(1)}</td>
                    <td className="p-2 text-emerald-600">{reading.ambientTemp.toFixed(1)}</td>
                    <td className="p-2 text-blue-600">{reading.cpuLoad.toFixed(1)}</td>
                    <td className="p-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getDeviceStateColor(reading.deviceState)} text-white border-none`}
                      >
                        {reading.deviceState}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
