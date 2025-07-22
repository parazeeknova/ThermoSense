'use client'

import type { SensorReading } from '@/types/dashboard'
import { Activity, BarChart3, Clock, Download, History, MapPin, Thermometer, TrendingDown, TrendingUp, Zap } from 'lucide-react'
import { useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  Scatter,
  ScatterChart,
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
    // Enhanced data for correlation and battery health
    correlation: ((baseTemp - ambientTemp) / ambientTemp * 100).toFixed(1),
    efficiency: Math.max(70, 100 - (baseTemp - ambientTemp) * 2),
    healthDegradation: Math.max(0, (baseTemp - 35) * 0.15),
    chargeEfficiency: Math.max(75, 100 - (baseTemp - 25) * 0.8),
    lifespan: Math.max(85, 100 - (baseTemp - 30) * 0.5),
  }
})

const chartConfig = {
  batteryTemp: { label: 'Battery Temp', color: '#EF4444' },
  ambientTemp: { label: 'Ambient Temp', color: '#10B981' },
  cpuLoad: { label: 'CPU Load', color: '#3B82F6' },
  healthDegradation: { label: 'Health Degradation', color: '#EF4444' },
  chargeEfficiency: { label: 'Charge Efficiency', color: '#3B82F6' },
  lifespan: { label: 'Battery Lifespan', color: '#8B5CF6' },
}

interface HistoricalDataPanelProps {
  data?: SensorReading[]
  timeRange?: '30min' | '1hour' | '6hours' | '24hours'
}

