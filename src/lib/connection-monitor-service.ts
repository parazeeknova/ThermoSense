/* eslint-disable no-console */
import type { APIService, ConnectionStatus } from '@/types/api-keys'
import { apiValidationService } from './api-validation-service'
import { keyStorageService } from './key-storage-service'

interface MonitoringConfig {
  interval: number // in milliseconds
  retryAttempts: number
  retryDelay: number // in milliseconds
  services: APIService[]
}

interface ServiceMonitorState {
  isMonitoring: boolean
  lastCheck: Date | null
  consecutiveFailures: number
  intervalId: NodeJS.Timeout | null
}

class ConnectionMonitorService {
  private config: MonitoringConfig = {
    interval: 5 * 60 * 1000, // 5 minutes
    retryAttempts: 3,
    retryDelay: 30 * 1000, // 30 seconds
    services: ['gemini', 'openweather'],
  }

  private isServerSide = typeof window === 'undefined'

  private monitorStates: Map<APIService, ServiceMonitorState> = new Map()
  private statusCache: Map<APIService, ConnectionStatus> = new Map()
  private statusCallbacks: Map<APIService, Set<(status: ConnectionStatus) => void>> = new Map()

  constructor() {
    // Initialize monitor states for all services
    this.config.services.forEach((service) => {
      this.monitorStates.set(service, {
        isMonitoring: false,
        lastCheck: null,
        consecutiveFailures: 0,
        intervalId: null,
      })
      this.statusCallbacks.set(service, new Set())
    })
  }

  /**
   * Start monitoring a specific service
   */
  async startMonitoring(service: APIService): Promise<void> {
    // Only run monitoring on server side
    if (!this.isServerSide) {
      console.warn('Connection monitoring is only available on server side')
      return
    }

    const state = this.monitorStates.get(service)
    if (!state || state.isMonitoring) {
      return
    }

    // Check if the service has a configured key
    const hasKey = await keyStorageService.hasKey(service)
    if (!hasKey) {
      console.log(`Cannot start monitoring ${service}: No API key configured`)
      return
    }

    console.log(`Starting connection monitoring for ${service}`)

    state.isMonitoring = true
    state.consecutiveFailures = 0

    // Perform initial check
    await this.checkConnection(service)

    // Set up periodic monitoring
    state.intervalId = setInterval(async () => {
      await this.checkConnection(service)
    }, this.config.interval)

    this.monitorStates.set(service, state)
  }

  /**
   * Stop monitoring a specific service
   */
  stopMonitoring(service: APIService): void {
    if (!this.isServerSide) {
      return
    }

    const state = this.monitorStates.get(service)
    if (!state || !state.isMonitoring) {
      return
    }

    console.log(`Stopping connection monitoring for ${service}`)

    if (state.intervalId) {
      clearInterval(state.intervalId)
      state.intervalId = null
    }

    state.isMonitoring = false
    this.monitorStates.set(service, state)
  }

  /**
   * Start monitoring all configured services
   */
  async startAllMonitoring(): Promise<void> {
    for (const service of this.config.services) {
      await this.startMonitoring(service)
    }
  }

  stopAllMonitoring(): void {
    for (const service of this.config.services) {
      this.stopMonitoring(service)
    }
  }

  private async checkConnection(service: APIService): Promise<void> {
    const state = this.monitorStates.get(service)
    if (!state)
      return

    try {
      const key = await keyStorageService.getKey(service)
      if (!key) {
        // Key was removed, stop monitoring
        this.stopMonitoring(service)
        this.updateStatus(service, {
          status: 'not_configured',
          message: `No API key configured for ${service}`,
          lastTested: new Date(),
        })
        return
      }

      const status = await apiValidationService.testConnection(service, key)

      // Update state based on result
      if (status.status === 'connected') {
        state.consecutiveFailures = 0
        // Update last validated timestamp in storage
        await keyStorageService.updateKeyMetadata(service, {
          lastValidated: new Date().toISOString(),
        })
      }
      else {
        state.consecutiveFailures++

        // If we have too many consecutive failures, implement exponential backoff
        if (state.consecutiveFailures >= this.config.retryAttempts) {
          console.warn(`${service} has ${state.consecutiveFailures} consecutive failures, implementing backoff`)
          await this.implementBackoff(service)
        }
      }

      state.lastCheck = new Date()
      this.monitorStates.set(service, state)

      this.updateStatus(service, status)
    }
    catch (error) {
      console.error(`Error checking connection for ${service}:`, error)

      const errorStatus: ConnectionStatus = {
        status: 'error',
        message: 'Failed to check connection',
        lastTested: new Date(),
        error: {
          code: 'MONITOR_ERROR',
          message: error instanceof Error ? error.message : 'Unknown monitoring error',
        },
      }

      this.updateStatus(service, errorStatus)
    }
  }

