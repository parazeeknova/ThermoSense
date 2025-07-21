'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function QuickStatsCard() {
  return (
    <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-800/50 hover:bg-gray-900/95 transition-all duration-300 shadow-lg hover:shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-white">Forest Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
          <span className="text-gray-300 font-medium">Avg Daily Temp</span>
          <span className="text-emerald-400 font-bold">39.2°C</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
          <span className="text-gray-300 font-medium">Peak Temperature</span>
          <span className="text-emerald-400 font-bold">48.1°C</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
          <span className="text-gray-300 font-medium">Cooling Events</span>
          <span className="text-emerald-400 font-bold">12</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
          <span className="text-gray-300 font-medium">Battery Cycles</span>
          <span className="text-emerald-400 font-bold">847</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-emerald-900/30 rounded-lg border border-emerald-700/50">
          <span className="text-emerald-300 font-medium">Health Score</span>
          <span className="text-emerald-400 font-bold">94%</span>
        </div>
      </CardContent>
    </Card>
  )
}
