export interface ConnectionStatus {
  status: 'connected' | 'error' | 'not_configured' | 'testing'
  message: string
  lastTested?: Date | string
  error?: {
    code: string
    message: string
    details?: any
  }
  metadata?: {
    rateLimitRemaining?: number
    quotaUsed?: number
    planType?: string
  }
}

export interface APIKeyConfiguration {
  id: string
  service: 'gemini' | 'openweather'
  keyHash: string // For verification without storing plain text
  encryptedKey: string
  isActive: boolean
  lastValidated: Date
  createdAt: Date
  updatedAt: Date
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
  connectionTest?: ConnectionStatus
}

export type APIService = 'gemini' | 'openweather'
