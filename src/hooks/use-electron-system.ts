import { useQuery } from '@tanstack/react-query'

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && !!window.electronAPI

export function useElectronSystemInfo() {
  return useQuery({
    queryKey: ['electron-system-info'],
    queryFn: async () => {
      if (!isElectron) {
        return null
      }

      try {
        const [systemInfo, appVersion, platform] = await Promise.all([
          window.electronAPI.getSystemInfo(),
          window.electronAPI.getAppVersion(),
          window.electronAPI.getPlatform(),
        ])

        return {
          ...systemInfo,
          electron: {
            version: appVersion,
            platform,
            isElectron: true,
          },
        }
      }
      catch (error) {
        console.error('Failed to get Electron system info:', error)
        return null
      }
    },
    enabled: isElectron,
    staleTime: 5000, // 5 seconds
    refetchInterval: 10000, // Refresh every 10 seconds
  })
}

export function useElectronNotifications() {
  const showNotification = async (data: { title: string, body: string, icon?: string }) => {
    if (!isElectron) {
      // Fallback to browser notifications
      if ('Notification' in window && Notification.permission === 'granted') {
        // eslint-disable-next-line no-new
        new Notification(data.title, {
          body: data.body,
          icon: data.icon,
        })
      }
      return
    }

    try {
      await window.electronAPI.showNotification(data)
    }
    catch (error) {
      console.error('Failed to show Electron notification:', error)
    }
  }

  return { showNotification, isElectron }
}

export function useElectronWindowControls() {
  const minimize = async () => {
    if (isElectron) {
      await window.electronAPI.minimizeWindow()
    }
  }

  const maximize = async () => {
    if (isElectron) {
      await window.electronAPI.maximizeWindow()
    }
  }

  const close = async () => {
    if (isElectron) {
      await window.electronAPI.closeWindow()
    }
  }

  const openExternal = async (url: string) => {
    if (isElectron) {
      await window.electronAPI.openExternal(url)
    }
    else {
      window.open(url, '_blank')
    }
  }

  return { minimize, maximize, close, openExternal, isElectron }
}
