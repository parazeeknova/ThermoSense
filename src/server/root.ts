import { aiRouter } from './routers/ai'
import { apiKeysRouter } from './routers/api-keys'
import { deviceRouter } from './routers/device'
import { systemRouter } from './routers/system'
import { weatherRouter } from './routers/weather'
import { router } from './trpc'

export const appRouter = router({
  device: deviceRouter,
  weather: weatherRouter,
  system: systemRouter,
  ai: aiRouter,
  apiKeys: apiKeysRouter,
})

export type AppRouter = typeof appRouter
