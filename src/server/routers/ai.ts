import { z } from 'zod'
import { geminiService } from '@/lib/gemini-service'
import { publicProcedure, router } from '../trpc'

const AIContextInput = z.object({
  deviceTemp: z.number(),
  batteryLevel: z.number(),
  weatherTemp: z.number(),
  cpuUsage: z.number(),
  screenBrightness: z.number().optional(),
  activeApps: z.number().optional(), // Number of active apps
})

export const aiRouter = router({
  generatePredictiveAnalytics: publicProcedure
    .input(AIContextInput)
    .mutation(async ({ input }) => {
      try {
        const predictiveData = await geminiService.generatePredictiveAnalytics(input)
        return { predictiveData }
      }
      catch (error) {
        console.error('Error generating predictive analytics:', error)
        throw new Error(
          error instanceof Error
            ? error.message
            : 'Failed to generate predictive analytics',
        )
      }
    }),

  generateRecommendations: publicProcedure
    .input(AIContextInput)
    .mutation(async ({ input }) => {
      try {
        const recommendations = await geminiService.generateRecommendations(input)
        return { recommendations }
      }
      catch (error) {
        console.error('Error generating recommendations:', error)
        throw new Error(
          error instanceof Error
            ? error.message
            : 'Failed to generate recommendations',
        )
      }
    }),
})
