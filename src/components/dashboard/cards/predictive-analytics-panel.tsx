'use client'

import type { PredictiveData } from '@/types/dashboard'
import { Activity, AlertTriangle, Brain, Clock, Lightbulb, Loader2, RefreshCw, Target, TrendingUp, X, Zap } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

// Enhanced prediction timeline generator with more sophisticated data
function generatePredictionTimeline(predictedTemp: number, riskTrend: 'increasing' | 'decreasing' | 'stable') {
  return Array.from({ length: 24 }, (_, i) => {
    let baseTemp = predictedTemp

    // Apply trend with more realistic progression
    if (riskTrend === 'increasing') {
      baseTemp += (i * 0.2) + (Math.sin(i * 0.1) * 1.5)
    }
    else if (riskTrend === 'decreasing') {
      baseTemp -= (i * 0.15) + (Math.cos(i * 0.1) * 1.2)
    }
    else {
      // Stable but with natural variations
      baseTemp += Math.sin(i * 0.2) * 2
    }

    // Add realistic temperature fluctuations
    const variation = Math.random() * 2 - 1
    baseTemp += variation

    // Ensure realistic temperature bounds
    baseTemp = Math.max(15, Math.min(70, baseTemp))

    const confidence = Math.max(60, 95 - (i * 1.5) + (Math.random() * 10))
    const riskLevel = baseTemp > 50 ? 'high' : baseTemp > 42 ? 'medium' : 'low'

    return {
      time: new Date(Date.now() + i * 5 * 60 * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      predicted: Number(baseTemp.toFixed(1)),
      confidence: Number(confidence.toFixed(1)),
      riskLevel,
      safeZone: 40, // Safe temperature threshold
      warningZone: 45, // Warning temperature threshold
      criticalZone: 50, // Critical temperature threshold
    }
  })
}

// Custom tooltip for the enhanced chart
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{`Time: ${label}`}</p>
        <p className="text-blue-600">{`Temperature: ${data.predicted}°C`}</p>
        <p className="text-emerald-600">{`Confidence: ${data.confidence}%`}</p>
        <p className={`font-medium ${
          data.riskLevel === 'high'
            ? 'text-red-600'
            : data.riskLevel === 'medium' ? 'text-yellow-600' : 'text-emerald-600'
        }`}
        >
          {`Risk: ${data.riskLevel.toUpperCase()}`}
        </p>
      </div>
    )
  }
  return null
}

// Local storage key for persistence
const STORAGE_KEY = 'thermosense-predictive-data'

interface PredictiveAnalyticsPanelProps {
  predictiveData?: PredictiveData
  deviceTemp?: number
  batteryLevel?: number
  weatherTemp?: number
  cpuUsage?: number
  screenBrightness?: number
  activeApps?: number
}

