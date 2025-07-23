import type { AIRecommendation, PredictiveData } from '@/types/dashboard'
import { env } from '@/env'

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string
      }[]
    }
  }[]
}

interface DeviceContext {
  deviceTemp?: number
  batteryLevel?: number
  weatherTemp?: number
  cpuUsage?: number
  screenBrightness?: number
  activeApps?: number
}

class GeminiService {
  private readonly apiKey: string
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models'

  constructor() {
    this.apiKey = env.GEMINI_API_KEY || ''
    if (!this.apiKey) {
      console.warn('Gemini API key not found. Please set GEMINI_API_KEY environment variable.')
    }
  }

  private async callGemini(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured')
    }

    const response = await fetch(`${this.baseUrl}/gemini-2.0-flash:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': this.apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
    }

    const data: GeminiResponse = await response.json()

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API')
    }

    return data.candidates[0].content.parts[0].text
  }

  async generateRecommendations(context: DeviceContext): Promise<AIRecommendation[]> {
    const prompt = `
You are a thermal management AI advisor for electronic devices. Based on the following device and environmental data, generate 2-4 actionable recommendations to optimize device temperature and battery health.

Device Data:
- Device Temperature: ${context.deviceTemp || 'unknown'}°C
- Battery Level: ${context.batteryLevel || 'unknown'}%
- Ambient Temperature: ${context.weatherTemp || 'unknown'}°C
- CPU Usage: ${context.cpuUsage || 'unknown'}%
- Screen Brightness: ${context.screenBrightness || 'unknown'}%
- Active Applications: ${context.activeApps || 'unknown'}

Please respond in the following JSON format:
{
  "recommendations": [
    {
      "alertLevel": "high|medium|low|critical",
      "naturalLanguageTip": "Natural language explanation of the issue and recommendation",
      "actions": ["action1", "action2", "action3"]
    }
  ]
}

Focus on:
1. Immediate thermal risks and solutions
2. Battery health optimization
3. Performance vs. temperature trade-offs
4. Environmental adaptation suggestions

Keep recommendations practical and specific to the current conditions.
`

    try {
      const response = await this.callGemini(prompt)
      const parsed = JSON.parse(response.replace(/```json\n?|\n?```/g, ''))

      return parsed.recommendations.map((rec: any, index: number) => ({
        id: `ai-${Date.now()}-${index}`,
        alertLevel: rec.alertLevel as 'high' | 'medium' | 'low' | 'critical',
        naturalLanguageTip: rec.naturalLanguageTip,
        actions: rec.actions,
        timestamp: new Date().toISOString(),
        isRead: false,
      }))
    }
    catch (error) {
      console.error('Error generating recommendations:', error)
      throw new Error('Failed to generate AI recommendations')
    }
  }

  async generatePredictiveAnalytics(context: DeviceContext): Promise<PredictiveData> {
    const prompt = `
You are a predictive analytics AI for thermal management. Based on the current device and environmental conditions, predict future temperature trends and provide optimization recommendations.

Current Conditions:
- Device Temperature: ${context.deviceTemp || 'unknown'}°C
- Battery Level: ${context.batteryLevel || 'unknown'}%
- Ambient Temperature: ${context.weatherTemp || 'unknown'}°C
- CPU Usage: ${context.cpuUsage || 'unknown'}%
- Screen Brightness: ${context.screenBrightness || 'unknown'}%
- Active Applications: ${context.activeApps || 'unknown'}

Please respond in the following JSON format:
{
  "nextHourTemp": 45.2,
  "riskTrend": "increasing|decreasing|stable",
  "recommendedActions": ["action1", "action2", "action3"],
  "confidence": 85
}

Consider:
1. Current thermal load and trends
2. Environmental factors
3. Typical usage patterns
4. Battery thermal characteristics
5. Seasonal and time-of-day factors

Provide realistic temperature predictions and confidence levels based on the data.
`

    try {
      const response = await this.callGemini(prompt)
      const parsed = JSON.parse(response.replace(/```json\n?|\n?```/g, ''))

      return {
        nextHourTemp: parsed.nextHourTemp,
        riskTrend: parsed.riskTrend as 'increasing' | 'decreasing' | 'stable',
        recommendedActions: parsed.recommendedActions,
        confidence: Math.min(Math.max(parsed.confidence, 0), 100), // Ensure 0-100 range
      }
    }
    catch (error) {
      console.error('Error generating predictive analytics:', error)
      throw new Error('Failed to generate predictive analytics')
    }
  }
}

export const geminiService = new GeminiService()
