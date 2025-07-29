'use client'

import { useEffect, useState } from 'react'
import { trpc } from '@/lib/trpc'
import { useNotificationService } from '@/services/notification-service'
import { useEnhancedSystemInfo, useMemoryInfo } from './use-enhanced-system-info'

interface NotificationRule {
  id: string
  name: string
  condition: (data: any) => boolean
  title: string
  body: string
  urgency: 'low' | 'normal' | 'critical'
  cooldown: number // minutes
  enabled: boolean
}

interface NotificationHistory {
  ruleId: string
  timestamp: number
}

/**
 * Smart notification system that monitors system conditions and sends alerts
 */
export function useSmartNotifications() {
  const { sendNotification, isSupported } = useNotificationService()
  const { systemInfo } = useEnhancedSystemInfo()
  const memoryInfo = useMemoryInfo()
  const deviceInfo = trpc.device.getInfo.useQuery(undefined, {
    refetchInterval: 5000,
  })

  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>([])
  const [enabledRules, setEnabledRules] = useState<string[]>(['high-memory', 'high-temperature'])

  // Notification rules
  const rules: NotificationRule[] = [
    {
      id: 'high-memory',
      name: 'High Memory Usage',
      condition: data => (data.memoryInfo?.usedPercentage ?? 0) > 85,
      title: 'High Memory Usage Alert',
      body: 'Memory usage has exceeded 85%. Consider closing some applications.',
      urgency: 'normal',
      cooldown: 10, // 10 minutes
      enabled: true,
    },
    {
      id: 'critical-memory',
      name: 'Critical Memory Usage',
      condition: data => (data.memoryInfo?.usedPercentage ?? 0) > 95,
      title: 'Critical Memory Usage',
      body: 'Memory usage is critically high at over 95%. System may become unstable.',
      urgency: 'critical',
      cooldown: 5, // 5 minutes
      enabled: true,
    },
    {
      id: 'high-temperature',
      name: 'High CPU Temperature',
      condition: data => Boolean(data.deviceInfo?.temperature?.cpu && data.deviceInfo.temperature.cpu > 80),
      title: 'High CPU Temperature',
      body: 'CPU temperature has exceeded 80°C. Check cooling system.',
      urgency: 'normal',
      cooldown: 15, // 15 minutes
      enabled: true,
    },
    {
      id: 'critical-temperature',
      name: 'Critical CPU Temperature',
      condition: data => Boolean(data.deviceInfo?.temperature?.cpu && data.deviceInfo.temperature.cpu > 90),
      title: 'Critical CPU Temperature Warning',
      body: 'CPU temperature is critically high at over 90°C. Immediate attention required!',
      urgency: 'critical',
      cooldown: 5, // 5 minutes
      enabled: true,
    },
    {
      id: 'low-battery',
      name: 'Low Battery',
      condition: (data) => {
        const battery = data.deviceInfo?.battery
        return Boolean(battery && battery.percent < 20 && !battery.isCharging)
      },
      title: 'Low Battery Warning',
      body: 'Battery level is below 20%. Please connect to power.',
      urgency: 'normal',
      cooldown: 30, // 30 minutes
      enabled: true,
    },
    {
      id: 'system-startup',
      name: 'System Startup',
      condition: data => Boolean(data.systemInfo?.uptime && data.systemInfo.uptime < 300), // Less than 5 minutes
      title: 'ThermoSense Started',
      body: 'System monitoring is now active.',
      urgency: 'low',
      cooldown: 60, // 1 hour
      enabled: false, // Disabled by default
    },
  ]

  const checkRule = (rule: NotificationRule, data: any): boolean => {
    if (!rule.enabled || !enabledRules.includes(rule.id)) {
      return false
    }

    // Check cooldown
    const lastNotification = notificationHistory.find(h => h.ruleId === rule.id)
    if (lastNotification) {
      const cooldownMs = rule.cooldown * 60 * 1000
      const timeSinceLastNotification = Date.now() - lastNotification.timestamp
      if (timeSinceLastNotification < cooldownMs) {
        return false
      }
    }

    // Check condition
    try {
      return rule.condition(data)
    }
    catch (error) {
      console.error(`Error checking rule ${rule.id}:`, error)
      return false
    }
  }

  const triggerNotification = async (rule: NotificationRule) => {
    if (!isSupported)
      return

    const result = await sendNotification({
      title: rule.title,
      body: rule.body,
      urgency: rule.urgency,
      icon: '/favicon.ico',
    })

    if (result.success) {
      // Add to history
      setNotificationHistory(prev => [
        ...prev.filter(h => h.ruleId !== rule.id), // Remove old entry for this rule
        { ruleId: rule.id, timestamp: Date.now() },
      ])
    }
  }

  // Monitor system conditions
  useEffect(() => {
    if (!systemInfo && !memoryInfo && !deviceInfo.data)
      return

    const data = {
      systemInfo,
      memoryInfo,
      deviceInfo: deviceInfo.data,
    }

    // Check all rules
    rules.forEach((rule) => {
      if (checkRule(rule, data)) {
        triggerNotification(rule)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemInfo, memoryInfo, deviceInfo.data, enabledRules, notificationHistory])

  const toggleRule = (ruleId: string) => {
    setEnabledRules(prev =>
      prev.includes(ruleId)
        ? prev.filter(id => id !== ruleId)
        : [...prev, ruleId],
    )
  }

  const clearHistory = () => {
    setNotificationHistory([])
  }

  const testRule = async (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId)
    if (rule) {
      await triggerNotification(rule)
    }
  }

  return {
    rules,
    enabledRules,
    notificationHistory,
    toggleRule,
    clearHistory,
    testRule,
    isSupported,
  }
}
