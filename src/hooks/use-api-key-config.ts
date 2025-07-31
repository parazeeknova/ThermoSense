'use client'

import type { ConnectionStatus } from '@/types/api-keys'
import { useCallback, useEffect, useState } from 'react'
import { trpc } from '@/lib/trpc'

export function useAPIKeyConfig() {
  const [isLoading, setIsLoading] = useState(false)
  const [isMonitoringEnabled, setIsMonitoringEnabled] = useState(false)

  // Queries
  const { data: status, refetch: refetchStatus } = trpc.apiKeys.getStatus.useQuery()
  const { data: maskedKeys, refetch: refetchMaskedKeys } = trpc.apiKeys.getMaskedKeys.useQuery()
  const { data: hasKeys } = trpc.apiKeys.hasKeys.useQuery()

  // Real-time monitoring status (polls every 30 seconds when monitoring is enabled)
  const { data: monitorStatus, refetch: refetchMonitorStatus } = trpc.apiKeys.getMonitorStatus.useQuery(
    undefined,
    {
      enabled: isMonitoringEnabled,
      refetchInterval: 30000, // 30 seconds
      refetchIntervalInBackground: true,
    },
  )

  // Monitoring state queries
  const { data: geminiMonitorState } = trpc.apiKeys.getMonitoringState.useQuery(
    { service: 'gemini' },
    { enabled: isMonitoringEnabled },
  )
  const { data: openweatherMonitorState } = trpc.apiKeys.getMonitoringState.useQuery(
    { service: 'openweather' },
    { enabled: isMonitoringEnabled },
  )

  // Mutations
  const saveKeyMutation = trpc.apiKeys.saveKey.useMutation({
    onSuccess: () => {
      refetchStatus()
      refetchMaskedKeys()
      refetchMonitorStatus()
    },
  })

  const removeKeyMutation = trpc.apiKeys.removeKey.useMutation({
    onSuccess: () => {
      refetchStatus()
      refetchMaskedKeys()
      refetchMonitorStatus()
    },
  })

  const testConnectionMutation = trpc.apiKeys.testConnection.useMutation({
    onSuccess: () => {
      refetchStatus()
      refetchMonitorStatus()
    },
  })

  // Monitoring mutations
  const startMonitoringMutation = trpc.apiKeys.startMonitoring.useMutation()
  const stopMonitoringMutation = trpc.apiKeys.stopMonitoring.useMutation()
  const startAllMonitoringMutation = trpc.apiKeys.startAllMonitoring.useMutation()
  const stopAllMonitoringMutation = trpc.apiKeys.stopAllMonitoring.useMutation()
  const forceCheckMutation = trpc.apiKeys.forceCheck.useMutation({
    onSuccess: () => {
      refetchMonitorStatus()
    },
  })

  // Helper functions
  const saveGeminiKey = async (key: string) => {
    setIsLoading(true)
    try {
      const result = await saveKeyMutation.mutateAsync({
        service: 'gemini',
        key,
      })
      if (!result.success) {
        throw new Error(result.status.message)
      }
    }
    finally {
      setIsLoading(false)
    }
  }

  const saveOpenWeatherKey = async (key: string) => {
    setIsLoading(true)
    try {
      const result = await saveKeyMutation.mutateAsync({
        service: 'openweather',
        key,
      })
      if (!result.success) {
        throw new Error(result.status.message)
      }
    }
    finally {
      setIsLoading(false)
    }
  }

  const removeGeminiKey = async () => {
    setIsLoading(true)
    try {
      const result = await removeKeyMutation.mutateAsync({
        service: 'gemini',
      })
      if (!result.success) {
        throw new Error('error' in result ? result.error : 'Failed to remove key')
      }
    }
    finally {
      setIsLoading(false)
    }
  }

  const removeOpenWeatherKey = async () => {
    setIsLoading(true)
    try {
      const result = await removeKeyMutation.mutateAsync({
        service: 'openweather',
      })
      if (!result.success) {
        throw new Error('error' in result ? result.error : 'Failed to remove key')
      }
    }
    finally {
      setIsLoading(false)
    }
  }

  const testConnection = async (service: 'gemini' | 'openweather') => {
    setIsLoading(true)
    try {
      await testConnectionMutation.mutateAsync({ service })
    }
    finally {
      setIsLoading(false)
    }
  }

  // Monitoring functions
  const startMonitoring = useCallback(async (service: 'gemini' | 'openweather') => {
    try {
      const result = await startMonitoringMutation.mutateAsync({ service })
      if (result.success) {
        setIsMonitoringEnabled(true)
      }
      return result
    }
    catch (error) {
      console.error(`Failed to start monitoring for ${service}:`, error)
      throw error
    }
  }, [startMonitoringMutation])

  const stopMonitoring = useCallback(async (service: 'gemini' | 'openweather') => {
    try {
      const result = await stopMonitoringMutation.mutateAsync({ service })
      return result
    }
    catch (error) {
      console.error(`Failed to stop monitoring for ${service}:`, error)
      throw error
    }
  }, [stopMonitoringMutation])

  const startAllMonitoring = useCallback(async () => {
    try {
      const result = await startAllMonitoringMutation.mutateAsync()
      if (result.success) {
        setIsMonitoringEnabled(true)
      }
      return result
    }
    catch (error) {
      console.error('Failed to start monitoring for all services:', error)
      throw error
    }
  }, [startAllMonitoringMutation])

  const stopAllMonitoring = useCallback(async () => {
    try {
      const result = await stopAllMonitoringMutation.mutateAsync()
      if (result.success) {
        setIsMonitoringEnabled(false)
      }
      return result
    }
    catch (error) {
      console.error('Failed to stop monitoring for all services:', error)
      throw error
    }
  }, [stopAllMonitoringMutation])

  const forceCheck = useCallback(async (service: 'gemini' | 'openweather') => {
    try {
      const result = await forceCheckMutation.mutateAsync({ service })
      return result
    }
    catch (error) {
      console.error(`Failed to force check for ${service}:`, error)
      throw error
    }
  }, [forceCheckMutation])

  // Auto-start monitoring when keys are available
  useEffect(() => {
    const shouldStartMonitoring = (hasKeys?.gemini || hasKeys?.openweather) && !isMonitoringEnabled

    if (shouldStartMonitoring) {
      startAllMonitoring().catch((error) => {
        console.error('Failed to auto-start monitoring:', error)
      })
    }
  }, [hasKeys, isMonitoringEnabled, startAllMonitoring])

  // Default status values
  const defaultStatus: ConnectionStatus = {
    status: 'not_configured',
    message: 'No API key configured',
  }

  // Use monitor status if available and monitoring is enabled, otherwise fall back to regular status
  const currentGeminiStatus = (isMonitoringEnabled && monitorStatus?.gemini)
    ? monitorStatus.gemini
    : status?.gemini || defaultStatus

  const currentOpenWeatherStatus = (isMonitoringEnabled && monitorStatus?.openweather)
    ? monitorStatus.openweather
    : status?.openweather || defaultStatus

  return {
    // Data
    geminiKey: maskedKeys?.gemini || '',
    openWeatherKey: maskedKeys?.openweather || '',
    geminiStatus: currentGeminiStatus,
    openWeatherStatus: currentOpenWeatherStatus,
    hasGeminiKey: hasKeys?.gemini || false,
    hasOpenWeatherKey: hasKeys?.openweather || false,

    // Monitoring data
    isMonitoringEnabled,
    geminiMonitorState: geminiMonitorState || { isMonitoring: false, lastCheck: null, consecutiveFailures: 0 },
    openweatherMonitorState: openweatherMonitorState || { isMonitoring: false, lastCheck: null, consecutiveFailures: 0 },

    // Loading states
    isLoading: isLoading || saveKeyMutation.isPending || removeKeyMutation.isPending || testConnectionMutation.isPending,
    isSaving: saveKeyMutation.isPending,
    isRemoving: removeKeyMutation.isPending,
    isTesting: testConnectionMutation.isPending,
    isStartingMonitoring: startMonitoringMutation.isPending || startAllMonitoringMutation.isPending,
    isStoppingMonitoring: stopMonitoringMutation.isPending || stopAllMonitoringMutation.isPending,
    isForcingCheck: forceCheckMutation.isPending,

    // Actions
    saveGeminiKey,
    saveOpenWeatherKey,
    removeGeminiKey,
    removeOpenWeatherKey,
    testConnection,

    // Monitoring actions
    startMonitoring,
    stopMonitoring,
    startAllMonitoring,
    stopAllMonitoring,
    forceCheck,

    // Utilities
    refetch: () => {
      refetchStatus()
      refetchMaskedKeys()
      refetchMonitorStatus()
    },
  }
}
