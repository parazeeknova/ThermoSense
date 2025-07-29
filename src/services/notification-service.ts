'use client'

import type { NotificationData } from '@/types/electron-ipc'
import { useElectronNotifications, useIsElectron } from '@/hooks/use-electron-ipc'
import { trpc } from '@/lib/trpc'

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  urgency?: 'low' | 'normal' | 'critical'
  persistent?: boolean
  actions?: Array<{
    action: string
    title: string
  }>
}

export interface NotificationResult {
  success: boolean
  id?: string
  error?: string
  method: 'electron' | 'web' | 'trpc'
}

// Unified notification service that works in both web and Electron environments
export class NotificationService {
  private isElectron: boolean
  private electronNotifications: ReturnType<typeof useElectronNotifications> | null = null
  private sendNotificationMutation: { mutateAsync: (data: NotificationData) => Promise<{ success: boolean, id: string }> } | null = null

  constructor() {
    this.isElectron = typeof window !== 'undefined' && !!window.electronAPI
  }

  // Initialize the service with React hooks (must be called from a React component)
  initialize(electronNotifications: ReturnType<typeof useElectronNotifications>, sendNotificationMutation: { mutateAsync: (data: NotificationData) => Promise<{ success: boolean, id: string }> }) {
    this.electronNotifications = electronNotifications
    this.sendNotificationMutation = sendNotificationMutation
  }

  // Send a notification using the best available method
  async send(options: NotificationOptions): Promise<NotificationResult> {
    if (this.isElectron && this.electronNotifications?.isAvailable) {
      try {
        const success = await this.electronNotifications.showNotification({
          title: options.title,
          body: options.body,
          icon: options.icon,
        })

        if (success) {
          return {
            success: true,
            method: 'electron',
            id: Date.now().toString(),
          }
        }
      }
      catch (error) {
        console.warn('Electron notification failed, falling back to web:', error)
      }
    }

    // Try web notifications
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission()
          if (permission !== 'granted') {
            return {
              success: false,
              error: 'Notification permission denied',
              method: 'web',
            }
          }
        }

        if (Notification.permission === 'granted') {
          return {
            success: true,
            method: 'web',
            id: Date.now().toString(),
          }
        }
      }
      catch (error) {
        console.warn('Web notification failed, falling back to tRPC:', error)
      }
    }

    // Try tRPC notification (server-side logging)
    if (this.sendNotificationMutation) {
      try {
        const result = await this.sendNotificationMutation.mutateAsync({
          title: options.title,
          body: options.body,
          icon: options.icon,
          urgency: options.urgency,
        })

        return {
          success: result.success,
          method: 'trpc',
          id: result.id,
        }
      }
      catch (error) {
        console.error('tRPC notification failed:', error)
      }
    }

    // Fallback to console
    // eslint-disable-next-line no-console
    console.log(`📢 Notification: ${options.title} - ${options.body}`)
    return {
      success: true,
      method: 'web',
      id: Date.now().toString(),
    }
  }

  isSupported(): boolean {
    return (
      this.isElectron
      || (typeof window !== 'undefined' && 'Notification' in window)
    )
  }

  getPermissionStatus(): 'granted' | 'denied' | 'default' | 'unsupported' {
    if (this.isElectron) {
      return 'granted'
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission
    }

    return 'unsupported'
  }

  // Request notification permission
  async requestPermission(): Promise<'granted' | 'denied' | 'default'> {
    if (this.isElectron) {
      return 'granted'
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      return await Notification.requestPermission()
    }

    return 'denied'
  }
}

export const notificationService = new NotificationService()

// React hook for using the notification service
export function useNotificationService() {
  const isElectron = useIsElectron()
  const electronNotifications = useElectronNotifications()
  const sendNotificationMutation = trpc.system.sendNotification.useMutation()

  notificationService.initialize(electronNotifications, sendNotificationMutation)

  const sendNotification = async (options: NotificationOptions): Promise<NotificationResult> => {
    return await notificationService.send(options)
  }

  const requestPermission = async () => {
    return await notificationService.requestPermission()
  }

  return {
    sendNotification,
    requestPermission,
    isSupported: notificationService.isSupported(),
    permissionStatus: notificationService.getPermissionStatus(),
    isElectron,
    isLoading: sendNotificationMutation.isPending,
  }
}
