'use client'

import { TreePine } from 'lucide-react'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface GuidanceCardProps {
  message: string
}

export function GuidanceCard({ message }: GuidanceCardProps) {
  return (
    <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl col-span-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
          <div className="p-2 bg-emerald-100 rounded-lg mr-3">
            <TreePine className="w-6 h-6 text-emerald-600" />
          </div>
          Forest Guardian Guidance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-emerald-500">
          <p className="text-gray-700 leading-relaxed">
            {message}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
