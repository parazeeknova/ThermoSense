export interface SystemInfo {
  platform: string
  arch: string
  nodeVersion: string
  totalMemory: number
  freeMemory: number
  cpuCount: number
  uptime: number
  hostname: string
  temperature?: {
    cpu: number | null
    cores: number[]
    max: number | null
  }
  battery?: {
    hasBattery: boolean
    percent: number
    isCharging: boolean
    timeRemaining: number | null
  }
  load?: {
    currentLoad: number
    avgLoad: number
  }
  electronVersion?: string
  chromeVersion?: string
  appVersion?: string
  userInfo?: {
    username: string
    homedir: string
  }
  timestamp: string
}

export interface NotificationData {
  title: string
  body: string
  icon?: string
  urgency?: 'low' | 'normal' | 'critical'
}

export interface IPCResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface ElectronAPI {
  getSystemInfo: () => Promise<SystemInfo>
  showNotification: (data: NotificationData) => Promise<void>
  openExternal: (url: string) => Promise<void>
  onNotificationClick: (callback: (id: string) => void) => void
  removeAllListeners: (channel: string) => void
}
