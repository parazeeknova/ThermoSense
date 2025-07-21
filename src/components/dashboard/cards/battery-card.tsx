'use client'

import { Battery } from 'lucide-react'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface BatteryCardProps {
  batteryLevel: number
}

export function BatteryCard({ batteryLevel }: BatteryCardProps) {
  return (
    <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          Battery Level
        </CardTitle>
        <div className="p-2 bg-emerald-100 rounded-lg">
          <Battery className="h-5 w-5 text-emerald-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900 mb-3">
          {batteryLevel}
          %
        </div>
        <Progress value={batteryLevel} className="h-3 bg-gray-200 [&>div]:bg-emerald-500" />
      </CardContent>
    </Card>
  )
}
