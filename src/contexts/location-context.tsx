'use client'

import type { ReactNode } from 'react'
import { createContext, use, useCallback, useState } from 'react'

interface LocationContextType {
  currentLocation: string
  updateGlobalLocation: (location: string) => void
  coordinates?: { lat: number, lon: number }
  setCoordinates: (coords: { lat: number, lon: number }) => void
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

interface LocationProviderProps {
  children: ReactNode
  defaultLocation?: string
}

export function LocationProvider({
  children,
  defaultLocation = 'Bhopal',
}: LocationProviderProps) {
  // Initialize from localStorage or fallback to default
  const [currentLocation, setCurrentLocation] = useState<string>(() => {
    if (typeof window === 'undefined') {
      return defaultLocation
    }
    const stored = localStorage.getItem('thermosense-location')
    return stored || defaultLocation
  })

  const [coordinates, setCoordinates] = useState<{ lat: number, lon: number } | undefined>(() => {
    if (typeof window === 'undefined') {
      return undefined
    }
    const stored = localStorage.getItem('thermosense-coordinates')
    return stored ? JSON.parse(stored) : undefined
  })

  const updateGlobalLocation = useCallback((location: string) => {
    setCurrentLocation(location)
    localStorage.setItem('thermosense-location', location)
    // Clear coordinates when manually setting location
    setCoordinates(undefined)
    localStorage.removeItem('thermosense-coordinates')
  }, [])

  const setCoordinatesWithPersistence = useCallback((coords: { lat: number, lon: number }) => {
    setCoordinates(coords)
    localStorage.setItem('thermosense-coordinates', JSON.stringify(coords))
  }, [])

  // eslint-disable-next-line react/no-unstable-context-value
  const value: LocationContextType = {
    currentLocation,
    updateGlobalLocation,
    coordinates,
    setCoordinates: setCoordinatesWithPersistence,
  }

  return (
    <LocationContext value={value}>
      {children}
    </LocationContext>
  )
}

export function useLocationContext() {
  const context = use(LocationContext)
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider')
  }
  return context
}
