import { z } from 'zod'

// Gemini API key format: AIza followed by 35 characters (letters, numbers, underscore, hyphen)
export const GeminiKeySchema = z.string()
  .min(39, 'Gemini API key must be at least 39 characters')
  .max(39, 'Gemini API key must be exactly 39 characters')
  .regex(/^AIza[\w-]{35}$/, 'Invalid Gemini API key format. Should start with "AIza" followed by 35 alphanumeric characters, underscores, or hyphens')

// OpenWeather API key format: 32 character hexadecimal string
export const OpenWeatherKeySchema = z.string()
  .min(32, 'OpenWeather API key must be 32 characters')
  .max(32, 'OpenWeather API key must be exactly 32 characters')
  .regex(/^[a-f0-9]{32}$/, 'Invalid OpenWeather API key format. Should be 32 lowercase hexadecimal characters')

// Input schemas for tRPC procedures
export const SaveAPIKeyInput = z.object({
  service: z.enum(['gemini', 'openweather']),
  key: z.string().min(1, 'API key cannot be empty'),
})

export const RemoveAPIKeyInput = z.object({
  service: z.enum(['gemini', 'openweather']),
})

export const TestConnectionInput = z.object({
  service: z.enum(['gemini', 'openweather']),
})

// Validation functions
export function validateAPIKeyFormat(service: 'gemini' | 'openweather', key: string): { isValid: boolean, errors: string[] } {
  try {
    if (service === 'gemini') {
      GeminiKeySchema.parse(key)
    }
    else if (service === 'openweather') {
      OpenWeatherKeySchema.parse(key)
    }
    return { isValid: true, errors: [] }
  }
  catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.issues.map((err: z.ZodIssue) => err.message),
      }
    }
    return {
      isValid: false,
      errors: ['Invalid API key format'],
    }
  }
}

// Helper function to mask API keys for display
export function maskAPIKey(key: string, service: 'gemini' | 'openweather'): string {
  if (!key)
    return ''

  if (service === 'gemini') {
    // Show first 4 characters (AIza) and last 3 characters
    if (key.length >= 7) {
      return `${key.slice(0, 4)}${'*'.repeat(key.length - 7)}${key.slice(-3)}`
    }
  }
  else if (service === 'openweather') {
    // Show first 4 and last 4 characters
    if (key.length >= 8) {
      return `${key.slice(0, 4)}${'*'.repeat(key.length - 8)}${key.slice(-4)}`
    }
  }

  // Fallback for short keys
  return '*'.repeat(key.length)
}

// Helper function to get service display name
export function getServiceDisplayName(service: 'gemini' | 'openweather'): string {
  switch (service) {
    case 'gemini':
      return 'Gemini AI'
    case 'openweather':
      return 'OpenWeather'
    default:
      return service
  }
}

// Helper function to get API key registration URLs
export function getAPIKeyRegistrationURL(service: 'gemini' | 'openweather'): string {
  switch (service) {
    case 'gemini':
      return 'https://aistudio.google.com/app/apikey'
    case 'openweather':
      return 'https://openweathermap.org/api'
    default:
      return '#'
  }
}
