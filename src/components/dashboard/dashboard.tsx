'use client'

import type { DashboardPage } from './sidebar-navigation'
import React, { useEffect, useState } from 'react'
import { QueryProvider } from '@/providers/query-provider'
import { BlueprintGrid } from './blueprint-grid'
import { BatteryCard } from './cards/battery-card'
import { DeviceConfigPanel } from './cards/device-config-panel'
import { HeatRiskMeter } from './cards/heat-risk-meter'
import { HistoricalDataPanel } from './cards/historical-data-panel'
import { NotificationCenter } from './cards/notification-center'
import { PredictiveAnalyticsPanel } from './cards/predictive-analytics-panel'
import { DeviceTemperatureCard, OutdoorTemperatureCard } from './cards/temperature-cards'
import { WeatherLocationPanel } from './cards/weather-location-panel'
import { DraggableCard } from './draggable-card'
import { PageTransition } from './page-transition'
import { SidebarNavigation } from './sidebar-navigation'

// Bento box layout configuration with proper grid positioning
const bentoLayouts: Record<DashboardPage, Record<string, string>> = {
  monitoring: {
    'device-temp': 'col-span-1 row-span-1',
    'outdoor-temp': 'col-span-1 row-span-1',
    'battery-level': 'col-span-1 row-span-1',
    'heat-risk-meter': 'col-span-1 row-span-1',
    'weather-location': 'col-span-2 row-span-2',
    'notification-center': 'col-span-2 row-span-2',
  },
  analytics: {
    'historical-data': 'col-span-4 row-span-2',
    'predictive-analytics': 'col-span-2 row-span-2',
    'device-config': 'col-span-2 row-span-2',
  },
}

const pageCards = {
  monitoring: [
    { id: 'device-temp' },
    { id: 'outdoor-temp' },
    { id: 'battery-level' },
    { id: 'heat-risk-meter' },
    { id: 'weather-location' },
    { id: 'notification-center' },
  ],
  analytics: [
    { id: 'historical-data' },
    { id: 'predictive-analytics' },
    { id: 'device-config' },
  ],
}

