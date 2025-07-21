'use client'

import React from 'react'
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
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { chartConfig, deviceUsageData, riskLevels, temperatureData } from '@/lib/dashboard-utils'

export function TemperatureCorrelationCard() {
  return (
    <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-800/50 hover:bg-gray-900/95 transition-all duration-300 shadow-lg hover:shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-white">Temperature Correlation</CardTitle>
        <p className="text-sm text-gray-400">24-hour device vs outdoor temperature tracking</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <LineChart data={temperatureData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#374151" opacity={0.3} />
            <XAxis dataKey="time" stroke="#9CA3AF" fontSize={11} />
            <YAxis stroke="#9CA3AF" fontSize={11} />
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
              stroke="var(--color-deviceTemp)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#10B981' }}
            />
            <Line
              type="monotone"
              dataKey="outdoorTemp"
              stroke="var(--color-outdoorTemp)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#059669' }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function BatteryHealthCard() {
  return (
    <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-gray-900">Battery Health Impact</CardTitle>
        <p className="text-sm text-gray-600">Health degradation correlation with temperature</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <AreaChart data={temperatureData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#E5E7EB" opacity={0.5} />
            <XAxis dataKey="time" stroke="#6B7280" fontSize={11} />
            <YAxis stroke="#6B7280" domain={[90, 100]} fontSize={11} />
            <ChartTooltip
              content={<ChartTooltipContent />}
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                color: '#1F2937',
              }}
            />
            <Area
              type="monotone"
              dataKey="batteryHealth"
              stroke="var(--color-batteryHealth)"
              fill="var(--color-batteryHealth)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
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
