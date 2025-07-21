'use client'

import React from 'react'

interface BlueprintGridProps {
  isDragging: boolean
}

export function BlueprintGrid({ isDragging }: BlueprintGridProps) {
  if (!isDragging)
    return null

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <svg className="w-full h-full" style={{ background: 'transparent' }}>
        <defs>
          <pattern id="blueprint-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#10B981" strokeWidth="0.5" opacity="0.3" />
          </pattern>
          <pattern id="blueprint-major-grid" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#10B981" strokeWidth="1" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
        <rect width="100%" height="100%" fill="url(#blueprint-major-grid)" />

        <g stroke="#10B981" strokeWidth="2" fill="none" opacity="0.5">
          <path d="M 20 20 L 20 60 M 20 20 L 60 20" />
          <path d="M calc(100% - 20px) 20 L calc(100% - 60px) 20 M calc(100% - 20px) 20 L calc(100% - 20px) 60" />
          <path d="M 20 calc(100% - 20px) L 60 calc(100% - 20px) M 20 calc(100% - 20px) L 20 calc(100% - 60px)" />
          <path d="M calc(100% - 20px) calc(100% - 20px) L calc(100% - 20px) calc(100% - 60px) M calc(100% - 20px) calc(100% - 20px) L calc(100% - 60px) calc(100% - 20px)" />
        </g>

        <g stroke="#10B981" strokeWidth="1" fill="none" opacity="0.3">
          <line x1="50%" y1="0" x2="50%" y2="100%" strokeDasharray="5,5" />
          <line x1="0" y1="50%" x2="100%" y2="50%" strokeDasharray="5,5" />
        </g>
      </svg>
    </div>
  )
}
