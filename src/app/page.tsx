'use client'

import Dashboard from '@/components/dashboard/dashboard'
import { trpc } from '@/lib/trpc'

function Home() {
  return <Dashboard />
}

export default trpc.withTRPC(Home)
