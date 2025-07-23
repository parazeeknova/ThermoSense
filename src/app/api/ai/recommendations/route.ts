import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { geminiService } from '@/lib/gemini-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      deviceTemp,
      batteryLevel,
      weatherTemp,
      cpuUsage,
      screenBrightness,
      activeApps,
    } = body

    const context = {
      deviceTemp,
      batteryLevel,
      weatherTemp,
      cpuUsage,
      screenBrightness,
      activeApps,
    }

    const recommendations = await geminiService.generateRecommendations(context)

    return NextResponse.json({ recommendations })
  }
  catch (error) {
    console.error('Error generating recommendations:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate recommendations',
        recommendations: [],
      },
      { status: 500 },
    )
  }
}
