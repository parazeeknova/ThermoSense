'use client'

import { Globe, Monitor, Package } from 'lucide-react'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useElectronAppInfo, useIsElectron } from '@/hooks/use-electron-system'

export function PlatformDetailsCard() {
  const isElectron = useIsElectron()
  const { appVersion, platform, isLoading } = useElectronAppInfo()

  if (isLoading) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Platform Details
          </CardTitle>
          <div className="p-2 bg-gray-100 rounded-lg">
            <Package className="h-5 w-5 text-gray-600" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-8 h-8 animate-pulse text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading platform info...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getPlatformIcon = () => {
    if (!isElectron)
      return <Globe className="h-5 w-5 text-blue-600" />
    return <Monitor className="h-5 w-5 text-green-600" />
  }

  const getPlatformColor = () => {
    if (!isElectron)
      return 'bg-blue-100'
    return 'bg-green-100'
  }

  const getPlatformName = () => {
    if (!isElectron)
      return 'Web Browser'

    switch (platform) {
      case 'win32': return 'Windows'
      case 'darwin': return 'macOS'
      case 'linux': return 'Linux'
      default: return platform || 'Unknown'
    }
  }

  const getEnvironmentDetails = () => {
    if (!isElectron) {
      return {
        runtime: 'Browser',
        version: navigator.userAgent.includes('Chrome')
          ? 'Chrome'
          : navigator.userAgent.includes('Firefox')
            ? 'Firefox'
            : navigator.userAgent.includes('Safari') ? 'Safari' : 'Unknown',
        features: ['Web APIs', 'Service Workers', 'PWA Support'],
      }
    }

    return {
      runtime: 'Electron',
      version: appVersion || 'Unknown',
      features: ['Native APIs', 'File System', 'System Integration', 'Auto Updates'],
    }
  }

  const environmentDetails = getEnvironmentDetails()

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          Platform Details
        </CardTitle>
        <div className={`p-2 rounded-lg ${getPlatformColor()}`}>
          {getPlatformIcon()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Platform Type */}
        <div className="text-center pb-3 border-b border-gray-100">
          <Badge
            variant={isElectron ? 'default' : 'secondary'}
            className="mb-2 text-sm px-3 py-1"
          >
            {isElectron ? 'Desktop Application' : 'Web Application'}
          </Badge>
          <p className="text-lg font-semibold text-gray-900">
            {getPlatformName()}
          </p>
          <p className="text-sm text-gray-500">
            {environmentDetails.runtime}
            {' '}
            Runtime
          </p>
        </div>

        {/* Runtime Information */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Runtime:</span>
            <span className="text-sm font-medium text-gray-900">
              {environmentDetails.runtime}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Version:</span>
            <span className="text-sm font-medium text-gray-900">
              {environmentDetails.version}
            </span>
          </div>

          {isElectron && platform && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Platform:</span>
              <span className="text-sm font-medium text-gray-900">
                {platform}
              </span>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2 mb-3">
            <Package className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">Available Features</span>
          </div>
          <div className="space-y-2">
            {environmentDetails.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                <span className="text-xs text-gray-600">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="pt-3 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              {isElectron
                ? 'Running as native desktop application with full system access'
                : 'Running in web browser with standard web APIs'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
