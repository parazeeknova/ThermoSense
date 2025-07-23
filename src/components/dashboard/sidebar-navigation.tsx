'use client'

import { Activity, BarChart3, Battery, Brain, Calendar, ChevronLeft, ChevronRight, Gauge, Thermometer, TrendingUp, Wifi } from 'lucide-react'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useDeviceInfo } from '@/hooks/use-device-info'
import { useSystemStatus } from '@/hooks/use-system-status'

export type DashboardPage = 'monitoring' | 'analytics'

interface SidebarNavigationProps {
  currentPage: DashboardPage
  onPageChange: (page: DashboardPage) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  isMobile: boolean
  sidebarVisible: boolean
}

const pageConfig = {
  monitoring: {
    id: 'monitoring',
    title: 'Real-time Monitoring',
    description: 'Current status & immediate insights',
    icon: <Gauge className="w-5 h-5" />,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    shortTitle: 'Monitor',
  },
  analytics: {
    id: 'analytics',
    title: 'Analytics & Config',
    description: 'Historical data & predictions',
    icon: <Brain className="w-5 h-5" />,
    color: 'purple',
    gradient: 'from-purple-500 to-indigo-600',
    shortTitle: 'Analytics',
  },
} as const

export function SidebarNavigation({
  currentPage,
  onPageChange,
  isCollapsed,
  onToggleCollapse,
  isMobile,
  sidebarVisible,
}: SidebarNavigationProps) {
  const { data: deviceInfo } = useDeviceInfo()
  const { health, connection, lastSync } = useSystemStatus()

  const handlePageChange = (page: DashboardPage) => {
    if (page !== currentPage) {
      onPageChange(page)
    }
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

  if (isMobile && !sidebarVisible) {
    return null
  }

  return (
    <div
      className={`${
        isCollapsed ? 'w-16' : 'w-80'
      } bg-white/95 backdrop-blur-sm border-r border-gray-200/50 shadow-lg flex flex-col h-screen transition-all duration-300 ease-in-out ${
        isMobile
          ? `fixed left-0 top-0 z-40 transform transition-transform duration-300 ease-in-out ${
            sidebarVisible ? 'translate-x-0' : '-translate-x-full'
          }`
          : 'fixed left-0 top-0 z-40'
      }`}
    >
      {!isMobile && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="absolute -right-3 top-6 z-50 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 p-0"
        >
          {isCollapsed
            ? (
                <ChevronRight className="w-3 h-3 text-gray-600" />
              )
            : (
                <ChevronLeft className="w-3 h-3 text-gray-600" />
              )}
        </Button>
      )}

      <div className={`${isCollapsed ? 'p-3' : 'p-6'} border-b border-gray-200/50 transition-all duration-300`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} mb-4`}>
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div className="transition-opacity duration-300 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">ThermoSense</h2>
              <p className="text-sm text-gray-600 truncate">Battery Health Advisor</p>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div
            className={`flex items-center justify-between p-3 rounded-lg border transition-opacity duration-300 ${
              health?.isHealthy
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center space-x-2 min-w-0">
              <div
                className={`w-2 h-2 rounded-full animate-pulse flex-shrink-0 ${
                  health?.isHealthy ? 'bg-emerald-500' : 'bg-red-500'
                }`}
              >
              </div>
              <span
                className={`text-sm font-medium truncate ${
                  health?.isHealthy ? 'text-emerald-800' : 'text-red-800'
                }`}
              >
                {health?.isHealthy ? 'System Active' : 'System Error'}
              </span>
            </div>
            <Badge
              variant="outline"
              className={`flex-shrink-0 ${
                health?.isHealthy
                  ? 'text-emerald-600 border-emerald-300'
                  : 'text-red-600 border-red-300'
              }`}
            >
              {health?.isHealthy ? 'Live' : 'Error'}
            </Badge>
          </div>
        )}

        {isCollapsed && (
          <div className="flex justify-center">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              health?.isHealthy ? 'bg-emerald-500' : 'bg-red-500'
            }`}
            >
            </div>
          </div>
        )}
      </div>

      <div className={`${isCollapsed ? 'p-2' : 'p-6'} space-y-4 transition-all duration-300`}>
        {!isCollapsed && (
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Dashboard Pages
          </div>
        )}

        {Object.entries(pageConfig).map(([key, config]) => {
          const isActive = currentPage === key
          const page = key as DashboardPage

          return (
            <div key={key} className="relative">
              <Button
                variant="ghost"
                onClick={() => handlePageChange(page)}
                className={`w-full justify-start ${isCollapsed ? 'p-2 h-12' : 'p-4 h-auto'} transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg transform scale-[1.02]`
                    : 'hover:bg-gray-50 hover:scale-[1.01] text-gray-700'
                }`}
                title={isCollapsed ? config.title : undefined}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-4'} w-full min-w-0`}>
                  <div
                    className={`${isCollapsed ? 'p-1' : 'p-2'} rounded-lg transition-colors flex-shrink-0 ${
                      isActive ? 'bg-white/20' : `bg-${config.color}-100`
                    }`}
                  >
                    <div className={isActive ? 'text-white' : `text-${config.color}-600`}>
                      {config.icon}
                    </div>
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 text-left min-w-0">
                      <div
                        className={`font-semibold transition-colors truncate ${
                          isActive ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {config.title}
                      </div>
                      <div
                        className={`text-sm transition-colors truncate ${
                          isActive ? 'text-white/80' : 'text-gray-500'
                        }`}
                      >
                        {config.description}
                      </div>
                    </div>
                  )}
                </div>
              </Button>

              {isActive && (
                <div
                  className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b ${config.gradient} rounded-l-full transition-all duration-300`}
                />
              )}
            </div>
          )
        })}
      </div>

      {!isCollapsed && (
        <div className="p-6 border-t border-gray-200/50 overflow-y-auto flex-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
            System Overview
          </div>

          <div className="space-y-4">
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              connection?.isOnline
                ? connection.status === 'stable'
                  ? 'bg-blue-50'
                  : 'bg-yellow-50'
                : 'bg-red-50'
            }`}
            >
              <div className="flex items-center space-x-2 min-w-0">
                <Wifi className={`w-4 h-4 flex-shrink-0 ${
                  connection?.isOnline
                    ? connection.status === 'stable'
                      ? 'text-blue-600'
                      : 'text-yellow-600'
                    : 'text-red-600'
                }`}
                />
                <span className={`text-sm font-medium truncate ${
                  connection?.isOnline
                    ? connection.status === 'stable'
                      ? 'text-blue-800'
                      : 'text-yellow-800'
                    : 'text-red-800'
                }`}
                >
                  Connection
                </span>
              </div>
              <Badge
                variant="outline"
                className={`text-xs flex-shrink-0 ${
                  connection?.isOnline
                    ? connection.status === 'stable'
                      ? 'text-blue-600 border-blue-300'
                      : 'text-yellow-600 border-yellow-300'
                    : 'text-red-600 border-red-300'
                }`}
              >
                {connection?.isOnline
                  ? connection.status === 'stable'
                    ? 'Stable'
                    : 'Slow'
                  : 'Offline'}
              </Badge>
            </div>

            {deviceInfo?.battery && (
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 min-w-0">
                    <Battery className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-orange-800 truncate">Battery Health</span>
                  </div>
                  <span className="text-xs text-orange-600 flex-shrink-0">
                    {deviceInfo.battery.percent ? `${Math.round(deviceInfo.battery.percent)}%` : 'N/A'}
                  </span>
                </div>
                <Progress value={deviceInfo.battery.percent || 0} className="h-2" />
              </div>
            )}

            {deviceInfo?.temperature && (
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 min-w-0">
                    <Thermometer className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-red-800 truncate">Temperature</span>
                  </div>
                  <span className="text-xs text-red-600 flex-shrink-0">
                    {deviceInfo.temperature.cpu ? `${Math.round(deviceInfo.temperature.cpu)}°C` : 'N/A'}
                  </span>
                </div>
                {deviceInfo.temperature.cpu && (
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-3 h-3 text-red-500 flex-shrink-0" />
                    <span className="text-xs text-red-600 truncate">
                      {deviceInfo.temperature.cpu > 60 ? 'High' : 'Normal'}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 min-w-0">
                <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-800 truncate">Last Sync</span>
              </div>
              <span className="text-xs text-gray-600 flex-shrink-0">
                {lastSync ? formatLastSync(lastSync) : 'Never'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className={`${isCollapsed ? 'p-2' : 'p-6'} border-t border-gray-200/50 space-y-3 transition-all duration-300`}>
        {!isCollapsed && (
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Quick Actions
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className={`w-full ${isCollapsed ? 'px-2' : 'justify-start'}`}
          title={isCollapsed ? 'Export Data' : undefined}
        >
          <BarChart3 className="w-4 h-4 mr-2 flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Export Data</span>}
        </Button>
      </div>

      {!isCollapsed && (
        <div className="p-6 border-t border-gray-200/50 mt-auto">
          <div className="text-center">
            <div className="text-xs text-gray-500 truncate">ThermoSense v1.0</div>
            <div className="text-xs text-gray-400 mt-1 truncate">Battery Health Monitoring</div>
          </div>
        </div>
      )}
    </div>
  )
}
