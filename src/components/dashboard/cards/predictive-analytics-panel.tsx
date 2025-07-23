'use client'

import type { PredictiveData } from '@/types/dashboard'
import { AlertTriangle, BarChart3, Brain, Clock, Lightbulb, Target, TrendingUp, Zap } from 'lucide-react'
import React, { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Progress } from '@/components/ui/progress'

// Mock predictive data - replace with actual ML model outputs
const mockPredictiveData: PredictiveData = {
  nextHourTemp: 44.2,
  riskTrend: 'increasing',
  recommendedActions: [
    'Reduce screen brightness to 70%',
    'Close 3 background applications',
    'Move to air-conditioned environment',
    'Consider taking a 15-minute break',
  ],
  confidence: 87,
}

// Mock prediction timeline
const predictionTimeline = Array.from({ length: 12 }, (_, i) => {
  const baseTemp = 42 + Math.sin(i * 0.3) * 3 + (i * 0.2)
  return {
    time: new Date(Date.now() + i * 5 * 60 * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    predicted: baseTemp,
    confidence: 85 + Math.random() * 10,
    riskLevel: baseTemp > 45 ? 'high' : baseTemp > 40 ? 'medium' : 'low',
  }
})

const chartConfig = {
  predicted: { label: 'Predicted Temperature', color: '#3B82F6' },
  confidence: { label: 'Confidence', color: '#10B981' },
}

interface PredictiveAnalyticsPanelProps {
  predictiveData?: PredictiveData
}

export function PredictiveAnalyticsPanel({
  predictiveData = mockPredictiveData,
}: PredictiveAnalyticsPanelProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1hour' | '6hours' | '24hours'>('1hour')
  const [showDetails, setShowDetails] = useState(false)

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-red-500" />
      case 'decreasing':
        return <TrendingUp className="w-4 h-4 text-emerald-500 rotate-180" />
      case 'stable':
        return <Target className="w-4 h-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing': return 'text-red-600'
      case 'decreasing': return 'text-emerald-600'
      case 'stable': return 'text-gray-600'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80)
      return 'text-emerald-600'
    if (confidence >= 60)
      return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 90)
      return 'Very High'
    if (confidence >= 80)
      return 'High'
    if (confidence >= 60)
      return 'Medium'
    if (confidence >= 40)
      return 'Low'
    return 'Very Low'
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-base sm:text-lg font-bold text-gray-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
            <span className="hidden sm:inline">Predictive Analytics</span>
            <span className="sm:hidden">AI Predictions</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className={`${getConfidenceColor(predictiveData.confidence)} border-current text-xs`}
            >
              <span className="hidden sm:inline">
                {getConfidenceLabel(predictiveData.confidence)}
                {' '}
                Confidence
              </span>
              <span className="sm:hidden">{getConfidenceLabel(predictiveData.confidence)}</span>
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs sm:text-sm"
            >
              {showDetails ? 'Hide' : 'Show'}
              <span className="hidden sm:inline"> Details</span>
            </Button>
          </div>
        </CardTitle>
        <p className="text-xs sm:text-sm text-gray-600">
          <span className="hidden sm:inline">AI-powered thermal predictions and optimization recommendations</span>
          <span className="sm:hidden">AI thermal predictions & optimization</span>
        </p>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6">
        <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              <span className="font-medium text-gray-900 text-sm sm:text-base">
                <span className="hidden sm:inline">Next Hour Prediction</span>
                <span className="sm:hidden">Next Hour</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {getTrendIcon(predictiveData.riskTrend)}
              <span className={`text-xs sm:text-sm font-medium ${getTrendColor(predictiveData.riskTrend)}`}>
                {predictiveData.riskTrend.charAt(0).toUpperCase() + predictiveData.riskTrend.slice(1)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {predictiveData.nextHourTemp.toFixed(1)}
                °C
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                <span className="hidden sm:inline">Predicted Temperature</span>
                <span className="sm:hidden">Predicted</span>
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                {predictiveData.confidence}
                %
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                <span className="hidden sm:inline">Model Confidence</span>
                <span className="sm:hidden">Confidence</span>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Confidence Level</span>
              <span>{getConfidenceLabel(predictiveData.confidence)}</span>
            </div>
            <Progress value={predictiveData.confidence} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(['1hour', '6hours', '24hours'] as const).map(timeframe => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe(timeframe)}
              className="text-xs sm:text-sm"
            >
              {timeframe === '1hour' ? '1H' : timeframe === '6hours' ? '6H' : '24H'}
              <span className="hidden sm:inline">
                {timeframe === '1hour' ? 'our' : timeframe === '6hours' ? 'ours' : ' Hours'}
              </span>
            </Button>
          ))}
        </div>

        <div className="border rounded-lg p-3 sm:p-4 bg-white">
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-3 flex items-center">
            <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">Temperature Prediction Timeline</span>
            <span className="sm:hidden">Prediction Timeline</span>
          </h4>
          <ChartContainer config={chartConfig} className="h-[200px] sm:h-48">
            <AreaChart data={predictionTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="time"
                stroke="#6B7280"
                fontSize={10}
                interval="preserveStartEnd"
              />
              <YAxis stroke="#6B7280" fontSize={10} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="predicted"
                stroke={chartConfig.predicted.color}
                fill={chartConfig.predicted.color}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
            <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-yellow-500" />
            <span className="hidden sm:inline">
              AI Recommendations (
              {predictiveData.recommendedActions.length}
              )
            </span>
            <span className="sm:hidden">
              Recommendations (
              {predictiveData.recommendedActions.length}
              )
            </span>
          </h4>
          <div className="space-y-2">
            {predictiveData.recommendedActions.map((action, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200 gap-2"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-800">{action}</span>
                </div>
                <Button variant="outline" size="sm" className="text-yellow-700 border-yellow-300 hover:bg-yellow-100 text-xs self-end sm:self-auto">
                  Apply
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs sm:text-sm font-medium text-gray-700">Risk Level Timeline</h4>
          <div className="flex space-x-1 h-6 sm:h-8 rounded overflow-hidden">
            {predictionTimeline.map((point, index) => {
              const riskColors = {
                low: 'bg-emerald-500',
                medium: 'bg-yellow-500',
                high: 'bg-red-500',
              }
              return (
                <div
                  key={index}
                  // @ts-expect-error: TODO
                  className={`flex-1 ${riskColors[point.riskLevel]} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                  title={`${point.time}: ${point.riskLevel} risk (${point.predicted.toFixed(1)}°C)`}
                />
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Now</span>
            <span>
              +
              {selectedTimeframe === '1hour' ? '1h' : selectedTimeframe === '6hours' ? '6h' : '24h'}
            </span>
          </div>
        </div>

        {showDetails && (
          <div className="border-t pt-4 space-y-4">
            <h4 className="text-xs sm:text-sm font-medium text-gray-700">Model Performance</h4>

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="text-center p-2 sm:p-3 bg-emerald-50 rounded-lg">
                <div className="text-base sm:text-lg font-bold text-emerald-600">94.2%</div>
                <div className="text-xs text-gray-600">Accuracy</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                <div className="text-base sm:text-lg font-bold text-blue-600">±1.2°C</div>
                <div className="text-xs text-gray-600">Avg Error</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-purple-50 rounded-lg">
                <div className="text-base sm:text-lg font-bold text-purple-600">847</div>
                <div className="text-xs text-gray-600">Data Points</div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs sm:text-sm text-gray-700">
                  <strong>Model Note:</strong>
                  {' '}
                  <span className="hidden sm:inline">Predictions are based on historical data, current conditions, and environmental factors. Actual temperatures may vary due to unexpected changes in usage patterns or environmental conditions.</span>
                  <span className="sm:hidden">Predictions based on historical data and current conditions. Actual temperatures may vary.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">Auto-optimize</span>
            <span className="sm:hidden">Auto</span>
          </Button>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">Set Target</span>
            <span className="sm:hidden">Target</span>
          </Button>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">Retrain</span>
            <span className="sm:hidden">Train</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
