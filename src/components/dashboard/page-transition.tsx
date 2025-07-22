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
    if (pageKey !== currentKey) {
      // Page is changing, start exit animation
      setIsVisible(false)

      const timeout = setTimeout(() => {
        setCurrentKey(pageKey)
        setIsVisible(true)
      }, 150) // Half of the transition duration

      return () => clearTimeout(timeout)
    }
    else {
      // Page is the same, ensure it's visible
      setIsVisible(true)
    }
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
  [key: string]: any // Allow additional props like data attributes
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
    // @ts-expect-error: TODO
    setVisibleItems(Array.from({ length: children.length }).fill(false))

    // Stagger the appearance of items
    children.forEach((_, index) => {
      setTimeout(() => {
        setVisibleItems((prev) => {
          const newArray = [...prev]
          newArray[index] = true
          return newArray
        })
      }, index * staggerDelay)
    })
  }, [children.length, staggerDelay])

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
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}
