import { aiRouter } from './routers/ai'
import { deviceRouter } from './routers/device'
import { systemRouter } from './routers/system'
import { weatherRouter } from './routers/weather'
import { router } from './trpc'

export const appRouter = router({
  device: deviceRouter,
  weather: weatherRouter,
  system: systemRouter,
  ai: aiRouter,
})

export type AppRouter = typeof appRouter
