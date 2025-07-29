'use client'

import { Monitor, Smartphone } from 'lucide-react'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useElectronAppInfo, useElectronEnhancedSystemInfo, useIsElectron } from '@/hooks/use-electron-system'

export function ElectronStatus() {
  const isElectron = useIsElectron()
  const { appVersion, platform, isLoading: appInfoLoading } = useElectronAppInfo()
  const { data: systemInfo, isLoading: systemLoading } = useElectronEnhancedSystemInfo()

  if (!isElectron) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Platform Status
          </CardTitle>
          <div className="p-2 bg-blue-100 rounded-lg">
            <Smartphone className="h-5 w-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          <div className="text-center">
            <Badge variant="secondary" className="mb-2">
              Web Browser
            </Badge>
            <p className="text-sm text-gray-500">
              Running in web mode
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          Electron Status
        </CardTitle>
        <div className="p-2 bg-green-100 rounded-lg">
          <Monitor className="h-5 w-5 text-green-600" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Platform:</span>
          <Badge variant="outline" className="text-xs">
            {appInfoLoading ? 'Loading...' : platform || 'Unknown'}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Version:</span>
          <Badge variant="outline" className="text-xs">
            {appInfoLoading ? 'Loading...' : appVersion || '1.0.0'}
          </Badge>
        </div>

        {systemInfo && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">CPU Temp:</span>
              <Badge
                variant={systemInfo.temperature?.cpu && systemInfo.temperature.cpu > 70 ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {systemInfo.temperature?.cpu ? `${systemInfo.temperature.cpu.toFixed(1)}°C` : 'N/A'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">CPU Load:</span>
              <Badge
                variant={systemInfo.load?.currentLoad && systemInfo.load.currentLoad > 80 ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {systemInfo.load?.currentLoad ? systemInfo.load.currentLoad.toFixed(1) : '0'}
                %
              </Badge>
            </div>

            {systemInfo.battery?.hasBattery && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Battery:</span>
                <Badge
                  variant={systemInfo.battery?.percent && systemInfo.battery.percent < 20 ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {systemInfo.battery?.percent || 0}
                  %
                </Badge>
              </div>
            )}
          </>
        )}

        {systemLoading && (
          <div className="text-center">
            <Badge variant="secondary" className="text-xs">
              Loading system info...
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
