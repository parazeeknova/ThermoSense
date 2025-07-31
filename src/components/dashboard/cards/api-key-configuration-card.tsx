'use client'

import type { ConnectionStatus } from '@/types/api-keys'
import { Activity, ExternalLink, Eye, EyeOff, Key, Monitor, MonitorOff, RefreshCw, Save, Settings, TestTube, Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAPIKeyRegistrationURL, getServiceDisplayName, maskAPIKey } from '@/lib/api-key-validation'

interface MonitoringState {
  isMonitoring: boolean
  lastCheck: string | null
  consecutiveFailures: number
}

interface APIKeyConfigurationCardProps {
  geminiKey?: string
  openWeatherKey?: string
  geminiStatus: ConnectionStatus
  openWeatherStatus: ConnectionStatus
  isLoading?: boolean
  isMonitoringEnabled?: boolean
  geminiMonitorState?: MonitoringState
  openweatherMonitorState?: MonitoringState
  onSaveGeminiKey: (key: string) => Promise<void>
  onSaveOpenWeatherKey: (key: string) => Promise<void>
  onRemoveGeminiKey: () => Promise<void>
  onRemoveOpenWeatherKey: () => Promise<void>
  onTestConnection: (service: 'gemini' | 'openweather') => Promise<void>
  onStartMonitoring?: (service: 'gemini' | 'openweather') => Promise<any>
  onStopMonitoring?: (service: 'gemini' | 'openweather') => Promise<any>
  onStartAllMonitoring?: () => Promise<any>
  onStopAllMonitoring?: () => Promise<any>
  onForceCheck?: (service: 'gemini' | 'openweather') => Promise<any>
}

interface APIKeyInputProps {
  service: 'gemini' | 'openweather'
  label: string
  value: string
  placeholder: string
  status: ConnectionStatus
  isLoading: boolean
  monitorState?: MonitoringState
  onSave: (key: string) => Promise<void>
  onRemove: () => Promise<void>
  onTest: () => Promise<void>
  onStartMonitoring?: () => Promise<void>
  onStopMonitoring?: () => Promise<void>
  onForceCheck?: () => Promise<void>
}

