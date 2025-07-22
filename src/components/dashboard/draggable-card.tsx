'use client'

import type { DraggableCardProps } from '@/types/dashboard'
import { GripVertical } from 'lucide-react'
import React from 'react'

export function DraggableCard({
  id,
  children,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragging,
  dragOverTarget,
}: DraggableCardProps) {
  const isDropTarget = dragOverTarget === id && !isDragging

  return (
    <div
      draggable
      onDragStart={() => onDragStart(id)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={e => onDrop(e, id)}
      className={`group cursor-move relative transition-all duration-200 h-full ${isDragging ? 'opacity-50 scale-95' : ''}`}
    >
      {isDropTarget && (
        <div className="absolute inset-0 bg-emerald-500/20 border-2 border-emerald-400 border-dashed rounded-xl z-20 animate-pulse">
          <div className="absolute inset-2 bg-emerald-500/10 rounded-lg flex items-center justify-center">
            <div className="text-emerald-600 text-sm font-medium">Drop here</div>
          </div>
        </div>
      )}

      <div className="relative h-full">
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <div className="p-1 bg-gray-800/80 rounded border border-gray-700/50 backdrop-blur-sm">
            <GripVertical className="w-4 h-4 text-gray-300" />
          </div>
        </div>
        <div className="h-full">
          {children}
        </div>
      </div>
    </div>
  )
}
