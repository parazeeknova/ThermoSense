'use client'

import type { AIRecommendation, AlertLevel } from '@/types/dashboard'
import { AlertCircle, AlertTriangle, Bell, CheckCircle, Loader2, RefreshCw, Star, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const alertLevelConfig: Record<AlertLevel, { color: string, icon: React.ReactNode, bgColor: string }> = {
  low: {
    color: 'text-emerald-600',
    icon: <CheckCircle className="w-4 h-4" />,
    bgColor: 'bg-emerald-50 border-emerald-200',
  },
  medium: {
    color: 'text-amber-600',
    icon: <AlertCircle className="w-4 h-4" />,
    bgColor: 'bg-amber-50 border-amber-200',
  },
  high: {
    color: 'text-orange-600',
    icon: <AlertTriangle className="w-4 h-4" />,
    bgColor: 'bg-orange-50 border-orange-200',
  },
  critical: {
    color: 'text-red-600',
    icon: <AlertTriangle className="w-4 h-4" />,
    bgColor: 'bg-red-50 border-red-200',
  },
}

// Local storage key for persistence
const STORAGE_KEY = 'thermosense-notifications'

interface NotificationCenterProps {
  recommendations?: AIRecommendation[]
  deviceTemp?: number
  batteryLevel?: number
  weatherTemp?: number
  cpuUsage?: number
  screenBrightness?: number
  activeApps?: number
}

export function NotificationCenter({
  recommendations: initialRecommendations = [],
  deviceTemp,
  batteryLevel,
  weatherTemp,
  cpuUsage,
  screenBrightness,
  activeApps,
}: NotificationCenterProps) {
  const [items, setItems] = useState<AIRecommendation[]>([])
  const [selectedRating, setSelectedRating] = useState<Record<string, number>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setItems(parsed)
        // Load ratings as well
        const storedRatings = localStorage.getItem(`${STORAGE_KEY}-ratings`)
        if (storedRatings) {
          setSelectedRating(JSON.parse(storedRatings))
        }
      }
      catch (error) {
        console.error('Error loading stored notifications:', error)
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(`${STORAGE_KEY}-ratings`)
        // Fall back to initial recommendations if provided
        if (initialRecommendations.length > 0) {
          setItems(initialRecommendations)
        }
      }
    }
    else if (initialRecommendations.length > 0) {
      setItems(initialRecommendations)
    }
    setIsInitialized(true)
  }, [initialRecommendations])

  // Save to localStorage when items change (but not on initial load)
  useEffect(() => {
    if (!isInitialized)
      return

    if (items.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }
    else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [items, isInitialized])

  // Save ratings to localStorage when they change (but not on initial load)
  useEffect(() => {
    if (!isInitialized)
      return

    if (Object.keys(selectedRating).length > 0) {
      localStorage.setItem(`${STORAGE_KEY}-ratings`, JSON.stringify(selectedRating))
    }
  }, [selectedRating, isInitialized])

  const unreadCount = items.filter(item => !item.isRead).length

  const generateRecommendations = async () => {
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

      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate recommendations')
      }

      // Add new recommendations to the beginning of the list
      setItems(prev => [...data.recommendations, ...prev])
    }
    catch (err) {
      console.error('Failed to generate recommendations:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations')
    }
    finally {
      setIsGenerating(false)
    }
  }

  const markAsRead = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, isRead: true } : item,
    ))
  }

  const markAllAsRead = () => {
    setItems(prev => prev.map(item => ({ ...item, isRead: true })))
  }

  const deleteNotification = (id: string) => {
    setItems((prev) => {
      const newItems = prev.filter(item => item.id !== id)
      // If no items left, clear localStorage
      if (newItems.length === 0) {
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(`${STORAGE_KEY}-ratings`)
      }
      return newItems
    })
    // Also remove the rating for this item
    setSelectedRating((prev) => {
      const newRatings = { ...prev }
      delete newRatings[id]
      return newRatings
    })
  }

  const clearAllNotifications = () => {
    setItems([])
    setSelectedRating({})
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(`${STORAGE_KEY}-ratings`)
  }

  const rateRecommendation = (id: string, rating: number) => {
    setSelectedRating(prev => ({ ...prev, [id]: rating }))
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, userRating: rating as 1 | 2 | 3 | 4 | 5 } : item,
    ))
  }

  const formatTimestamp = (timestamp: string) => {
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
        <CardTitle className="text-lg font-bold text-gray-900 flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="w-5 h-5 mr-2 text-emerald-600" />
            AI Advisory Center
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-xs px-2 py-1">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generateRecommendations}
              disabled={isGenerating}
              className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
            >
              {isGenerating
                ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  )
                : (
                    <RefreshCw className="w-4 h-4 mr-1" />
                  )}
              {isGenerating ? 'Generating...' : 'Generate AI Tips'}
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
                onClick={markAllAsRead}
              >
                Mark all read
              </Button>
            )}
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={clearAllNotifications}
              >
                Clear all
              </Button>
            )}
          </div>
        </CardTitle>
        <p className="text-sm text-gray-600">Personalized recommendations from your thermal advisor</p>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
            {error}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-4">
        {isGenerating && (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <p>AI is analyzing your device conditions...</p>
          </div>
        )}

        {!isGenerating && items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No recommendations yet</p>
            <p className="text-xs mb-4">Click "Generate AI Tips" to get personalized advice</p>
            <Button
              variant="outline"
              onClick={generateRecommendations}
              className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Generate AI Tips
            </Button>
          </div>
        )}

        {!isGenerating && items.length > 0 && items.map(item => (
          <div
            key={item.id}
            className={`border rounded-lg p-4 transition-all duration-200 ${
              !item.isRead ? 'bg-blue-50 border-blue-200' : alertLevelConfig[item.alertLevel].bgColor
            }`}
            onClick={() => !item.isRead && markAsRead(item.id)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={alertLevelConfig[item.alertLevel].color}>
                  {alertLevelConfig[item.alertLevel].icon}
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${alertLevelConfig[item.alertLevel].color} border-current`}
                >
                  {item.alertLevel.toUpperCase()}
                </Badge>
                <span className="text-xs text-gray-500">{formatTimestamp(item.timestamp)}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteNotification(item.id)
                }}
                className="text-gray-400 hover:text-red-500 p-1"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            <p className="text-gray-800 text-sm mb-3 leading-relaxed">
              {item.naturalLanguageTip}
            </p>

            {item.actions.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-600 mb-2">Recommended Actions:</p>
                <div className="flex flex-wrap gap-1">
                  {item.actions.map((action, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {action}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-500">Rate this tip:</span>
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    type="button"
                    key={rating}
                    onClick={(e) => {
                      e.stopPropagation()
                      rateRecommendation(item.id, rating)
                    }}
                    className={`transition-colors ${
                      (selectedRating[item.id] || item.userRating || 0) >= rating
                        ? 'text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    <Star className="w-3 h-3 fill-current" />
                  </button>
                ))}
              </div>

              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" className="p-1 text-gray-400 hover:text-green-500">
                  <ThumbsUp className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" className="p-1 text-gray-400 hover:text-red-500">
                  <ThumbsDown className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {item.userFeedback && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
                <strong>Your feedback:</strong>
                {' '}
                {item.userFeedback}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
