'use client'

import React, { useEffect, useState } from 'react'

interface BlueprintGridProps {
  isDragging: boolean
  dragPosition?: { x: number, y: number }
  snapToGrid?: boolean
  gridSize?: number
  showMeasurements?: boolean
}

interface SnapZone {
  id: string
  x: number
  y: number
  width: number
  height: number
  label: string
}

export function BlueprintGrid({
  isDragging,
  dragPosition,
  snapToGrid = true,
  gridSize = 40,
  showMeasurements = true,
}: BlueprintGridProps) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [snapZones] = useState<SnapZone[]>([
    { id: 'top-left', x: 50, y: 50, width: 300, height: 200, label: 'Primary' },
    { id: 'top-right', x: 500, y: 50, width: 300, height: 200, label: 'Secondary' },
    { id: 'center', x: 200, y: 300, width: 400, height: 250, label: 'Main Dashboard' },
    { id: 'bottom', x: 100, y: 600, width: 600, height: 150, label: 'Analytics' },
  ])

  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }

    updateWindowSize()
    window.addEventListener('resize', updateWindowSize)
    return () => window.removeEventListener('resize', updateWindowSize)
  }, [])

  if (!isDragging)
    return null

  const getSnapPosition = (x: number, y: number) => {
    if (!snapToGrid)
      return { x, y }
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize,
    }
  }

  const getCurrentSnapZone = () => {
    if (!dragPosition)
      return null
    return snapZones.find(zone =>
      dragPosition.x >= zone.x
      && dragPosition.x <= zone.x + zone.width
      && dragPosition.y >= zone.y
      && dragPosition.y <= zone.y + zone.height,
    )
  }

  const currentSnapZone = getCurrentSnapZone()
  const snappedPosition = dragPosition ? getSnapPosition(dragPosition.x, dragPosition.y) : null

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <svg className="w-full h-full" style={{ background: 'transparent' }}>
        <defs>
          {/* Grid patterns */}
          <pattern id="blueprint-grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke="#10B981"
              strokeWidth="0.5"
              opacity="0.3"
            />
            <circle cx={gridSize / 2} cy={gridSize / 2} r="1" fill="#10B981" opacity="0.2" />
          </pattern>

          <pattern id="blueprint-major-grid" width={gridSize * 5} height={gridSize * 5} patternUnits="userSpaceOnUse">
            <path
              d={`M ${gridSize * 5} 0 L 0 0 0 ${gridSize * 5}`}
              fill="none"
              stroke="#10B981"
              strokeWidth="1"
              opacity="0.5"
            />
          </pattern>

          {/* Gradient for snap zones */}
          <radialGradient id="snapZoneGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
          </radialGradient>

          {/* Drop shadow filter */}
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Base grid */}
        <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
        <rect width="100%" height="100%" fill="url(#blueprint-major-grid)" />

        {/* Snap zones */}
        {snapZones.map(zone => (
          <g key={zone.id}>
            <rect
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              fill="url(#snapZoneGradient)"
              stroke="#10B981"
              strokeWidth={currentSnapZone?.id === zone.id ? '2' : '1'}
              strokeDasharray={currentSnapZone?.id === zone.id ? 'none' : '5,5'}
              rx="8"
              ry="8"
              className={currentSnapZone?.id === zone.id ? 'animate-pulse' : ''}
              opacity={currentSnapZone?.id === zone.id ? '0.8' : '0.4'}
            />

            {/* Zone label */}
            <text
              x={zone.x + zone.width / 2}
              y={zone.y + 20}
              textAnchor="middle"
              fill="#10B981"
              fontSize="12"
              fontWeight="600"
              opacity={currentSnapZone?.id === zone.id ? '1' : '0.6'}
              filter="url(#dropShadow)"
            >
              {zone.label}
            </text>

            {/* Zone dimensions */}
            {showMeasurements && (
              <>
                <text
                  x={zone.x + zone.width + 10}
                  y={zone.y + zone.height / 2}
                  fill="#10B981"
                  fontSize="10"
                  opacity="0.7"
                >
                  {zone.width}
                  ×
                  {zone.height}
                </text>
              </>
            )}
          </g>
        ))}

        {/* Corner markers with enhanced design */}
        <g stroke="#10B981" strokeWidth="2" fill="none" opacity="0.6">
          <path d="M 20 20 L 20 60 M 20 20 L 60 20" strokeLinecap="round" />
          <path d="M calc(100% - 20px) 20 L calc(100% - 60px) 20 M calc(100% - 20px) 20 L calc(100% - 20px) 60" strokeLinecap="round" />
          <path d="M 20 calc(100% - 20px) L 60 calc(100% - 20px) M 20 calc(100% - 20px) L 20 calc(100% - 60px)" strokeLinecap="round" />
          <path d="M calc(100% - 20px) calc(100% - 20px) L calc(100% - 20px) calc(100% - 60px) M calc(100% - 20px) calc(100% - 20px) L calc(100% - 60px) calc(100% - 20px)" strokeLinecap="round" />
        </g>

        {/* Center crosshairs with animation */}
        <g stroke="#10B981" strokeWidth="1" fill="none" opacity="0.4">
          <line x1="50%" y1="0" x2="50%" y2="100%" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite" />
          </line>
          <line x1="0" y1="50%" x2="100%" y2="50%" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite" />
          </line>
        </g>

        {/* Drag position indicator */}
        {snappedPosition && (
          <g>
            <circle
              cx={snappedPosition.x}
              cy={snappedPosition.y}
              r="8"
              fill="#10B981"
              opacity="0.6"
              stroke="#ffffff"
              strokeWidth="2"
            >
              <animate attributeName="r" values="8;12;8" dur="1s" repeatCount="indefinite" />
            </circle>

            {/* Coordinates display */}
            <rect
              x={snappedPosition.x + 15}
              y={snappedPosition.y - 25}
              width="60"
              height="20"
              fill="#000000"
              opacity="0.8"
              rx="4"
            />
            <text
              x={snappedPosition.x + 45}
              y={snappedPosition.y - 10}
              textAnchor="middle"
              fill="#10B981"
              fontSize="10"
              fontWeight="500"
            >
              {snappedPosition.x}
              ,
              {snappedPosition.y}
            </text>
          </g>
        )}

        {/* Active zone highlight */}
        {currentSnapZone && (
          <rect
            x={currentSnapZone.x - 5}
            y={currentSnapZone.y - 5}
            width={currentSnapZone.width + 10}
            height={currentSnapZone.height + 10}
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            strokeDasharray="10,5"
            rx="12"
            ry="12"
            opacity="0.8"
          >
            <animate attributeName="stroke-dashoffset" values="0;15" dur="1s" repeatCount="indefinite" />
          </rect>
        )}

        {/* Measurement rulers */}
        {showMeasurements && windowSize.width > 0 && (
          <g>
            {/* Top ruler */}
            <line x1="0" y1="10" x2="100%" y2="10" stroke="#10B981" strokeWidth="1" opacity="0.3" />
            {Array.from({ length: Math.floor(windowSize.width / 100) }, (_, i) => (
              <g key={`ruler-top-${i}`}>
                <line x1={i * 100} y1="5" x2={i * 100} y2="15" stroke="#10B981" strokeWidth="1" opacity="0.4" />
                <text x={i * 100 + 5} y="25" fill="#10B981" fontSize="8" opacity="0.6">
                  {i * 100}
                  px
                </text>
              </g>
            ))}

            {/* Left ruler */}
            <line x1="10" y1="0" x2="10" y2="100%" stroke="#10B981" strokeWidth="1" opacity="0.3" />
            {Array.from({ length: Math.floor(windowSize.height / 100) }, (_, i) => (
              <g key={`ruler-left-${i}`}>
                <line x1="5" y1={i * 100} x2="15" y2={i * 100} stroke="#10B981" strokeWidth="1" opacity="0.4" />
                <text x="20" y={i * 100 + 15} fill="#10B981" fontSize="8" opacity="0.6">
                  {i * 100}
                  px
                </text>
              </g>
            ))}
          </g>
        )}
      </svg>

      {/* Floating info panel */}
      {currentSnapZone && (
        <div className="fixed top-4 right-4 bg-black/80 backdrop-blur-sm text-green-400 p-4 rounded-lg border border-green-500/30 shadow-lg">
          <div className="text-sm font-semibold mb-2">
            Active Zone:
            {currentSnapZone.label}
          </div>
          <div className="text-xs space-y-1 opacity-80">
            <div>
              Position:
              {currentSnapZone.x}
              ,
              {currentSnapZone.y}
            </div>
            <div>
              Size:
              {currentSnapZone.width}
              {' '}
              ×
              {currentSnapZone.height}
            </div>
            {snappedPosition && (
              <div>
                Snap:
                {snappedPosition.x}
                ,
                {snappedPosition.y}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
