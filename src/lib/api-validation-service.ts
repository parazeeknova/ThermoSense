import type { APIService, ConnectionStatus, ValidationResult } from '@/types/api-keys'
import { validateAPIKeyFormat } from './api-key-validation'

class APIValidationService {
  /**
   * Test Gemini API key by making a simple API call
   */
  private async testGeminiConnection(apiKey: string): Promise<ConnectionStatus> {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
        method: 'GET',
        headers: {
          'X-goog-api-key': apiKey,
        },
      })

      if (response.ok) {
        const data = await response.json()
        return {
          status: 'connected',
          message: `Connected successfully. Found ${data.models?.length || 0} available models.`,
          lastTested: new Date(),
          metadata: {
            planType: 'Free/Paid', // Gemini doesn't provide plan info in this endpoint
          },
        }
      }
      else if (response.status === 401) {
        return {
          status: 'error',
          message: 'Invalid API key or authentication failed',
          lastTested: new Date(),
          error: {
            code: 'INVALID_API_KEY',
            message: 'The provided API key is invalid or has been revoked',
          },
        }
      }
      else if (response.status === 403) {
        return {
          status: 'error',
          message: 'API key does not have required permissions',
          lastTested: new Date(),
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'The API key lacks necessary permissions for Gemini API access',
          },
        }
      }
      else if (response.status === 429) {
        return {
          status: 'error',
          message: 'Rate limit exceeded. Please try again later.',
          lastTested: new Date(),
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please wait before testing again.',
          },
        }
      }
      else {
        return {
          status: 'error',
          message: `API connection failed with status ${response.status}`,
          lastTested: new Date(),
          error: {
            code: 'CONNECTION_FAILED',
            message: `HTTP ${response.status}: ${response.statusText}`,
          },
        }
      }
    }
    catch (error) {
      return {
        status: 'error',
        message: 'Network error or service unavailable',
        lastTested: new Date(),
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown network error',
        },
      }
    }
  }

  /**
   * Test OpenWeather API key by making a simple API call
   */
  private async testOpenWeatherConnection(apiKey: string): Promise<ConnectionStatus> {
    try {
      // Test with a simple weather request for London
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=London&appid=${apiKey}&units=metric`)

      if (response.ok) {
        const data = await response.json()
        return {
          status: 'connected',
          message: `Connected successfully. Retrieved weather data for ${data.name}.`,
          lastTested: new Date(),
          metadata: {
            planType: 'Free/Paid', // OpenWeather doesn't provide plan info in weather endpoint
          },
        }
      }
      else if (response.status === 401) {
        return {
          status: 'error',
          message: 'Invalid API key',
          lastTested: new Date(),
          error: {
            code: 'INVALID_API_KEY',
            message: 'The provided API key is invalid',
          },
        }
      }
      else if (response.status === 429) {
        const data = await response.json().catch(() => ({}))
        return {
          status: 'error',
          message: 'Rate limit exceeded',
          lastTested: new Date(),
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: data.message || 'API rate limit exceeded. Please upgrade your plan or wait.',
          },
        }
      }
      else {
        const data = await response.json().catch(() => ({}))
        return {
          status: 'error',
          message: `API connection failed with status ${response.status}`,
          lastTested: new Date(),
          error: {
            code: 'CONNECTION_FAILED',
            message: data.message || `HTTP ${response.status}: ${response.statusText}`,
          },
        }
      }
    }
    catch (error) {
      return {
        status: 'error',
        message: 'Network error or service unavailable',
        lastTested: new Date(),
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown network error',
        },
      }
    }
  }

  /**
   * Validate API key format and test connection
   */
  async validateAPIKey(service: APIService, key: string): Promise<ValidationResult> {
    // First validate format
    const formatValidation = validateAPIKeyFormat(service, key)

    if (!formatValidation.isValid) {
      return {
        isValid: false,
        errors: formatValidation.errors,
        warnings: [],
        suggestions: [
          `Please check the ${service === 'gemini' ? 'Gemini' : 'OpenWeather'} API key format`,
          `Visit the API documentation for the correct format`,
        ],
      }
    }

    // Test connection
    let connectionTest: ConnectionStatus
    try {
      if (service === 'gemini') {
        connectionTest = await this.testGeminiConnection(key)
      }
      else if (service === 'openweather') {
        connectionTest = await this.testOpenWeatherConnection(key)
      }
      else {
        throw new Error(`Unsupported service: ${service}`)
      }
    }
    catch (error) {
      connectionTest = {
        status: 'error',
        message: 'Failed to test API connection',
        lastTested: new Date(),
        error: {
          code: 'TEST_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error during connection test',
        },
      }
    }

    const isValid = connectionTest.status === 'connected'
    const warnings: string[] = []
    const suggestions: string[] = []

    // Add warnings and suggestions based on connection test results
    if (connectionTest.status === 'error') {
      if (connectionTest.error?.code === 'RATE_LIMIT_EXCEEDED') {
        warnings.push('Rate limit exceeded - the API key works but you may need to upgrade your plan')
        suggestions.push('Consider upgrading to a higher tier plan for more API calls')
      }
      else if (connectionTest.error?.code === 'INSUFFICIENT_PERMISSIONS') {
        suggestions.push('Ensure your API key has the required permissions enabled')
      }
      else if (connectionTest.error?.code === 'NETWORK_ERROR') {
        warnings.push('Network connectivity issues detected')
        suggestions.push('Check your internet connection and try again')
      }
    }

    return {
      isValid,
      errors: isValid ? [] : [connectionTest.message],
      warnings,
      suggestions,
      connectionTest,
    }
  }

  /**
   * Test connection for an existing API key
   */
  async testConnection(service: APIService, key: string): Promise<ConnectionStatus> {
    try {
      if (service === 'gemini') {
        return await this.testGeminiConnection(key)
      }
      else if (service === 'openweather') {
        return await this.testOpenWeatherConnection(key)
      }
      else {
        return {
          status: 'error',
          message: `Unsupported service: ${service}`,
          lastTested: new Date(),
          error: {
            code: 'UNSUPPORTED_SERVICE',
            message: `Service ${service} is not supported`,
          },
        }
      }
    }
    catch (error) {
      return {
        status: 'error',
        message: 'Failed to test connection',
        lastTested: new Date(),
        error: {
          code: 'TEST_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      }
    }
  }
}

export const apiValidationService = new APIValidationService()
