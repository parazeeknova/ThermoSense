'use client'

import type { AIRecommendation, AlertLevel } from '@/types/dashboard'
import { AlertCircle, AlertTriangle, Bell, CheckCircle, Star, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Mock data - replace with actual data from your AI service
const mockRecommendations: AIRecommendation[] = [
  {
    id: '1',
    alertLevel: 'high',
    naturalLanguageTip: 'Your laptop battery is 45°C while it\'s 32°C outside. Consider moving to an air-conditioned room and reducing screen brightness to prevent thermal damage.',
    actions: ['Move to cooler location', 'Reduce screen brightness', 'Close unnecessary apps'],
    timestamp: '2024-01-15T14:30:00Z',
    isRead: false,
  },
  {
    id: '2',
    alertLevel: 'medium',
    naturalLanguageTip: 'Temperature difference is increasing. Your device might get warmer in the next 30 minutes based on weather predictions.',
    actions: ['Monitor device temperature', 'Prepare for cooling'],
    timestamp: '2024-01-15T14:15:00Z',
    isRead: true,
    userRating: 5,
  },
  {
    id: '3',
    alertLevel: 'low',
    naturalLanguageTip: 'Great news! Current conditions are optimal for your device\'s battery health. No action needed.',
    actions: [],
    timestamp: '2024-01-15T14:00:00Z',
    isRead: true,
    userRating: 4,
    userFeedback: 'Very helpful, thanks!',
  },
]

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

interface NotificationCenterProps {
  recommendations?: AIRecommendation[]
}

export function NotificationCenter({ recommendations = mockRecommendations }: NotificationCenterProps) {
  const [items, setItems] = useState(recommendations)
  const [selectedRating, setSelectedRating] = useState<Record<string, number>>({})

  const unreadCount = items.filter(item => !item.isRead).length

  const markAsRead = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, isRead: true } : item,
    ))
  }

  const deleteNotification = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
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
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
            Mark all read
          </Button>
        </CardTitle>
        <p className="text-sm text-gray-600">Personalized recommendations from your thermal advisor</p>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto space-y-4">
        {items.length === 0
          ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recommendations yet</p>
                <p className="text-xs">Your AI advisor will notify you when needed</p>
              </div>
            )
          : (
              items.map(item => (
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
              ))
            )}
      </CardContent>
    </Card>
  )
}