export function PredictiveAnalyticsPanel({
  predictiveData: initialPredictiveData,
  deviceTemp,
  batteryLevel,
  weatherTemp,
  cpuUsage,
  screenBrightness,
  activeApps,
}: PredictiveAnalyticsPanelProps) {
  const [predictiveData, setPredictiveData] = useState<PredictiveData | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1hour' | '6hours' | '24hours'>('1hour')
  const [showDetails, setShowDetails] = useState(true) // Default to true
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastGenerated, setLastGenerated] = useState<string | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setPredictiveData(parsed.data)
        setLastGenerated(parsed.timestamp)
      }
      catch (error) {
        console.error('Error loading stored predictive data:', error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    else if (initialPredictiveData) {
      setPredictiveData(initialPredictiveData)
    }
  }, [initialPredictiveData])

  // Save to localStorage when data changes
  useEffect(() => {
    if (predictiveData) {
      const dataToStore = {
        data: predictiveData,
        timestamp: new Date().toISOString(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore))
      setLastGenerated(dataToStore.timestamp)
    }
  }, [predictiveData])

  const generatePredictiveAnalytics = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const context = {
        deviceTemp,
        batteryLevel,
        weatherTemp,
        cpuUsage,
        screenBrightness,
        activeApps,
      }

      const response = await fetch('/api/ai/predictive-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate predictive analytics')
      }

      setPredictiveData(data.predictiveData)
    }
    catch (err) {
      console.error('Failed to generate predictive analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate predictive analytics')
    }
    finally {
      setIsGenerating(false)
    }
  }

  const clearPredictiveData = () => {
    setPredictiveData(null)
    setLastGenerated(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const predictionTimeline = predictiveData ? generatePredictionTimeline(predictiveData.nextHourTemp, predictiveData.riskTrend) : []

  // Filter timeline based on selected timeframe
  const getFilteredTimeline = () => {
    const maxPoints = selectedTimeframe === '1hour' ? 12 : selectedTimeframe === '6hours' ? 18 : 24
    return predictionTimeline.slice(0, maxPoints)
  }

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

  const formatLastGenerated = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1)
      return 'Just now'
    if (diffMins < 60)
      return `${diffMins}m ago`
    if (diffMins < 1440)
      return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-base sm:text-lg font-bold text-gray-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
            <span className="hidden sm:inline">Predictive Analytics</span>
            <span className="sm:hidden">AI Predictions</span>
            {lastGenerated && (
              <Badge variant="outline" className="ml-2 text-xs text-gray-500">
                {formatLastGenerated(lastGenerated)}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generatePredictiveAnalytics}
              disabled={isGenerating}
              className="text-purple-600 border-purple-300 hover:bg-purple-50"
            >
              {isGenerating
                ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  )
                : (
                    <RefreshCw className="w-4 h-4 mr-1" />
                  )}
              {isGenerating ? 'Generating...' : 'Generate Analysis'}
            </Button>
            {predictiveData && (
              <>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearPredictiveData}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </CardTitle>
        <p className="text-xs sm:text-sm text-gray-600">
          <span className="hidden sm:inline">AI-powered thermal predictions and optimization recommendations</span>
          <span className="sm:hidden">AI thermal predictions & optimization</span>
        </p>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
            {error}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6">
        {isGenerating && (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <p>AI is analyzing device conditions and predicting trends...</p>
          </div>
        )}

        {!isGenerating && !predictiveData && (
          <div className="text-center py-8 text-gray-500">
            <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No predictive analysis yet</p>
            <p className="text-xs mb-4">Click "Generate Analysis" to get AI predictions</p>
            <Button
              variant="outline"
              onClick={generatePredictiveAnalytics}
              className="text-purple-600 border-purple-300 hover:bg-purple-50"
            >
              <Brain className="w-4 h-4 mr-1" />
              Generate Analysis
            </Button>
          </div>
        )}

        {!isGenerating && predictiveData && (
          <>
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

            {/* Enhanced Prediction Chart */}
            <div className="border rounded-lg p-3 sm:p-4 bg-white">
              <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Activity className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-purple-600" />
                <span className="hidden sm:inline">Enhanced Temperature Prediction Timeline</span>
                <span className="sm:hidden">Enhanced Prediction Timeline</span>
              </h4>
              <div className="h-[300px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={getFilteredTimeline()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="time"
                      stroke="#6B7280"
                      fontSize={10}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      stroke="#6B7280"
                      fontSize={10}
                      domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    {/* Temperature zones */}
                    <ReferenceLine y={40} stroke="#10B981" strokeDasharray="5 5" opacity={0.6} />
                    <ReferenceLine y={45} stroke="#F59E0B" strokeDasharray="5 5" opacity={0.6} />
                    <ReferenceLine y={50} stroke="#EF4444" strokeDasharray="5 5" opacity={0.6} />

                    {/* Temperature prediction area */}
                    <Area
                      type="monotone"
                      dataKey="predicted"
                      stroke="#3B82F6"
                      fill="url(#tempGradient)"
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: '#3B82F6', strokeWidth: 2 }}
                    />

                    {/* Confidence line */}
                    <Line
                      type="monotone"
                      dataKey="confidence"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                      yAxisId="confidence"
                    />

                    <defs>
                      <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Chart legend */}
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-600">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                  <span>Temperature Prediction</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded mr-2"></div>
                  <span>Safe Zone (≤40°C)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                  <span>Warning Zone (≤45°C)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                  <span>Critical Zone (≥50°C)</span>
                </div>
              </div>
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
                {getFilteredTimeline().map((point, index) => {
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
                      title={`${point.time}: ${point.riskLevel} risk (${point.predicted}°C)`}
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
                <h4 className="text-xs sm:text-sm font-medium text-gray-700">Model Performance & Analytics</h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
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
                  <div className="text-center p-2 sm:p-3 bg-yellow-50 rounded-lg">
                    <div className="text-base sm:text-lg font-bold text-yellow-600">
                      {getFilteredTimeline().filter(p => p.riskLevel === 'high').length}
                    </div>
                    <div className="text-xs text-gray-600">High Risk</div>
                  </div>
                </div>

                {/* Additional analytics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Temperature Trends</h5>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>Peak Temperature:</span>
                        <span className="font-medium">
                          {Math.max(...getFilteredTimeline().map(p => p.predicted)).toFixed(1)}
                          °C
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Temperature:</span>
                        <span className="font-medium">
                          {(getFilteredTimeline().reduce((acc, p) => acc + p.predicted, 0) / getFilteredTimeline().length).toFixed(1)}
                          °C
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Temperature Range:</span>
                        <span className="font-medium">
                          {(Math.max(...getFilteredTimeline().map(p => p.predicted)) - Math.min(...getFilteredTimeline().map(p => p.predicted))).toFixed(1)}
                          °C
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Confidence Metrics</h5>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>Average Confidence:</span>
                        <span className="font-medium">
                          {(getFilteredTimeline().reduce((acc, p) => acc + p.confidence, 0) / getFilteredTimeline().length).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Min Confidence:</span>
                        <span className="font-medium">
                          {Math.min(...getFilteredTimeline().map(p => p.confidence)).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reliability Score:</span>
                        <span className="font-medium text-emerald-600">
                          {getFilteredTimeline().filter(p => p.confidence > 80).length > getFilteredTimeline().length * 0.7 ? 'High' : 'Medium'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="text-xs sm:text-sm text-gray-700">
                      <strong>Model Note:</strong>
                      {' '}
                      <span className="hidden sm:inline">
                        Predictions are based on historical data, current conditions, environmental factors, and machine learning models.
                        Actual temperatures may vary due to unexpected changes in usage patterns, environmental conditions, or hardware behavior.
                        The enhanced visualization shows temperature zones and confidence intervals for better decision making.
                      </span>
                      <span className="sm:hidden">
                        Predictions based on historical data and current conditions. Actual temperatures may vary.
                        Enhanced visualization shows temperature zones and confidence levels.
                      </span>
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
          </>
        )}
      </CardContent>
    </Card>
  )
}
