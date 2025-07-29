'use client'

import { AlertCircle, AlertTriangle, Brain, Clock, Info, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useSmartNotifications } from '@/hooks/use-smart-notifications'

function formatTimestamp(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days > 0) {
    return `${days}d ago`
  }
  else if (hours > 0) {
    return `${hours}h ago`
  }
  else if (minutes > 0) {
    return `${minutes}m ago`
  }
  else {
    return 'Just now'
  }
}

function getUrgencyIcon(urgency: 'low' | 'normal' | 'critical') {
  switch (urgency) {
    case 'low':
      return <Info className="h-4 w-4 text-blue-500" />
    case 'normal':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case 'critical':
      return <AlertCircle className="h-4 w-4 text-red-500" />
  }
}

function getUrgencyBadge(urgency: 'low' | 'normal' | 'critical') {
  switch (urgency) {
    case 'low':
      return <Badge variant="secondary">Low</Badge>
    case 'normal':
      return <Badge variant="default">Normal</Badge>
    case 'critical':
      return <Badge variant="destructive">Critical</Badge>
  }
}

export function SmartNotificationsPanel() {
  const {
    rules,
    enabledRules,
    notificationHistory,
    toggleRule,
    clearHistory,
    isSupported,
  } = useSmartNotifications()

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Smart Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Smart notifications are not supported in this environment.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Smart Notifications
          </div>
          <Badge variant="outline">
            {enabledRules.length}
            {' '}
            of
            {rules.length}
            {' '}
            enabled
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Rules */}
        <div className="space-y-4">
          <h4 className="font-medium">Notification Rules</h4>
          <div className="space-y-3">
            {rules.map((rule) => {
              const isEnabled = enabledRules.includes(rule.id)
              const lastNotification = notificationHistory.find(h => h.ruleId === rule.id)

              return (
                <div
                  key={rule.id}
                  className="flex items-start justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {getUrgencyIcon(rule.urgency)}
                      <span className="font-medium">{rule.name}</span>
                      {getUrgencyBadge(rule.urgency)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {rule.body}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Cooldown:
                        {' '}
                        {rule.cooldown}
                        m
                      </span>
                      {lastNotification && (
                        <span>
                          Last sent:
                          {' '}
                          {formatTimestamp(lastNotification.timestamp)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Notification History */}
        {notificationHistory.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Recent Notifications</h4>
              <Button
                onClick={clearHistory}
                variant="outline"
                size="sm"
                className="text-muted-foreground"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {notificationHistory
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((notification, _index) => {
                  const rule = rules.find(r => r.id === notification.ruleId)
                  if (!rule)
                    return null

                  return (
                    <div
                      key={`${notification.ruleId}-${notification.timestamp}`}
                      className="flex items-center justify-between p-2 bg-muted rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        {getUrgencyIcon(rule.urgency)}
                        <span className="text-sm font-medium">{rule.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Smart notifications are monitoring your system
            </span>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-600">Active</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