export function HistoricalDataPanel({
  data = mockHistoricalData,
  timeRange = '30min',
}: HistoricalDataPanelProps) {
  const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'correlation' | 'battery-health' | 'performance'>('temperature')
  const [viewMode, setViewMode] = useState<'line' | 'area' | 'scatter'>('line')
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
      'Timestamp,Battery Temp (°C),Ambient Temp (°C),CPU Load (%),Device State,Health Degradation (%),Charge Efficiency (%),Lifespan (%)',
      ...data.map(reading =>
        `${reading.timestamp},${reading.batteryTemp.toFixed(2)},${reading.ambientTemp.toFixed(2)},${reading.cpuLoad.toFixed(1)},${reading.deviceState},${(reading as any).healthDegradation?.toFixed(2) || 'N/A'},${(reading as any).chargeEfficiency?.toFixed(1) || 'N/A'},${(reading as any).lifespan?.toFixed(1) || 'N/A'}`,
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `comprehensive-sensor-data-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const renderChart = () => {
    const margin = { top: 10, right: 30, left: 10, bottom: 30 }

    switch (selectedMetric) {
      case 'correlation':
        if (viewMode === 'scatter') {
          return (
            <ScatterChart data={data} margin={margin}>
              <CartesianGrid strokeDasharray="2 2" stroke="#E5E7EB" opacity={0.5} />
              <XAxis dataKey="ambientTemp" stroke="#6B7280" fontSize={11} />
              <YAxis dataKey="batteryTemp" stroke="#6B7280" fontSize={11} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Scatter dataKey="batteryTemp" fill="#EF4444" />
            </ScatterChart>
          )
        }
        return (
          <LineChart data={data} margin={margin}>
            <CartesianGrid strokeDasharray="2 2" stroke="#E5E7EB" opacity={0.5} />
            <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="#6B7280" fontSize={11} />
            <YAxis stroke="#6B7280" fontSize={11} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="batteryTemp"
              stroke="#EF4444"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 4, fill: '#EF4444' }}
            />
            <Line
              type="monotone"
              dataKey="ambientTemp"
              stroke="#10B981"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 4, fill: '#10B981' }}
            />
          </LineChart>
        )

      case 'battery-health':
        if (viewMode === 'area') {
          return (
            <AreaChart data={data} margin={margin}>
              <CartesianGrid strokeDasharray="2 2" stroke="#E5E7EB" opacity={0.5} />
              <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="#6B7280" fontSize={11} />
              <YAxis stroke="#6B7280" fontSize={11} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="healthDegradation"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          )
        }
        return (
          <LineChart data={data} margin={margin}>
            <CartesianGrid strokeDasharray="2 2" stroke="#E5E7EB" opacity={0.5} />
            <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="#6B7280" fontSize={11} />
            <YAxis stroke="#6B7280" fontSize={11} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="chargeEfficiency"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#3B82F6' }}
            />
            <Line
              type="monotone"
              dataKey="lifespan"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#8B5CF6' }}
            />
          </LineChart>
        )

      case 'performance':
        return (
          <ComposedChart data={data} margin={margin}>
            <CartesianGrid strokeDasharray="2 2" stroke="#E5E7EB" opacity={0.5} />
            <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="#6B7280" fontSize={11} />
            <YAxis stroke="#6B7280" fontSize={11} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="cpuLoad" fill="#3B82F6" opacity={0.7} />
            <Line
              type="monotone"
              dataKey="batteryTemp"
              stroke="#EF4444"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        )

      default: // temperature
        return (
          <LineChart data={data} margin={margin}>
            <CartesianGrid strokeDasharray="2 2" stroke="#E5E7EB" opacity={0.5} />
            <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="#6B7280" fontSize={11} />
            <YAxis stroke="#6B7280" fontSize={11} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="batteryTemp"
              stroke="#EF4444"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#EF4444' }}
            />
            <Line
              type="monotone"
              dataKey="ambientTemp"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#10B981' }}
            />
            <Line
              type="monotone"
              dataKey="cpuLoad"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#3B82F6' }}
            />
          </LineChart>
        )
    }
  }

  // Calculate enhanced statistics
  const avgBatteryTemp = data.reduce((sum, reading) => sum + reading.batteryTemp, 0) / data.length
  const avgAmbientTemp = data.reduce((sum, reading) => sum + reading.ambientTemp, 0) / data.length
  const avgCpuLoad = data.reduce((sum, reading) => sum + reading.cpuLoad, 0) / data.length
  const maxTempDiff = Math.max(...data.map(reading => reading.batteryTemp - reading.ambientTemp))

  // New battery health statistics
  const avgHealthDegradation = data.reduce((sum, reading) => sum + ((reading as any).healthDegradation || 0), 0) / data.length
  const avgChargeEfficiency = data.reduce((sum, reading) => sum + ((reading as any).chargeEfficiency || 90), 0) / data.length
  const avgLifespan = data.reduce((sum, reading) => sum + ((reading as any).lifespan || 95), 0) / data.length

  // Correlation statistics
  const correlationCoefficient = 0.87 // Mock value

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
            <History className="w-5 h-5 mr-2 text-blue-600" />
            Comprehensive Analytics Dashboard
            <Badge className="ml-2 bg-blue-100 text-blue-800">
              {timeRange}
            </Badge>
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
          Integrated temperature correlation, battery health impact, and performance analysis with
          {' '}
          {data.length}
          {' '}
          readings
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Enhanced Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              {avgBatteryTemp.toFixed(1)}
              °C
            </div>
            <div className="text-xs text-gray-600">Avg Battery</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-600">
              {avgAmbientTemp.toFixed(1)}
              °C
            </div>
            <div className="text-xs text-gray-600">Avg Ambient</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {avgCpuLoad.toFixed(1)}
              %
            </div>
            <div className="text-xs text-gray-600">Avg CPU</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              +
              {maxTempDiff.toFixed(1)}
              °C
            </div>
            <div className="text-xs text-gray-600">Max Diff</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {avgChargeEfficiency.toFixed(1)}
              %
            </div>
            <div className="text-xs text-gray-600">Charge Eff</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-indigo-600">
              r =
              {' '}
              {correlationCoefficient}
            </div>
            <div className="text-xs text-gray-600">Correlation</div>
          </div>
        </div>

        {/* Analysis Type Selector */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedMetric === 'temperature' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric('temperature')}
          >
            <Thermometer className="w-4 h-4 mr-1" />
            Temperature
          </Button>
          <Button
            variant={selectedMetric === 'correlation' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric('correlation')}
          >
            <Activity className="w-4 h-4 mr-1" />
            Correlation
          </Button>
          <Button
            variant={selectedMetric === 'battery-health' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric('battery-health')}
          >
            <Zap className="w-4 h-4 mr-1" />
            Battery Health
          </Button>
          <Button
            variant={selectedMetric === 'performance' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric('performance')}
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            Performance
          </Button>
        </div>

        {/* Chart Type Selector (for applicable metrics) */}
        {(selectedMetric === 'correlation' || selectedMetric === 'battery-health') && (
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('line')}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Line
            </Button>
            {selectedMetric === 'battery-health' && (
              <Button
                variant={viewMode === 'area' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('area')}
              >
                <Activity className="w-4 h-4 mr-1" />
                Area
              </Button>
            )}
            {selectedMetric === 'correlation' && (
              <Button
                variant={viewMode === 'scatter' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('scatter')}
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Scatter
              </Button>
            )}
          </div>
        )}

        {/* Main Chart */}
        <div className="flex-1 border rounded-lg p-4 bg-white">
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            {renderChart()}
          </ChartContainer>
        </div>

        {/* Analysis Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="font-medium text-red-800">Health Impact</span>
            </div>
            <div className="text-sm text-red-700">
              Avg degradation:
              {' '}
              {avgHealthDegradation.toFixed(2)}
              %
              <br />
              Thermal stress level:
              {' '}
              {maxTempDiff > 10 ? 'High' : 'Moderate'}
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Correlation</span>
            </div>
            <div className="text-sm text-blue-700">
              Temperature correlation:
              {' '}
              {correlationCoefficient}
              <br />
              Relationship:
              {' '}
              {correlationCoefficient > 0.8 ? 'Strong' : 'Moderate'}
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span className="font-medium text-emerald-800">Efficiency</span>
            </div>
            <div className="text-sm text-emerald-700">
              Avg efficiency:
              {' '}
              {avgChargeEfficiency.toFixed(1)}
              %
              <br />
              Lifespan impact:
              {' '}
              {avgLifespan.toFixed(1)}
              %
            </div>
          </div>
        </div>

        {/* Device State Timeline */}
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

        {/* Location and Time Info */}
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

        {/* Raw Data Table */}
        {showRawData && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-2">Time</th>
                  <th className="text-left p-2">Battery °C</th>
                  <th className="text-left p-2">Ambient °C</th>
                  <th className="text-left p-2">CPU %</th>
                  <th className="text-left p-2">Health %</th>
                  <th className="text-left p-2">Efficiency %</th>
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
                    <td className="p-2 text-purple-600">{((reading as any).healthDegradation || 0).toFixed(2)}</td>
                    <td className="p-2 text-indigo-600">{((reading as any).chargeEfficiency || 90).toFixed(1)}</td>
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
