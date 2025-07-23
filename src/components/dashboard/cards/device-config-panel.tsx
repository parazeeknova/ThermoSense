'use client'

import { Bell, Bluetooth, Database, Download, Laptop, Power, Settings, Smartphone, Thermometer, Upload, Wifi } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useDeviceInfo } from '@/hooks/use-device-info'
import { useSystemStatus } from '@/hooks/use-system-status'

interface DeviceConfig {
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

export function DeviceConfigPanel() {
  const { data: deviceInfo, isLoading, error } = useDeviceInfo()
  const { health, connection, lastSync } = useSystemStatus()

  // Device configuration state (this could be persisted to localStorage or backend)
  const [deviceConfig, setDeviceConfig] = useState<DeviceConfig>({
    sensorEnabled: true,
    thresholds: { safe: 35, caution: 42, critical: 50 },
    notifications: { enabled: true, sound: true, push: true },
  })

  const updateConfig = (updates: Partial<DeviceConfig>) => {
    setDeviceConfig(prev => ({ ...prev, ...updates }))
    localStorage.setItem('thermosense-device-config', JSON.stringify({ ...deviceConfig, ...updates }))
  }

  const getDeviceType = () => {
    if (!deviceInfo?.battery?.hasBattery)
      return 'desktop'
    // Simple heuristic: if it has a battery and is portable
    return 'laptop'
  }

  const getDeviceName = () => {
    if (deviceInfo?.cpu?.brand) {
      return `${deviceInfo.cpu.manufacturer} ${deviceInfo.cpu.brand}`.trim()
    }
    return 'Current Device'
  }

  const getConnectionStatus = () => {
    if (!deviceConfig.sensorEnabled) {
      return { status: 'disabled', color: 'text-gray-500', label: 'Disabled' }
    }
    if (health?.isHealthy && connection?.isOnline) {
      return { status: 'connected', color: 'text-emerald-600', label: 'Connected' }
    }
    return { status: 'disconnected', color: 'text-red-500', label: 'Disconnected' }
  }

  const getDeviceIcon = () => {
    const deviceType = getDeviceType()
    return deviceType === 'laptop' ? <Laptop className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />
  }

  const formatLastSync = (timestamp: string) => {
    const now = new Date()
    const lastSyncTime = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - lastSyncTime.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`
    }
    if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`
    }
    return `${Math.floor(diffInSeconds / 3600)}h ago`
  }

  const getCurrentTemperature = () => {
    if (deviceInfo?.temperature?.cpu) {
      return deviceInfo.temperature.cpu
    }
    if (deviceInfo?.temperature?.cores?.length) {
      return deviceInfo.temperature.cores.reduce((sum, temp) => sum + temp, 0) / deviceInfo.temperature.cores.length
    }
    if (deviceInfo?.temperature?.max) {
      return deviceInfo.temperature.max
    }
    return null
  }

  const connectionStatus = getConnectionStatus()

