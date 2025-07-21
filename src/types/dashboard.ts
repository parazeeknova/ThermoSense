export interface TemperatureData {
  time: string
  deviceTemp: number
  outdoorTemp: number
  batteryHealth: number
}

export interface RiskLevel {
  name: string
  value: number
  color: string
}

export interface DeviceUsageData {
  device: string
  usage: number
}

export type DeviceType = 'laptop' | 'mobile'
export type RiskStatus = 'safe' | 'caution' | 'critical'
export type AlertLevel = 'low' | 'medium' | 'high' | 'critical'

export interface DashboardState {
  currentDeviceTemp: number
  currentOutdoorTemp: number
  selectedDevice: DeviceType
  batteryLevel: number
  cardOrder: string[]
}

export interface DraggableCardProps {
  id: string
  children: React.ReactNode
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, targetId: string) => void
  isDragging: boolean
  dragOverTarget: string | null
}

export interface SensorReading {
  timestamp: string
  batteryTemp: number
  ambientTemp: number
  cpuLoad: number
  deviceState: 'active' | 'idle' | 'sleep'
  location?: {
    lat: number
    lng: number
    city: string
  }
}

export interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  condition: string
  uvIndex: number
  location: string
  lastUpdated: string
}

export interface AIRecommendation {
  id: string
  alertLevel: AlertLevel
  naturalLanguageTip: string
  actions: string[]
  timestamp: string
  isRead: boolean
  userRating?: 1 | 2 | 3 | 4 | 5
  userFeedback?: string
}

export interface DeviceConfiguration {
  id: string
  name: string
  type: DeviceType
  isActive: boolean
  sensorEnabled: boolean
  thresholds: {
    safe: number
    caution: number
    critical: number
  }
  notifications: {
    enabled: boolean
    sound: boolean
    push: boolean
  }
}

export interface UserPreferences {
  units: 'celsius' | 'fahrenheit'
  language: string
  autoLocation: boolean
  dataLogging: boolean
  privacyMode: boolean
  updateInterval: number
}

export interface PredictiveData {
  nextHourTemp: number
  riskTrend: 'increasing' | 'decreasing' | 'stable'
  recommendedActions: string[]
  confidence: number
}
