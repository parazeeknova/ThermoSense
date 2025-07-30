'use client'

import type { ConnectionStatus } from '@/types/api-keys'
import { useState } from 'react'
import { trpc } from '@/lib/trpc'

export function useAPIKeyConfig() {
  const [isLoading, setIsLoading] = useState(false)

  // Queries
  const { data: status, refetch: refetchStatus } = trpc.apiKeys.getStatus.useQuery()
  const { data: maskedKeys, refetch: refetchMaskedKeys } = trpc.apiKeys.getMaskedKeys.useQuery()
  const { data: hasKeys } = trpc.apiKeys.hasKeys.useQuery()

  // Mutations
  const saveKeyMutation = trpc.apiKeys.saveKey.useMutation({
    onSuccess: () => {
      refetchStatus()
      refetchMaskedKeys()
    },
  })

  const removeKeyMutation = trpc.apiKeys.removeKey.useMutation({
    onSuccess: () => {
      refetchStatus()
      refetchMaskedKeys()
    },
  })

  const testConnectionMutation = trpc.apiKeys.testConnection.useMutation({
    onSuccess: () => {
      refetchStatus()
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

  // Default status values
  const defaultStatus: ConnectionStatus = {
    status: 'not_configured',
    message: 'No API key configured',
  }

  return {
    // Data
    geminiKey: maskedKeys?.gemini || '',
    openWeatherKey: maskedKeys?.openweather || '',
    geminiStatus: status?.gemini || defaultStatus,
    openWeatherStatus: status?.openweather || defaultStatus,
    hasGeminiKey: hasKeys?.gemini || false,
    hasOpenWeatherKey: hasKeys?.openweather || false,

    // Loading states
    isLoading: isLoading || saveKeyMutation.isPending || removeKeyMutation.isPending || testConnectionMutation.isPending,
    isSaving: saveKeyMutation.isPending,
    isRemoving: removeKeyMutation.isPending,
    isTesting: testConnectionMutation.isPending,

    // Actions
    saveGeminiKey,
    saveOpenWeatherKey,
    removeGeminiKey,
    removeOpenWeatherKey,
    testConnection,

    // Utilities
    refetch: () => {
      refetchStatus()
      refetchMaskedKeys()
    },
  }
}
