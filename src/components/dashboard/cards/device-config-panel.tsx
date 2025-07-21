'use client'

import type { DeviceConfiguration } from '@/types/dashboard'
import { Bell, Bluetooth, Laptop, Plus, Power, Settings, Smartphone, Thermometer, Trash2, Wifi } from 'lucide-react'
import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

// Mock device configurations
const mockDevices: DeviceConfiguration[] = [
  {
    id: 'laptop-001',
    name: 'MacBook Pro M2',
    type: 'laptop',
    isActive: true,
    sensorEnabled: true,
    thresholds: { safe: 35, caution: 42, critical: 50 },
    notifications: { enabled: true, sound: true, push: true },
  },
  {
    id: 'mobile-001',
    name: 'iPhone 15 Pro',
    type: 'mobile',
    isActive: false,
    sensorEnabled: true,
    thresholds: { safe: 30, caution: 38, critical: 45 },
    notifications: { enabled: true, sound: false, push: true },
  },
]

interface DeviceConfigPanelProps {
  devices?: DeviceConfiguration[]
}

export function DeviceConfigPanel({ devices = mockDevices }: DeviceConfigPanelProps) {
  const [deviceList, setDeviceList] = useState(devices)
  const [selectedDevice, setSelectedDevice] = useState<string | null>(deviceList[0]?.id || null)
  const [showAddDevice, setShowAddDevice] = useState(false)

  const selectedDeviceData = deviceList.find(d => d.id === selectedDevice)

  const updateDevice = (id: string, updates: Partial<DeviceConfiguration>) => {
    setDeviceList(prev => prev.map(device =>
      device.id === id ? { ...device, ...updates } : device,
    ))
  }

  const deleteDevice = (id: string) => {
    setDeviceList(prev => prev.filter(device => device.id !== id))
    if (selectedDevice === id) {
      setSelectedDevice(deviceList.find(d => d.id !== id)?.id || null)
    }
  }

  const addDevice = () => {
    const newDevice: DeviceConfiguration = {
      id: `device-${Date.now()}`,
      name: 'New Device',
      type: 'laptop',
      isActive: false,
      sensorEnabled: true,
      thresholds: { safe: 35, caution: 42, critical: 50 },
      notifications: { enabled: true, sound: true, push: true },
    }
    setDeviceList(prev => [...prev, newDevice])
    setSelectedDevice(newDevice.id)
    setShowAddDevice(false)
  }

  const getDeviceIcon = (type: 'laptop' | 'mobile') => {
    return type === 'laptop' ? <Laptop className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />
  }

  const getConnectionStatus = (device: DeviceConfiguration) => {
    if (!device.sensorEnabled)
      return { status: 'disabled', color: 'text-gray-500', label: 'Disabled' }
    if (device.isActive)
      return { status: 'connected', color: 'text-emerald-600', label: 'Connected' }
    return { status: 'disconnected', color: 'text-red-500', label: 'Disconnected' }
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-gray-900 flex items-center justify-between">
          <div className="flex items-center">
            <Settings className="w-5 h-5 mr-2 text-blue-600" />
            Device Configuration
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddDevice(true)}
            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Device
          </Button>
        </CardTitle>
        <p className="text-sm text-gray-600">Configure sensors, thresholds, and notifications for your devices</p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Connected Devices (
            {deviceList.length}
            )
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {deviceList.map((device) => {
              const connectionStatus = getConnectionStatus(device)
              return (
                <div
                  key={device.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedDevice === device.id
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedDevice(device.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getDeviceIcon(device.type)}
                      <span className="font-medium text-gray-900">{device.name}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${connectionStatus.color} border-current`}
                    >
                      {connectionStatus.label}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    {device.isActive && (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteDevice(device.id)
                      }}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {selectedDeviceData && (
          <div className="space-y-4 border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700">
              Configuration for
              {' '}
              {selectedDeviceData.name}
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">Device Status</label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={selectedDeviceData.isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateDevice(selectedDeviceData.id, { isActive: !selectedDeviceData.isActive })}
                    className={selectedDeviceData.isActive ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  >
                    <Power className="w-3 h-3 mr-1" />
                    {selectedDeviceData.isActive ? 'Active' : 'Inactive'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">Sensor Monitoring</label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={selectedDeviceData.sensorEnabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateDevice(selectedDeviceData.id, { sensorEnabled: !selectedDeviceData.sensorEnabled })}
                    className={selectedDeviceData.sensorEnabled ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    <Thermometer className="w-3 h-3 mr-1" />
                    {selectedDeviceData.sensorEnabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium text-gray-600">Temperature Thresholds (°C)</label>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm">Safe</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono">
                        ≤
                        {selectedDeviceData.thresholds.safe}
                        °C
                      </span>
                      <div className="flex-1 bg-emerald-100 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{ width: `${(selectedDeviceData.thresholds.safe / 60) * 100}%` }}
                        >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-sm">Caution</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono">
                        {selectedDeviceData.thresholds.safe + 1}
                        -
                        {selectedDeviceData.thresholds.caution}
                        °C
                      </span>
                      <div className="flex-1 bg-amber-100 rounded-full h-2">
                        <div
                          className="bg-amber-500 h-2 rounded-full"
                          style={{ width: `${(selectedDeviceData.thresholds.caution / 60) * 100}%` }}
                        >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Critical</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono">
                        ≥
                        {selectedDeviceData.thresholds.critical}
                        °C
                      </span>
                      <div className="flex-1 bg-red-100 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${(selectedDeviceData.thresholds.critical / 60) * 100}%` }}
                        >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium text-gray-600">Notification Preferences</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={selectedDeviceData.notifications.enabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateDevice(selectedDeviceData.id, {
                    notifications: { ...selectedDeviceData.notifications, enabled: !selectedDeviceData.notifications.enabled },
                  })}
                >
                  <Bell className="w-3 h-3 mr-1" />
                  Alerts
                </Button>

                <Button
                  variant={selectedDeviceData.notifications.sound ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateDevice(selectedDeviceData.id, {
                    notifications: { ...selectedDeviceData.notifications, sound: !selectedDeviceData.notifications.sound },
                  })}
                  disabled={!selectedDeviceData.notifications.enabled}
                >
                  <Wifi className="w-3 h-3 mr-1" />
                  Sound
                </Button>

                <Button
                  variant={selectedDeviceData.notifications.push ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateDevice(selectedDeviceData.id, {
                    notifications: { ...selectedDeviceData.notifications, push: !selectedDeviceData.notifications.push },
                  })}
                  disabled={!selectedDeviceData.notifications.enabled}
                >
                  <Bluetooth className="w-3 h-3 mr-1" />
                  Push
                </Button>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">Connection Health</span>
                <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                  98% Uptime
                </Badge>
              </div>
              <Progress value={98} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Last sync: 30s ago</span>
                <span>Signal: Strong</span>
              </div>
            </div>
          </div>
        )}

        {showAddDevice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
              <h3 className="text-lg font-bold mb-4">Add New Device</h3>
              <p className="text-sm text-gray-600 mb-4">
                Connect a new device to monitor its battery temperature and performance.
              </p>
              <div className="flex space-x-2">
                <Button onClick={addDevice} className="flex-1">
                  Add Device
                </Button>
                <Button variant="outline" onClick={() => setShowAddDevice(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
