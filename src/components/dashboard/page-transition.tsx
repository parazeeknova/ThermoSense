'use client'

import type { ReactNode } from 'react'
import React, { useEffect, useState } from 'react'

interface PageTransitionProps {
  children: ReactNode
  pageKey: string
  className?: string
}

export function PageTransition({ children, pageKey, className = '' }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentKey, setCurrentKey] = useState(pageKey)

  useEffect(() => {
    const handlePageChange = () => {
      if (pageKey !== currentKey) {
        // Page is changing, start exit animation
        setIsVisible(false)

        const timeout = setTimeout(() => {
          setCurrentKey(pageKey)
          setIsVisible(true)
        }, 150)

        return () => clearTimeout(timeout)
      }
      else {
        // Page is the same, ensure it's visible
        setIsVisible(true)
      }
    }

    return handlePageChange()
  }, [pageKey, currentKey])

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        isVisible
          ? 'opacity-100 transform translate-x-0'
          : 'opacity-0 transform translate-x-4'
      } ${className}`}
    >
      {currentKey === pageKey && children}
    </div>
  )
}

interface StaggeredGridProps {
  children: ReactNode[]
  className?: string
  staggerDelay?: number
  [key: string]: unknown
}

export function StaggeredGrid({
  children,
  className = '',
  staggerDelay = 50,
  ...props
}: StaggeredGridProps) {
  const [visibleItems, setVisibleItems] = useState<boolean[]>([])

  useEffect(() => {
    // Reset visibility
    setVisibleItems(Array.from({ length: children.length }, () => false))

    // Stagger the appearance of items
    const timeouts: NodeJS.Timeout[] = []
    children.forEach((_, index) => {
      const timeout = setTimeout(() => {
        setVisibleItems((prev) => {
          const newArray = [...prev]
          newArray[index] = true
          return newArray
        })
      }, index * staggerDelay)
      timeouts.push(timeout)
    })

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [children, staggerDelay])

  return (
    <div className={className} {...props}>
      {children.map((child, index) => (
        <div
          key={index}
          className={`transition-all duration-500 ease-out ${
            visibleItems[index]
              ? 'opacity-100 transform translate-y-0 scale-100'
              : 'opacity-0 transform translate-y-4 scale-95'
          }`}
          style={{
            transitionDelay: `${index * staggerDelay}ms`,
          }} // Cleanup function to clear all timeouts
        >
          {child}
        </div>
      ))}
    </div>
  )
}
