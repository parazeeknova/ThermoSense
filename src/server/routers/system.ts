/* eslint-disable node/prefer-global/process */
import { z } from 'zod'
import { publicProcedure, router } from '../trpc'

const NotificationInput = z.object({
  title: z.string(),
  body: z.string(),
  icon: z.string().optional(),
  urgency: z.enum(['low', 'normal', 'critical']).optional(),
})

export const systemRouter = router({
  getNotifications: publicProcedure.query(async () => {
    // This would typically fetch from a database or notification store
    // For now, returning mock notifications
    return [
      {
        id: '1',
        title: 'High Temperature Alert',
        body: 'CPU temperature has exceeded 80°C',
        type: 'warning',
        timestamp: new Date().toISOString(),
        read: false,
      },
      {
        id: '2',
        title: 'Battery Low',
        body: 'Battery level is below 20%',
        type: 'info',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        read: true,
      },
    ]
  }),

  sendNotification: publicProcedure
    .input(NotificationInput)
    .mutation(async ({ input }) => {
      try {
        // In Electron, this would trigger a native notification
        // For now, just logging the notification
        console.warn('Sending notification:', input)

        // If running in Electron, we could use IPC to send to main process
        if (typeof window !== 'undefined' && window.electronAPI) {
          await window.electronAPI.showNotification({
            title: input.title,
            body: input.body,
            icon: input.icon,
          })
        }

        return { success: true, id: Date.now().toString() }
      }
      catch (error) {
        console.error('Error sending notification:', error)
        throw new Error('Failed to send notification')
      }
    }),

  getAppInfo: publicProcedure.query(async () => {
    try {
      // Check if we're running in an Electron environment
      const isElectron = process.versions && !!process.versions.electron

      return {
        version: process.env.npm_package_version || '1.0.0',
        platform: process.platform,
        isElectron,
        electron: isElectron
          ? {
              version: process.versions.electron,
              chrome: process.versions.chrome,
              node: process.versions.node,
            }
          : null,
        timestamp: new Date().toISOString(),
      }
    }
    catch (error) {
      console.error('Error fetching app info:', error)
      throw new Error('Failed to fetch app information')
    }
  }),
})
