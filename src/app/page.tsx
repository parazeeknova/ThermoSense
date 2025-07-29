'use client'

import Dashboard from '@/components/dashboard/dashboard'
import { trpc } from '@/lib/trpc'

function Home() {
  return <Dashboard />
}

const HomeWithTRPC = trpc.withTRPC(Home)

export default HomeWithTRPC