  if (error) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <Settings className="w-8 h-8 mx-auto mb-2" />
            <p>Failed to load device information</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-base sm:text-lg font-bold text-gray-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
            <span className="hidden sm:inline">Device Configuration</span>
            <span className="sm:hidden">Device Config</span>
          </div>
          <Badge
            variant="outline"
            className={`text-xs ${connectionStatus.color} border-current`}
          >
            {connectionStatus.label}
          </Badge>
        </CardTitle>
        <p className="text-xs sm:text-sm text-gray-600">
          <span className="hidden sm:inline">Configure sensors, thresholds, and notifications for your device</span>
          <span className="sm:hidden">Configure device sensors & settings</span>
        </p>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6">
        {/* Current Device Info */}
        <div className="space-y-2">
          <h4 className="text-xs sm:text-sm font-medium text-gray-700">Current Device</h4>
          <div className="flex items-center justify-between p-2 sm:p-3 border rounded-lg border-blue-300 bg-blue-50">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="flex items-center space-x-2">
                {getDeviceIcon()}
                <span className="font-medium text-gray-900 text-sm truncate">
                  {isLoading ? 'Loading...' : getDeviceName()}
                </span>
              </div>
              <Badge
                variant="outline"
                className={`text-xs ${connectionStatus.color} border-current flex-shrink-0`}
              >
                <span className="hidden sm:inline">{connectionStatus.label}</span>
                <span className="sm:hidden">
                  {connectionStatus.label === 'Connected' ? 'On' : connectionStatus.label === 'Disconnected' ? 'Off' : 'Dis'}
                </span>
              </Badge>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              {health?.isHealthy && (
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>
        </div>

        {/* Device Status Controls */}
        <div className="space-y-3 sm:space-y-4 border-t pt-4">
          <h4 className="text-xs sm:text-sm font-medium text-gray-700">
            Configuration for
            {' '}
            {getDeviceName()}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Sensor Monitoring</label>
              <div className="flex items-center space-x-2">
                <Button
                  variant={deviceConfig.sensorEnabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateConfig({ sensorEnabled: !deviceConfig.sensorEnabled })}
                  className={`${deviceConfig.sensorEnabled ? 'bg-blue-600 hover:bg-blue-700' : ''} text-xs sm:text-sm`}
                >
                  <Thermometer className="w-3 h-3 mr-1" />
                  {deviceConfig.sensorEnabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Current Status</label>
              <div className="flex items-center space-x-2">
                <Badge className={`${health?.isHealthy ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'} text-xs`}>
                  <Power className="w-3 h-3 mr-1" />
                  {health?.isHealthy ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Real Device Information */}
          {deviceInfo && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-xs text-gray-600">CPU Cores</div>
                <div className="text-sm font-bold text-gray-900">{deviceInfo.cpu.cores}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600">CPU Load</div>
                <div className="text-sm font-bold text-gray-900">
                  {Math.round(deviceInfo.load.currentLoad)}
                  %
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600">Temperature</div>
                <div className="text-sm font-bold text-gray-900">
                  {(() => {
                    const temp = getCurrentTemperature()
                    return temp ? `${Math.round(temp)}°C` : 'N/A'
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Battery Information */}
          {deviceInfo?.battery?.hasBattery && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-green-50 rounded-lg">
              <div className="text-center">
                <div className="text-xs text-green-600">Battery Level</div>
                <div className="text-sm font-bold text-green-800">
                  {deviceInfo.battery.percent}
                  %
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-green-600">Health</div>
                <div className="text-sm font-bold text-green-800">
                  {deviceInfo.battery.maxCapacity && deviceInfo.battery.designedCapacity
                    ? `${Math.round((deviceInfo.battery.maxCapacity / deviceInfo.battery.designedCapacity) * 100)}%`
                    : 'N/A'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-green-600">Status</div>
                <div className="text-sm font-bold text-green-800">
                  {deviceInfo.battery.isCharging ? 'Charging' : 'Not Charging'}
                </div>
              </div>
            </div>
          )}

          {/* Temperature Thresholds */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-gray-600">Temperature Thresholds (°C)</label>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs sm:text-sm">Safe</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm font-mono">
                      ≤
                      {deviceConfig.thresholds.safe}
                      °C
                    </span>
                    <div className="flex-1 bg-emerald-100 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${(deviceConfig.thresholds.safe / 60) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-xs sm:text-sm">Caution</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm font-mono">
                      {deviceConfig.thresholds.safe + 1}
                      -
                      {deviceConfig.thresholds.caution}
                      °C
                    </span>
                    <div className="flex-1 bg-amber-100 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full"
                        style={{ width: `${(deviceConfig.thresholds.caution / 60) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs sm:text-sm">Critical</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm font-mono">
                      ≥
                      {deviceConfig.thresholds.critical}
                      °C
                    </span>
                    <div className="flex-1 bg-red-100 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${(deviceConfig.thresholds.critical / 60) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-gray-600">Notification Preferences</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={deviceConfig.notifications.enabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateConfig({
                  notifications: { ...deviceConfig.notifications, enabled: !deviceConfig.notifications.enabled },
                })}
                className="text-xs"
              >
                <Bell className="w-3 h-3 mr-1" />
                Alerts
              </Button>

              <Button
                variant={deviceConfig.notifications.sound ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateConfig({
                  notifications: { ...deviceConfig.notifications, sound: !deviceConfig.notifications.sound },
                })}
                disabled={!deviceConfig.notifications.enabled}
                className="text-xs"
              >
                <Wifi className="w-3 h-3 mr-1" />
                Sound
              </Button>

              <Button
                variant={deviceConfig.notifications.push ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateConfig({
                  notifications: { ...deviceConfig.notifications, push: !deviceConfig.notifications.push },
                })}
                disabled={!deviceConfig.notifications.enabled}
                className="text-xs"
              >
                <Bluetooth className="w-3 h-3 mr-1" />
                Push
              </Button>
            </div>
          </div>

          {/* Connection Health */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Connection Health</span>
              <Badge variant="outline" className="text-emerald-600 border-emerald-200 text-xs">
                {connection?.isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
            <Progress value={connection?.isOnline ? 98 : 0} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>
                Last sync:
                {lastSync ? formatLastSync(lastSync) : 'Never'}
              </span>
              <span>
                Signal:
                {' '}
                {connection?.latency ? `${connection.latency}ms` : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-medium text-gray-700">System Overview</h4>
            <Badge className="bg-blue-100 text-blue-800 text-xs">
              {deviceConfig.sensorEnabled ? 'Monitoring' : 'Idle'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Thermometer className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-800">
                  <span className="hidden sm:inline">Temperature Monitoring</span>
                  <span className="sm:hidden">Temp Monitor</span>
                </span>
              </div>
              <div className="text-base sm:text-lg font-bold text-emerald-700">
                {deviceConfig.sensorEnabled ? 'Active' : 'Inactive'}
              </div>
              <div className="text-xs text-emerald-600">Sensor status</div>
            </div>

            <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Bell className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-800">Notifications</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-blue-700">
                {deviceConfig.notifications.enabled ? 'Enabled' : 'Disabled'}
              </div>
              <div className="text-xs text-blue-600">Alert status</div>
            </div>
          </div>
        </div>

        {/* Data Sync Section */}
        <div className="space-y-3 border-t pt-4">
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
            <Database className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-purple-600" />
            Data Synchronization
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="flex items-center justify-center text-xs sm:text-sm">
              <Upload className="w-3 h-3 mr-1" />
              <span className="text-xs">Sync Now</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center justify-center text-xs sm:text-sm">
              <Download className="w-3 h-3 mr-1" />
              <span className="text-xs">Export Data</span>
            </Button>
          </div>

          <div className="p-2 bg-purple-50 rounded border border-purple-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-purple-700">Last backup</span>
              <span className="text-purple-600 font-medium">
                {lastSync ? formatLastSync(lastSync) : 'Never'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-purple-700">Data collection</span>
              <span className="text-purple-600 font-medium">
                {deviceConfig.sensorEnabled ? 'Active' : 'Paused'}
              </span>
            </div>
          </div>
        </div>

        {/* Monitoring Duration */}
        <div className="space-y-3 border-t pt-4">
          <div className="p-2 bg-gradient-to-r from-gray-50 to-blue-50 rounded border">
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">Monitoring since</div>
              <div className="text-sm font-bold text-blue-700">
                {deviceInfo?.timestamp ? new Date(deviceInfo.timestamp).toLocaleDateString() : 'Today'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
