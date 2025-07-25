/* eslint-disable node/prefer-global/process */
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    // Add server-only environment variables here
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    GEMINI_API_KEY: z
      .string()
      .min(1, 'Gemini API key is required for AI features')
      .describe('Gemini API key for AI models (server-side only)'),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_OPENWEATHER_API_KEY: z
      .string()
      .min(1, 'OpenWeatherMap API key is required')
      .optional()
      .describe('OpenWeatherMap API key for weather data'),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_OPENWEATHER_API_KEY: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  /**
   * Run `build` or `dev` with SKIP_ENV_VALIDATION to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
})

// Validate Gemini API key availability
if (!process.env.GEMINI_API_KEY && process.env.NODE_ENV === 'production') {
  console.error('Missing GEMINI_API_KEY environment variable in production')
}
