'use client'

import type { DraggableCardProps } from '@/types/dashboard'
import { GripVertical, Maximize2, Minimize2, RotateCcw, Settings } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'

interface EnhancedDraggableCardProps extends DraggableCardProps {
  isSelected?: boolean
  isResizable?: boolean
  onResize?: (id: string, newSize: { width: number, height: number }) => void
  onSelect?: (id: string, isMultiSelect: boolean) => void
  onContextMenu?: (id: string, position: { x: number, y: number }) => void
  disabled?: boolean
  cardTitle?: string
  cardDescription?: string
  showCardInfo?: boolean
}

export function DraggableCard({
  id,
  children,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragging,
  dragOverTarget,
  isSelected = false,
  isResizable = false,
  onResize,
  onSelect,
  onContextMenu,
  disabled = false,
  cardTitle,
  cardDescription,
  showCardInfo = false,
}: EnhancedDraggableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [touchStartPos, setTouchStartPos] = useState<{ x: number, y: number } | null>(null)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)

  const isDropTarget = dragOverTarget === id && !isDragging
  const isActive = isDragging || isSelected || isHovered

  const handleDragStart = useCallback((e: React.DragEvent) => {
    if (disabled) {
      e.preventDefault()
      return
    }

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      e.dataTransfer.setDragImage(cardRef.current, rect.width / 2, rect.height / 2)
    }

    onDragStart(id)
  }, [disabled, onDragStart, id])

  const handleDragEnd = useCallback(() => {
    onDragEnd()
  }, [onDragEnd])

  const handleSelect = useCallback((e: React.MouseEvent) => {
    if (disabled)
      return
    const isMultiSelect = e.ctrlKey || e.metaKey
    onSelect?.(id, isMultiSelect)
  }, [disabled, onSelect, id])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    if (disabled)
      return
    onContextMenu?.(id, { x: e.clientX, y: e.clientY })
  }, [disabled, onContextMenu, id])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled)
      return
    const touch = e.touches[0]
    setTouchStartPos({ x: touch.clientX, y: touch.clientY })

    const timer = setTimeout(() => {
      onContextMenu?.(id, { x: touch.clientX, y: touch.clientY })
    }, 500)
    setLongPressTimer(timer)
  }, [disabled, onContextMenu, id])

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
    setTouchStartPos(null)
  }, [longPressTimer])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartPos)
      return

    const touch = e.touches[0]
    const deltaX = Math.abs(touch.clientX - touchStartPos.x)
    const deltaY = Math.abs(touch.clientY - touchStartPos.y)

    // Cancel long press if moved too much
    if (deltaX > 10 || deltaY > 10) {
      if (longPressTimer) {
        clearTimeout(longPressTimer)
        setLongPressTimer(null)
      }
    }
  }, [touchStartPos, longPressTimer])

  const handleResizeStart = useCallback((handle: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeHandle(handle)
  }, [])

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeHandle || !cardRef.current)
      return

    const rect = cardRef.current.getBoundingClientRect()
    const newSize = { width: rect.width, height: rect.height }

    switch (resizeHandle) {
      case 'se':
        newSize.width = e.clientX - rect.left
        newSize.height = e.clientY - rect.top
        break
      case 'sw':
        newSize.width = rect.right - e.clientX
        newSize.height = e.clientY - rect.top
        break
      case 'ne':
        newSize.width = e.clientX - rect.left
        newSize.height = rect.bottom - e.clientY
        break
      case 'nw':
        newSize.width = rect.right - e.clientX
        newSize.height = rect.bottom - e.clientY
        break
    }

    onResize?.(id, newSize)
  }, [isResizing, resizeHandle, onResize, id])

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false)
    setResizeHandle(null)
  }, [])

  // Mouse event listeners for resize
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleResizeEnd)
      return () => {
        document.removeEventListener('mousemove', handleResizeMove)
        document.removeEventListener('mouseup', handleResizeEnd)
      }
    }
  }, [isResizing, handleResizeMove, handleResizeEnd])

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSelected)
        return

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          e.preventDefault()
          // Handle delete if needed
          break
        case 'Escape':
          onSelect?.(id, false)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSelected, onSelect, id])

  return (
    <div
      ref={cardRef}
      draggable={!disabled && !isResizing}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={onDragOver}
      onDrop={e => onDrop(e, id)}
      onClick={handleSelect}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative transition-all duration-300 h-full ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-move hover:cursor-grab active:cursor-grabbing'
      } ${isDragging ? 'opacity-60 scale-95 rotate-2' : ''} ${
        isSelected ? 'ring-2 ring-blue-500 ring-opacity-75' : ''
      } ${isActive ? 'shadow-xl transform-gpu' : 'shadow-lg'}`}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={`Draggable card: ${cardTitle || id}`}
      aria-selected={isSelected}
      aria-disabled={disabled}
    >
      {/* Drop target indicator */}
      {isDropTarget && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-emerald-400 border-dashed rounded-xl z-20 animate-pulse">
          <div className="absolute inset-2 bg-emerald-500/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <div className="text-emerald-600 text-sm font-medium flex items-center space-x-2">
              <Minimize2 className="w-4 h-4" />
              <span>Drop here</span>
            </div>
          </div>
        </div>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-75 blur-sm animate-pulse" />
      )}

      {/* Main content */}
      <div className={`relative h-full bg-white rounded-lg overflow-hidden ${
        isActive ? 'transform-gpu scale-[1.02]' : ''
      }`}
      >
        {/* Card header with controls */}
        <div className={`absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 ${
          isActive ? 'opacity-100' : ''
        }`}
        >
          {/* Card info toggle */}
          {(cardTitle || cardDescription) && (
            <button
              type="button"
              className="p-1 bg-gray-800/80 rounded border border-gray-700/50 backdrop-blur-sm hover:bg-gray-700/80 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                // Toggle info display
              }}
              title="Card info"
            >
              <Settings className="w-3 h-3 text-gray-300" />
            </button>
          )}

          {/* Reset position */}
          <button
            type="button"
            className="p-1 bg-gray-800/80 rounded border border-gray-700/50 backdrop-blur-sm hover:bg-gray-700/80 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
            }}
            title="Reset position"
          >
            <RotateCcw className="w-3 h-3 text-gray-300" />
          </button>

          {/* Drag handle */}
          <div className="p-1 bg-gray-800/80 rounded border border-gray-700/50 backdrop-blur-sm">
            <GripVertical className="w-3 h-3 text-gray-300" />
          </div>
        </div>

        {/* Card info overlay */}
        {showCardInfo && (cardTitle || cardDescription) && (
          <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm text-white p-2 rounded-lg border border-gray-600/30 max-w-xs z-10">
            {cardTitle && <div className="text-sm font-semibold mb-1">{cardTitle}</div>}
            {cardDescription && <div className="text-xs opacity-80">{cardDescription}</div>}
          </div>
        )}

        {/* Resize handles */}
        {isResizable && !disabled && (
          <>
            {['nw', 'ne', 'sw', 'se'].map(handle => (
              <div
                key={handle}
                className={`absolute w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                  handle === 'nw'
                    ? 'top-0 left-0 cursor-nw-resize'
                    : handle === 'ne'
                      ? 'top-0 right-0 cursor-ne-resize'
                      : handle === 'sw'
                        ? 'bottom-0 left-0 cursor-sw-resize'
                        : 'bottom-0 right-0 cursor-se-resize'
                } ${isActive ? 'opacity-100' : ''}`}
                onMouseDown={e => handleResizeStart(handle, e)}
              >
                <div className="w-full h-full bg-blue-500 rounded-full border-2 border-white shadow-lg">
                  <Maximize2 className="w-2 h-2 text-white" />
                </div>
              </div>
            ))}
          </>
        )}

        {/* Content */}
        <div className="h-full">
          {children}
        </div>
      </div>
    </div>
  )
}
