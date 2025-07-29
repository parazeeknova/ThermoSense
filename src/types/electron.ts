/**
 * TypeScript interfaces for Electron IPC communication
 */

// Base IPC message structure
export interface IPCMessage<T = any> {
  id: string
  type: string
  payload: T
  timestamp: number
}

// IPC Response structure
export interface IPCResponse<T = any> {
  id: string
  success: boolean
  data?: T
  error?: string
  timestamp: number
}

// System Information Types
export interface SystemInfo {
  platform: string
  arch: string
  nodeVersion: string
  electronVersion: string
  chromeVersion: string
  appVersion: string
  totalMemory: number
  freeMemory: number
  cpuCount: number
  uptime: number
  hostname: string
  userInfo: {
    username: string
    homedir: string
    shell: string | null
  }
  timestamp: string
}

export interface EnhancedSystemInfo extends SystemInfo {
  temperature: {
    cpu: number | null
    cores: number[]
    max: number | null
    socket: number[]
    chipset: number | null
  }
  battery: {
    hasBattery: boolean
    cycleCount: number
    isCharging: boolean
    designedCapacity: number
    maxCapacity: number
    currentCapacity: number
    voltage: number
    capacityUnit: string
    percent: number
    timeRemaining: number | null
    acConnected: boolean
    type: string
    model: string
    manufacturer: string
    serial: string
  }
  cpu: {
    manufacturer: string
    brand: string
    speed: number
    cores: number
    physicalCores: number
    processors: number
  }
  load: {
    avgLoad: number
    currentLoad: number
    currentLoadUser: number
    currentLoadSystem: number
  }
}

// Notification Types
export interface NotificationData {
  title: string
  body: string
  icon?: string
  urgency?: 'low' | 'normal' | 'critical'
  actions?: NotificationAction[]
}

export interface NotificationAction {
  type: string
  text: string
}

export interface NotificationResponse {
  success: boolean
  error?: string
}

// Window Management Types
export interface WindowState {
  width: number
  height: number
  x: number
  y: number
  isMaximized: boolean
  isMinimized: boolean
  isFullScreen: boolean
}

export interface WindowOperation {
  success: boolean
  error?: string
}

// App Information Types
export interface AppInfo {
  version: string
  name: string
  platform: string
  isDev: boolean
}

// IPC Channel Types
export interface IPCChannels {
  // System Information
  'system:get-info': { request: void, response: SystemInfo }
  'system:get-enhanced-info': { request: void, response: EnhancedSystemInfo }

  // Notifications
  'notification:show': { request: NotificationData, response: NotificationResponse }

  // Window Management
  'window:minimize': { request: void, response: WindowOperation }
  'window:maximize': { request: void, response: WindowOperation }
  'window:close': { request: void, response: WindowOperation }
  'window:get-state': { request: void, response: WindowState }
  'window:set-state': { request: Partial<WindowState>, response: WindowOperation }

  // App Information
  'app:get-info': { request: void, response: AppInfo }
  'app:get-version': { request: void, response: string }
  'app:get-platform': { request: void, response: string }

  // External
  'external:open': { request: string, response: WindowOperation }
}

// Type-safe IPC API
export interface ElectronAPI {
  // System information
  getSystemInfo: () => Promise<SystemInfo>
  getEnhancedSystemInfo: () => Promise<EnhancedSystemInfo>

  // Notifications
  showNotification: (data: NotificationData) => Promise<NotificationResponse>

  // Window management
  minimizeWindow: () => Promise<WindowOperation>
  maximizeWindow: () => Promise<WindowOperation>
  closeWindow: () => Promise<WindowOperation>
  getWindowState: () => Promise<WindowState>
  setWindowState: (state: Partial<WindowState>) => Promise<WindowOperation>

  // External links
  openExternal: (url: string) => Promise<WindowOperation>

  // App info
  getAppInfo: () => Promise<AppInfo>
  getAppVersion: () => Promise<string>
  getPlatform: () => Promise<string>

  // Event listeners
  onWindowStateChanged: (callback: (state: WindowState) => void) => () => void
  onNotificationClicked: (callback: (data: NotificationData) => void) => () => void
}

// Global window interface extension
declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
