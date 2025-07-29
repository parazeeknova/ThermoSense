'use client'

import { Activity, Cpu, HardDrive, MemoryStick, Monitor } from 'lucide-react'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useEnhancedSystemInfo } from '@/hooks/use-enhanced-system-info'

export function SystemOverviewCard() {
  const { systemInfo, loading: isLoading } = useEnhancedSystemInfo()

  if (isLoading) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            System Overview
          </CardTitle>
          <div className="p-2 bg-blue-100 rounded-lg">
            <Monitor className="h-5 w-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Activity className="w-8 h-8 animate-pulse text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading system info...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!systemInfo) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            System Overview
          </CardTitle>
          <div className="p-2 bg-gray-100 rounded-lg">
            <Monitor className="h-5 w-5 text-gray-600" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-gray-500">System information unavailable</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const memoryUsedPercentage = systemInfo.totalMemory && systemInfo.freeMemory
    ? ((systemInfo.totalMemory - systemInfo.freeMemory) / systemInfo.totalMemory) * 100
    : 0

  const formatBytes = (bytes: number) => {
    if (bytes === 0)
      return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (days > 0)
      return `${days}d ${hours}h ${minutes}m`
    if (hours > 0)
      return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          System Overview
        </CardTitle>
        <div className="p-2 bg-blue-100 rounded-lg">
          <Monitor className="h-5 w-5 text-blue-600" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Platform Information */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Platform:</span>
          <Badge variant="outline" className="text-xs">
            {systemInfo.platform}
            {' '}
            (
            {systemInfo.arch}
            )
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Hostname:</span>
          <span className="text-sm font-medium text-gray-900 truncate max-w-32">
            {systemInfo.hostname}
          </span>
        </div>

        {systemInfo.uptime && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Uptime:</span>
            <span className="text-sm font-medium text-gray-900">
              {formatUptime(systemInfo.uptime)}
            </span>
          </div>
        )}

        {/* CPU Information */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2 mb-2">
            <Cpu className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">CPU</span>
          </div>
          <div className="space-y-2 ml-6">
            {systemInfo.cpuCount && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Cores:</span>
                <span className="text-xs font-medium text-gray-900">
                  {systemInfo.cpuCount}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Node.js:</span>
              <span className="text-xs font-medium text-gray-900">
                {systemInfo.nodeVersion}
              </span>
            </div>
          </div>
        </div>

        {/* Memory Information */}
        {systemInfo.totalMemory && systemInfo.freeMemory && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <MemoryStick className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Memory</span>
            </div>
            <div className="space-y-2 ml-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Used:</span>
                <span className="text-xs font-medium text-gray-900">
                  {formatBytes(systemInfo.totalMemory - systemInfo.freeMemory)}
                  {' '}
                  /
                  {formatBytes(systemInfo.totalMemory)}
                </span>
              </div>
              <Progress value={memoryUsedPercentage} className="h-2" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Usage:</span>
                <Badge
                  variant={memoryUsedPercentage > 80 ? 'destructive' : memoryUsedPercentage > 60 ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {memoryUsedPercentage.toFixed(1)}
                  %
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Additional System Info */}
        {systemInfo.userInfo && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <HardDrive className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">User</span>
            </div>
            <div className="space-y-1 ml-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Username:</span>
                <span className="text-xs font-medium text-gray-900 truncate max-w-24">
                  {systemInfo.userInfo.username}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
