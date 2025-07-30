import type { ConnectionStatus } from '@/types/api-keys'
import { RemoveAPIKeyInput, SaveAPIKeyInput, TestConnectionInput } from '@/lib/api-key-validation'
import { apiValidationService } from '@/lib/api-validation-service'
import { keyStorageService } from '@/lib/key-storage-service'
import { publicProcedure, router } from '../trpc'

export const apiKeysRouter = router({
  // Save a new API key after validation
  saveKey: publicProcedure
    .input(SaveAPIKeyInput)
    .mutation(async ({ input }) => {
      try {
        const { service, key } = input

        // Validate the API key format and test connection
        const validation = await apiValidationService.validateAPIKey(service, key)

        if (!validation.isValid) {
          return {
            success: false,
            status: {
              status: 'error' as const,
              message: validation.errors.join(', '),
              lastTested: new Date(),
              error: {
                code: 'VALIDATION_FAILED',
                message: validation.errors.join(', '),
                details: validation,
              },
            } satisfies ConnectionStatus,
          }
        }

        // Save the key if validation passed
        await keyStorageService.saveKey(service, key)

        return {
          success: true,
          status: validation.connectionTest || {
            status: 'connected' as const,
            message: 'API key saved successfully',
            lastTested: new Date(),
          },
        }
      }
      catch (error) {
        console.error(`Failed to save ${input.service} API key:`, error)
        return {
          success: false,
          status: {
            status: 'error' as const,
            message: 'Failed to save API key',
            lastTested: new Date(),
            error: {
              code: 'SAVE_FAILED',
              message: error instanceof Error ? error.message : 'Unknown error',
            },
          } satisfies ConnectionStatus,
        }
      }
    }),

  // Remove an API key
  removeKey: publicProcedure
    .input(RemoveAPIKeyInput)
    .mutation(async ({ input }) => {
      try {
        await keyStorageService.removeKey(input.service)
        return { success: true }
      }
      catch (error) {
        console.error(`Failed to remove ${input.service} API key:`, error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }),

  // Test connection for a specific service
  testConnection: publicProcedure
    .input(TestConnectionInput)
    .mutation(async ({ input }) => {
      try {
        const key = await keyStorageService.getKey(input.service)

        if (!key) {
          return {
            status: 'not_configured' as const,
            message: `No API key configured for ${input.service}`,
            lastTested: new Date(),
          } satisfies ConnectionStatus
        }

        const status = await apiValidationService.testConnection(input.service, key)

        // Update the last validated timestamp
        if (status.status === 'connected') {
          await keyStorageService.updateKeyMetadata(input.service, {
            lastValidated: new Date().toISOString(),
          })
        }

        return status
      }
      catch (error) {
        console.error(`Failed to test ${input.service} connection:`, error)
        return {
          status: 'error' as const,
          message: 'Failed to test connection',
          lastTested: new Date(),
          error: {
            code: 'TEST_FAILED',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        } satisfies ConnectionStatus
      }
    }),

  // Get status for all configured API keys
  getStatus: publicProcedure
    .query(async () => {
      try {
        const services = ['gemini', 'openweather'] as const
        const status: Record<string, ConnectionStatus> = {}

        for (const service of services) {
          const hasKey = await keyStorageService.hasKey(service)

          if (!hasKey) {
            status[service] = {
              status: 'not_configured',
              message: `No API key configured for ${service}`,
              lastTested: new Date(),
            }
          }
          else {
            const config = await keyStorageService.getKeyConfig(service)
            status[service] = {
              status: 'connected', // Assume connected if key exists, actual testing happens on demand
              message: 'API key configured',
              lastTested: config?.lastValidated || new Date(),
            }
          }
        }

        return status
      }
      catch (error) {
        console.error('Failed to get API key status:', error)
        return {
          gemini: {
            status: 'error' as const,
            message: 'Failed to check status',
            lastTested: new Date(),
          },
          openweather: {
            status: 'error' as const,
            message: 'Failed to check status',
            lastTested: new Date(),
          },
        }
      }
    }),

  getMaskedKeys: publicProcedure
    .query(async () => {
      try {
        const services = ['gemini', 'openweather'] as const
        const maskedKeys: Record<string, string | null> = {}

        for (const service of services) {
          const key = await keyStorageService.getKey(service)
          if (key) {
            // Simple masking - show first 4 and last 4 characters
            if (key.length > 8) {
              maskedKeys[service] = `${key.slice(0, 4)}${'*'.repeat(key.length - 8)}${key.slice(-4)}`
            }
            else {
              maskedKeys[service] = '*'.repeat(key.length)
            }
          }
          else {
            maskedKeys[service] = null
          }
        }

        return maskedKeys
      }
      catch (error) {
        console.error('Failed to get masked keys:', error)
        return {
          gemini: null,
          openweather: null,
        }
      }
    }),

  hasKeys: publicProcedure
    .query(async () => {
      try {
        const services = ['gemini', 'openweather'] as const
        const hasKeys: Record<string, boolean> = {}

        for (const service of services) {
          hasKeys[service] = await keyStorageService.hasKey(service)
        }

        return hasKeys
      }
      catch (error) {
        console.error('Failed to check if keys exist:', error)
        return {
          gemini: false,
          openweather: false,
        }
      }
    }),
})
