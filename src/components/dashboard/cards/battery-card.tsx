'use client'

import { Battery, Clock, TrendingUp } from 'lucide-react'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface BatteryCardProps {
  batteryLevel: number
}

export function BatteryCard({ batteryLevel }: BatteryCardProps) {
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

  const batteryStatus = getBatteryStatus(batteryLevel)
  const estimatedTime = Math.floor((batteryLevel / 100) * 8) // Mock estimated hours
  const cycleCount = 847 // Mock cycle count
  const health = Math.floor(94 + (batteryLevel - 78) * 0.1) // Mock health percentage
  const estimatedMinutes = ((batteryLevel % 100) * 0.6).toFixed(0)

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          Battery Level
        </CardTitle>
        <div className="p-2 bg-emerald-100 rounded-lg">
          <Battery className="h-5 w-5 text-emerald-600" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {batteryLevel}
            %
          </div>
          <Progress value={batteryLevel} className="h-3 bg-gray-200 [&>div]:bg-emerald-500 mb-3" />
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
                Time Left
              </div>
              <div className="text-sm font-medium text-gray-900">
                {estimatedTime}
                h
                {' '}
                {estimatedMinutes}
                m
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-xs text-gray-500 mb-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                Health
              </div>
              <div className="text-sm font-medium text-emerald-600">
                {health}
                %
              </div>
            </div>
          </div>

          <div className="text-center pt-1">
            <div className="text-xs text-gray-400">
              Cycle Count:
              {' '}
              {cycleCount}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
