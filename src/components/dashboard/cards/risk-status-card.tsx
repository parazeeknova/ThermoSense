'use client'

import type { RiskStatus } from '@/types/dashboard'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RiskStatusCardProps {
  riskStatus: RiskStatus
  deviceTemp: number
  outdoorTemp: number
}

export function RiskStatusCard({ riskStatus, deviceTemp, outdoorTemp }: RiskStatusCardProps) {
  return (
    <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-800/50 hover:bg-gray-900/95 transition-all duration-300 shadow-lg hover:shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-300 uppercase tracking-wide">
          Risk Status
        </CardTitle>
        <div className="p-2 bg-gray-800/50 rounded-lg">
          {riskStatus === 'safe'
            ? (
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              )
            : (
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              )}
        </div>
      </CardHeader>
      <CardContent>
        <Badge
          className={`text-sm px-3 py-1 rounded-lg font-medium border ${
            riskStatus === 'critical'
              ? 'bg-red-900/50 text-red-300 border-red-700/50'
              : riskStatus === 'caution'
                ? 'bg-amber-900/50 text-amber-300 border-amber-700/50'
                : 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50'
          }`}
        >
          {riskStatus.toUpperCase()}
        </Badge>
        <div className="text-sm text-gray-400 mt-2">
          Temp difference:
          {' '}
          {(deviceTemp - outdoorTemp).toFixed(1)}
          °C
        </div>
      </CardContent>
    </Card>
  )
}