  private async implementBackoff(service: APIService): Promise<void> {
    const state = this.monitorStates.get(service)
    if (!state || !state.intervalId)
      return

    clearInterval(state.intervalId)

    // Calculate backoff delay (exponential with max cap)
    const backoffMultiplier = Math.min(2 ** (state.consecutiveFailures - this.config.retryAttempts), 8)
    const backoffDelay = this.config.retryDelay * backoffMultiplier

    console.log(`Implementing ${backoffDelay}ms backoff for ${service}`)
    state.intervalId = setInterval(async () => {
      await this.checkConnection(service)

      // If connection is restored, reset to normal interval
      const currentState = this.monitorStates.get(service)
      if (currentState && currentState.consecutiveFailures === 0) {
        clearInterval(currentState.intervalId!)
        currentState.intervalId = setInterval(async () => {
          await this.checkConnection(service)
        }, this.config.interval)
        this.monitorStates.set(service, currentState)
      }
    }, backoffDelay)

    this.monitorStates.set(service, state)
  }

  private updateStatus(service: APIService, status: ConnectionStatus): void {
    this.statusCache.set(service, status)

    const callbacks = this.statusCallbacks.get(service)
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(status)
        }
        catch (error) {
          console.error(`Error in status callback for ${service}:`, error)
        }
      })
    }
  }

  getStatus(service: APIService): ConnectionStatus | null {
    return this.statusCache.get(service) || null
  }

  getAllStatus(): Record<string, ConnectionStatus> {
    const status: Record<string, ConnectionStatus> = {}

    for (const service of this.config.services) {
      const serviceStatus = this.statusCache.get(service)
      if (serviceStatus) {
        status[service] = serviceStatus
      }
      else {
        status[service] = {
          status: 'not_configured',
          message: `No status available for ${service}`,
          lastTested: new Date(),
        }
      }
    }

    return status
  }

  // Subscribe to status updates for a service
  onStatusChange(service: APIService, callback: (status: ConnectionStatus) => void): () => void {
    const callbacks = this.statusCallbacks.get(service)
    if (callbacks) {
      callbacks.add(callback)

      // Return unsubscribe function
      return () => {
        callbacks.delete(callback)
      }
    }

    return () => {} // No-op if service not found
  }

  async forceCheck(service: APIService): Promise<ConnectionStatus> {
    await this.checkConnection(service)
    return this.getStatus(service) || {
      status: 'error',
      message: 'Failed to get status after check',
      lastTested: new Date(),
    }
  }

  getMonitoringState(service: APIService): ServiceMonitorState | null {
    return this.monitorStates.get(service) || null
  }

  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig }

    // Restart monitoring with new config if any services are currently being monitored
    const monitoringServices = Array.from(this.monitorStates.entries())
      .filter(([, state]) => state.isMonitoring)
      .map(([service]) => service)

    if (monitoringServices.length > 0) {
      // Stop all monitoring
      this.stopAllMonitoring()

      // Restart with new config
      setTimeout(async () => {
        for (const service of monitoringServices) {
          await this.startMonitoring(service)
        }
      }, 1000)
    }
  }

  cleanup(): void {
    this.stopAllMonitoring()
    this.statusCache.clear()
    this.statusCallbacks.clear()
  }
}

// Export singleton instance
export const connectionMonitorService = new ConnectionMonitorService()