function DashboardContent() {
  const [draggedCard, setDraggedCard] = useState<string | null>(null)
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<DashboardPage>('monitoring')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [monitoringCardOrder, setMonitoringCardOrder] = useState(pageCards.monitoring)
  const [analyticsCardOrder, setAnalyticsCardOrder] = useState(pageCards.analytics)

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setIsMobile(mobile)

      if (mobile) {
        // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
        setIsCollapsed(true)
        // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
        setSidebarVisible(false)
      }
      else {
        // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
        setSidebarVisible(true)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const handlePageChange = (page: DashboardPage) => {
    setCurrentPage(page)
  }

  const handleToggleCollapse = () => {
    if (isMobile) {
      setSidebarVisible(!sidebarVisible)
    }
    else {
      setIsCollapsed(!isCollapsed)
    }
  }

  const handleMobileOverlayClick = () => {
    if (isMobile) {
      setSidebarVisible(false)
    }
  }

  const handleDragStart = (id: string) => {
    setDraggedCard(id)
  }

  const handleDragEnd = () => {
    setDraggedCard(null)
    setDragOverTarget(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    const target = e.currentTarget as HTMLElement
    const cardId = target.closest('[data-card-id]')?.getAttribute('data-card-id')
    if (cardId && cardId !== draggedCard) {
      setDragOverTarget(cardId)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement
    if (!e.currentTarget.contains(relatedTarget)) {
      setDragOverTarget(null)
    }
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    setDragOverTarget(null)
    if (draggedCard && draggedCard !== targetId) {
      const currentCardOrder = currentPage === 'monitoring' ? monitoringCardOrder : analyticsCardOrder
      const setCardOrder = currentPage === 'monitoring' ? setMonitoringCardOrder : setAnalyticsCardOrder

      const newOrder = [...currentCardOrder]
      const draggedIndex = newOrder.findIndex(card => card.id === draggedCard)
      const targetIndex = newOrder.findIndex(card => card.id === targetId)

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [draggedItem] = newOrder.splice(draggedIndex, 1)
        newOrder.splice(targetIndex, 0, draggedItem)
        setCardOrder(newOrder)
      }
    }
  }

  const currentCardOrder = currentPage === 'monitoring' ? monitoringCardOrder : analyticsCardOrder

  const pageTitle = currentPage === 'monitoring'
    ? 'Real-time Device Monitoring Dashboard'
    : 'Analytics & Configuration Center'

  const pageDescription = currentPage === 'monitoring'
    ? 'Live device thermal monitoring with real-time insights and recommendations'
    : 'Historical analysis, predictions, and device configuration settings'

  const renderCard = (cardId: string) => {
    switch (cardId) {
      case 'device-temp':
        return <DeviceTemperatureCard />
      case 'outdoor-temp':
        return <OutdoorTemperatureCard />
      case 'battery-level':
        return <BatteryCard />
      case 'heat-risk-meter':
        return <HeatRiskMeter />
      case 'notification-center':
        return <NotificationCenter />
      case 'weather-location':
        return <WeatherLocationPanel />
      case 'predictive-analytics':
        return <PredictiveAnalyticsPanel />
      case 'historical-data':
        return <HistoricalDataPanel />
      case 'device-config':
        return <DeviceConfigPanel />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <BlueprintGrid isDragging={!!draggedCard} />

      {isMobile && sidebarVisible && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={handleMobileOverlayClick}
        />
      )}

      <SidebarNavigation
        currentPage={currentPage}
        onPageChange={handlePageChange}
        unreadNotifications={3}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobile={isMobile}
        sidebarVisible={sidebarVisible}
      />

      <div
        className={`flex flex-col overflow-hidden transition-all duration-300 ${
          isMobile
            ? 'ml-0'
            : isCollapsed
              ? 'ml-16'
              : 'ml-80'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm sticky top-0 z-20">
          <div className="max-w-none mx-auto px-3 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              {isMobile && (
                <button
                  type="button"
                  onClick={handleToggleCollapse}
                  className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 mr-3"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}

              <div className="flex-1">
                <PageTransition pageKey={currentPage}>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                    {pageTitle}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {pageDescription}
                  </p>
                </PageTransition>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-2 sm:p-3">
          <div className="max-w-none mx-auto h-full">
            <PageTransition pageKey={currentPage}>
              <div
                className="hidden lg:grid grid-cols-4 gap-3 w-full h-full"
                style={{
                  gridAutoRows: currentPage === 'analytics' ? 'minmax(120px, auto)' : 'minmax(140px, 1fr)',
                }}
              >
                {currentCardOrder.map(cardItem => (
                  <div
                    key={cardItem.id}
                    data-card-id={cardItem.id}
                    onDragLeave={handleDragLeave}
                    className={`${bentoLayouts[currentPage][cardItem.id] || 'col-span-1 row-span-1'} p-1`}
                  >
                    <div className="h-full">
                      <DraggableCard
                        id={cardItem.id}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        isDragging={draggedCard === cardItem.id}
                        dragOverTarget={dragOverTarget}
                      >
                        {renderCard(cardItem.id)}
                      </DraggableCard>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:grid lg:hidden grid-cols-2 gap-2 w-full h-full" style={{ gridAutoRows: 'minmax(140px, 1fr)' }}>
                {currentCardOrder.map(cardItem => (
                  <div
                    key={cardItem.id}
                    data-card-id={cardItem.id}
                    onDragLeave={handleDragLeave}
                    className="col-span-1 p-1"
                  >
                    <div className="h-full">
                      <DraggableCard
                        id={cardItem.id}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        isDragging={draggedCard === cardItem.id}
                        dragOverTarget={dragOverTarget}
                      >
                        {renderCard(cardItem.id)}
                      </DraggableCard>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid md:hidden grid-cols-1 gap-2 w-full h-full" style={{ gridAutoRows: 'minmax(120px, auto)' }}>
                {currentCardOrder.map(cardItem => (
                  <div
                    key={cardItem.id}
                    data-card-id={cardItem.id}
                    onDragLeave={handleDragLeave}
                    className="col-span-1 p-1"
                  >
                    <div className="h-full">
                      <DraggableCard
                        id={cardItem.id}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        isDragging={draggedCard === cardItem.id}
                        dragOverTarget={dragOverTarget}
                      >
                        {renderCard(cardItem.id)}
                      </DraggableCard>
                    </div>
                  </div>
                ))}
              </div>
            </PageTransition>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <QueryProvider>
      <DashboardContent />
    </QueryProvider>
  )
}