function APIKeyInput({
  service,
  label,
  value,
  placeholder,
  status,
  isLoading,
  monitorState,
  onSave,
  onRemove,
  onTest,
  onStartMonitoring,
  onStopMonitoring,
  onForceCheck,
}: APIKeyInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isMonitoringAction, setIsMonitoringAction] = useState(false)

  const hasKey = Boolean(value)
  const displayValue = hasKey ? (showKey ? value : maskAPIKey(value, service)) : inputValue

  const handleSave = async () => {
    if (!inputValue.trim() && !hasKey)
      return

    setIsSaving(true)
    try {
      await onSave(inputValue.trim() || value)
      if (!hasKey)
        setInputValue('')
    }
    finally {
      setIsSaving(false)
    }
  }

  const handleRemove = async () => {
    setIsSaving(true)
    try {
      await onRemove()
      setInputValue('')
    }
    finally {
      setIsSaving(false)
    }
  }

  const handleTest = async () => {
    setIsTesting(true)
    try {
      await onTest()
    }
    finally {
      setIsTesting(false)
    }
  }

  const handleStartMonitoring = async () => {
    if (!onStartMonitoring)
      return
    setIsMonitoringAction(true)
    try {
      await onStartMonitoring()
    }
    finally {
      setIsMonitoringAction(false)
    }
  }

  const handleStopMonitoring = async () => {
    if (!onStopMonitoring)
      return
    setIsMonitoringAction(true)
    try {
      await onStopMonitoring()
    }
    finally {
      setIsMonitoringAction(false)
    }
  }

  const handleForceCheck = async () => {
    if (!onForceCheck)
      return
    setIsTesting(true)
    try {
      await onForceCheck()
    }
    finally {
      setIsTesting(false)
    }
  }

  const getStatusColor = () => {
    switch (status.status) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      case 'testing': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'not_configured': return 'bg-gray-100 text-gray-600 border-gray-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getStatusIcon = () => {
    switch (status.status) {
      case 'connected': return '✓'
      case 'error': return '✗'
      case 'testing': return '⟳'
      case 'not_configured': return '○'
      default: return '○'
    }
  }

  return (
    <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Label htmlFor={`${service}-key`} className="text-sm font-medium text-gray-700">
            {label}
          </Label>
          <a
            href={getAPIKeyRegistrationURL(service)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title={`Get ${label} API Key`}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          {monitorState?.isMonitoring && (
            <div className="flex items-center space-x-1">
              <Activity className="w-3 h-3 text-green-600 animate-pulse" />
              <span className="text-xs text-green-600">Monitoring</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={`text-xs px-2 py-1 ${getStatusColor()}`}>
            <span className="mr-1">{getStatusIcon()}</span>
            {status.status === 'not_configured' ? 'Not Set' : status.status}
          </Badge>
        </div>
      </div>

      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <Input
            id={`${service}-key`}
            type={hasKey && !showKey ? 'password' : 'text'}
            value={hasKey ? displayValue : inputValue}
            onChange={e => !hasKey && setInputValue(e.target.value)}
            placeholder={hasKey ? 'API key configured' : placeholder}
            disabled={isLoading || isSaving}
            readOnly={hasKey && !showKey}
            className="pr-10"
          />
          {hasKey && (
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>

        <div className="flex space-x-1">
          {hasKey
            ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onForceCheck ? handleForceCheck : handleTest}
                    disabled={isTesting || isLoading}
                    title={onForceCheck ? 'Force connection check' : 'Test connection'}
                  >
                    {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                  </Button>
                  {onStartMonitoring && onStopMonitoring && (
                    <Button
                      size="sm"
                      variant={monitorState?.isMonitoring ? 'default' : 'outline'}
                      onClick={monitorState?.isMonitoring ? handleStopMonitoring : handleStartMonitoring}
                      disabled={isMonitoringAction || isLoading}
                      title={monitorState?.isMonitoring ? 'Stop monitoring' : 'Start monitoring'}
                    >
                      {isMonitoringAction
                        ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          )
                        : monitorState?.isMonitoring
                          ? (
                              <MonitorOff className="w-4 h-4" />
                            )
                          : (
                              <Monitor className="w-4 h-4" />
                            )}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleRemove}
                    disabled={isSaving || isLoading}
                    title="Remove key"
                  >
                    {isSaving ? <Trash2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                </>
              )
            : (
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!inputValue.trim() || isSaving || isLoading}
                  title="Save API key"
                >
                  {isSaving ? <Save className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </Button>
              )}
        </div>
      </div>

      {status.message && (
        <p className={`text-xs ${status.status === 'error' ? 'text-red-600' : status.status === 'connected' ? 'text-green-600' : 'text-gray-600'}`}>
          {status.message}
        </p>
      )}

      <div className="flex justify-between items-center text-xs text-gray-500">
        {status.lastTested && (
          <span>
            Last tested:
            {' '}
            {status.lastTested instanceof Date ? status.lastTested.toLocaleString() : new Date(status.lastTested).toLocaleString()}
          </span>
        )}
        {monitorState?.consecutiveFailures && monitorState.consecutiveFailures > 0 && (
          <span className="text-orange-600">
            {monitorState.consecutiveFailures}
            {' '}
            consecutive failures
          </span>
        )}
      </div>
    </div>
  )
}

export function APIKeyConfigurationCard({
  geminiKey,
  openWeatherKey,
  geminiStatus,
  openWeatherStatus,
  isLoading = false,
  isMonitoringEnabled = false,
  geminiMonitorState,
  openweatherMonitorState,
  onSaveGeminiKey,
  onSaveOpenWeatherKey,
  onRemoveGeminiKey,
  onRemoveOpenWeatherKey,
  onTestConnection,
  onStartMonitoring,
  onStopMonitoring,
  onStartAllMonitoring,
  onStopAllMonitoring,
  onForceCheck,
}: APIKeyConfigurationCardProps) {
  const [isGlobalMonitoringAction, setIsGlobalMonitoringAction] = useState(false)

  const handleStartAllMonitoring = async () => {
    if (!onStartAllMonitoring)
      return
    setIsGlobalMonitoringAction(true)
    try {
      await onStartAllMonitoring()
    }
    finally {
      setIsGlobalMonitoringAction(false)
    }
  }

  const handleStopAllMonitoring = async () => {
    if (!onStopAllMonitoring)
      return
    setIsGlobalMonitoringAction(true)
    try {
      await onStopAllMonitoring()
    }
    finally {
      setIsGlobalMonitoringAction(false)
    }
  }

  const hasAnyKeys = Boolean(geminiKey || openWeatherKey)
  const isAnyMonitoring = geminiMonitorState?.isMonitoring || openweatherMonitorState?.isMonitoring
  return (
    <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-2">
          <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            API Configuration
          </CardTitle>
          {isMonitoringEnabled && isAnyMonitoring && (
            <div className="flex items-center space-x-1">
              <Activity className="w-4 h-4 text-green-600 animate-pulse" />
              <span className="text-xs text-green-600">Live Monitoring</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasAnyKeys && onStartAllMonitoring && onStopAllMonitoring && (
            <Button
              size="sm"
              variant={isAnyMonitoring ? 'default' : 'outline'}
              onClick={isAnyMonitoring ? handleStopAllMonitoring : handleStartAllMonitoring}
              disabled={isGlobalMonitoringAction || isLoading}
              title={isAnyMonitoring ? 'Stop all monitoring' : 'Start all monitoring'}
            >
              {isGlobalMonitoringAction
                ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  )
                : isAnyMonitoring
                  ? (
                      <MonitorOff className="w-4 h-4" />
                    )
                  : (
                      <Monitor className="w-4 h-4" />
                    )}
            </Button>
          )}
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Settings className="h-5 w-5 text-indigo-600" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading
          ? (
              <div className="flex-1 flex items-center justify-center py-8">
                <div className="text-center">
                  <Key className="w-8 h-8 animate-pulse text-indigo-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Loading API configuration...</p>
                </div>
              </div>
            )
          : (
              <>
                <div className="text-center pb-3 border-b border-gray-100">
                  <p className="text-sm text-gray-600">
                    Configure your API keys to enable AI features and weather data
                  </p>
                </div>

                <APIKeyInput
                  service="gemini"
                  label={getServiceDisplayName('gemini')}
                  value={geminiKey || ''}
                  placeholder="AIza... (39 characters)"
                  status={geminiStatus}
                  isLoading={isLoading}
                  monitorState={geminiMonitorState}
                  onSave={onSaveGeminiKey}
                  onRemove={onRemoveGeminiKey}
                  onTest={() => onTestConnection('gemini')}
                  onStartMonitoring={onStartMonitoring ? () => onStartMonitoring('gemini') : undefined}
                  onStopMonitoring={onStopMonitoring ? () => onStopMonitoring('gemini') : undefined}
                  onForceCheck={onForceCheck ? () => onForceCheck('gemini') : undefined}
                />

                <APIKeyInput
                  service="openweather"
                  label={getServiceDisplayName('openweather')}
                  value={openWeatherKey || ''}
                  placeholder="32-character hex string"
                  status={openWeatherStatus}
                  isLoading={isLoading}
                  monitorState={openweatherMonitorState}
                  onSave={onSaveOpenWeatherKey}
                  onRemove={onRemoveOpenWeatherKey}
                  onTest={() => onTestConnection('openweather')}
                  onStartMonitoring={onStartMonitoring ? () => onStartMonitoring('openweather') : undefined}
                  onStopMonitoring={onStopMonitoring ? () => onStopMonitoring('openweather') : undefined}
                  onForceCheck={onForceCheck ? () => onForceCheck('openweather') : undefined}
                />

                <div className="pt-3 border-t border-gray-100">
                  <div className="text-center space-y-1">
                    <p className="text-xs text-gray-500">
                      API keys are encrypted and stored securely on your device
                    </p>
                    {isMonitoringEnabled && (
                      <p className="text-xs text-blue-600">
                        Real-time monitoring checks connections every 5 minutes
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
      </CardContent>
    </Card>
  )
}
