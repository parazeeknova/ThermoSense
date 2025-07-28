/* eslint-disable node/prefer-global/process */
import type { AppRouter } from '../server/root'
import { httpBatchLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'

function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // In the browser, use relative URL
    return ''
  }

  // When rendering on the server, use localhost
  if (process.env.VERCEL_URL) {
    // If deployed on Vercel
    return `https://${process.env.VERCEL_URL}`
  }

  // Assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    }
  },
  ssr: false,
})
