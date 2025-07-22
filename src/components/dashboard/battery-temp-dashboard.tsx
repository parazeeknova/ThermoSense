'use client'

import type { DashboardPage } from './sidebar-navigation'
import React, { useEffect, useState } from 'react'
import { getRiskLevel } from '@/lib/dashboard-utils'
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

// Card configuration with order and positioning
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

export default function BatteryTempDashboard() {
  const [currentDeviceTemp, setCurrentDeviceTemp] = useState(42)
  const [currentOutdoorTemp, setCurrentOutdoorTemp] = useState(38)
  const [batteryLevel, _setBatteryLevel] = useState(78)
  const [draggedCard, setDraggedCard] = useState<string | null>(null)
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<DashboardPage>('monitoring')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [monitoringCardOrder, setMonitoringCardOrder] = useState(pageCards.monitoring)
  const [analyticsCardOrder, setAnalyticsCardOrder] = useState(pageCards.analytics)

  // Simulate real-time temperature updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDeviceTemp(prev => prev + (Math.random() - 0.5) * 2)
      setCurrentOutdoorTemp(prev => prev + (Math.random() - 0.5) * 1)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const currentRisk = getRiskLevel(currentDeviceTemp, currentOutdoorTemp)

  // Calculate risk value for heat risk meter (0-100 scale)
  const riskValue = Math.min(100, Math.max(0, ((currentDeviceTemp - currentOutdoorTemp) / 20) * 100))

  // Determine trend based on temperature history (mock implementation)
  const trend: 'increasing' | 'decreasing' | 'stable'
    = currentDeviceTemp > 43
      ? 'increasing'
      : currentDeviceTemp < 40
        ? 'decreasing'
        : 'stable'

  const handlePageChange = (page: DashboardPage) => {
    setCurrentPage(page)
  }

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
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
    ? 'Real-time Monitoring Dashboard'
    : 'Analytics & Configuration Center'

  const pageDescription = currentPage === 'monitoring'
    ? 'Live thermal monitoring with immediate insights and recommendations'
    : 'Historical analysis, predictions, and device configuration settings'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <BlueprintGrid isDragging={!!draggedCard} />

      {/* Sidebar */}
      <SidebarNavigation
        currentPage={currentPage}
        onPageChange={handlePageChange}
        unreadNotifications={3}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content */}
      <div
        className={`flex flex-col overflow-hidden transition-all duration-300 ${
          isCollapsed ? 'ml-16' : 'ml-80'
        }`}
      >
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm sticky top-0 z-30">
          <div className="max-w-none mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <PageTransition pageKey={currentPage}>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {pageTitle}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {pageDescription}
                  </p>
                </PageTransition>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content with Improved Bento Box Layout */}
        <div className="flex-1 overflow-hidden p-3">
          <div className="max-w-none mx-auto h-full">
            <PageTransition pageKey={currentPage}>
              {/* Desktop/Tablet Bento Grid */}
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
                        {(() => {
                          switch (cardItem.id) {
                            case 'device-temp':
                              return <DeviceTemperatureCard temperature={currentDeviceTemp} />
                            case 'outdoor-temp':
                              return <OutdoorTemperatureCard temperature={currentOutdoorTemp} />
                            case 'battery-level':
                              return <BatteryCard batteryLevel={batteryLevel} />
                            case 'heat-risk-meter':
                              return (
                                <HeatRiskMeter
                                  currentRisk={currentRisk}
                                  riskValue={riskValue}
                                  trend={trend}
                                  deviceTemp={currentDeviceTemp}
                                  ambientTemp={currentOutdoorTemp}
                                />
                              )
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
                        })()}
                      </DraggableCard>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tablet Grid (2 columns) */}
              <div className="hidden md:grid lg:hidden grid-cols-2 gap-2 w-full h-full" style={{ gridAutoRows: 'minmax(140px, 1fr)' }}>
                {currentCardOrder.map(cardItem => (
                  <div
                    key={cardItem.id}
                    data-card-id={cardItem.id}
                    onDragLeave={handleDragLeave}
                    className="col-span-1 p-1"
                  >
                    <DraggableCard
                      id={cardItem.id}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      isDragging={draggedCard === cardItem.id}
                      dragOverTarget={dragOverTarget}
                    >
                      {(() => {
                        switch (cardItem.id) {
                          case 'device-temp':
                            return <DeviceTemperatureCard temperature={currentDeviceTemp} />
                          case 'outdoor-temp':
                            return <OutdoorTemperatureCard temperature={currentOutdoorTemp} />
                          case 'battery-level':
                            return <BatteryCard batteryLevel={batteryLevel} />
                          case 'heat-risk-meter':
                            return (
                              <HeatRiskMeter
                                currentRisk={currentRisk}
                                riskValue={riskValue}
                                trend={trend}
                                deviceTemp={currentDeviceTemp}
                                ambientTemp={currentOutdoorTemp}
                              />
                            )
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
                      })()}
                    </DraggableCard>
                  </div>
                ))}
              </div>

              {/* Mobile Grid (1 column) */}
              <div className="grid md:hidden grid-cols-1 gap-2 w-full h-full" style={{ gridAutoRows: 'minmax(140px, 1fr)' }}>
                {currentCardOrder.map(cardItem => (
                  <div
                    key={cardItem.id}
                    data-card-id={cardItem.id}
                    onDragLeave={handleDragLeave}
                    className="col-span-1 p-1"
                  >
                    <DraggableCard
                      id={cardItem.id}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      isDragging={draggedCard === cardItem.id}
                      dragOverTarget={dragOverTarget}
                    >
                      {(() => {
                        switch (cardItem.id) {
                          case 'device-temp':
                            return <DeviceTemperatureCard temperature={currentDeviceTemp} />
                          case 'outdoor-temp':
                            return <OutdoorTemperatureCard temperature={currentOutdoorTemp} />
                          case 'battery-level':
                            return <BatteryCard batteryLevel={batteryLevel} />
                          case 'heat-risk-meter':
                            return (
                              <HeatRiskMeter
                                currentRisk={currentRisk}
                                riskValue={riskValue}
                                trend={trend}
                                deviceTemp={currentDeviceTemp}
                                ambientTemp={currentOutdoorTemp}
                              />
                            )
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
                      })()}
                    </DraggableCard>
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
