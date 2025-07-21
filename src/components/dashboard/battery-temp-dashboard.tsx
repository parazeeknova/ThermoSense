'use client'

import type { DashboardPage } from './sidebar-navigation'
import type { DeviceType } from '@/types/dashboard'
import { Laptop, Smartphone } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getGuidanceMessage, getRiskLevel } from '@/lib/dashboard-utils'
import { BlueprintGrid } from './blueprint-grid'
import { BatteryCard } from './cards/battery-card'
import {
  BatteryHealthCard,
  DeviceUsageCard,
  RiskDistributionCard,
  TemperatureCorrelationCard,
} from './cards/chart-cards'
import { DeviceConfigPanel } from './cards/device-config-panel'
import { GuidanceCard } from './cards/guidance-card'
import { HeatRiskMeter } from './cards/heat-risk-meter'
import { HistoricalDataPanel } from './cards/historical-data-panel'
import { NotificationCenter } from './cards/notification-center'
import { PredictiveAnalyticsPanel } from './cards/predictive-analytics-panel'
import { QuickStatsCard } from './cards/quick-stats-card'
import { RiskStatusCard } from './cards/risk-status-card'
import { DeviceTemperatureCard, OutdoorTemperatureCard } from './cards/temperature-cards'
import { WeatherLocationPanel } from './cards/weather-location-panel'
import { DraggableCard } from './draggable-card'
import { PageTransition, StaggeredGrid } from './page-transition'
import { SidebarNavigation } from './sidebar-navigation'

// Bento box layout configuration with card IDs for CSS targeting
const pageCards = {
  monitoring: [
    { id: 'device-temp' },
    { id: 'outdoor-temp' },
    { id: 'battery-level' },
    { id: 'risk-status' },
    { id: 'heat-risk-meter' },
    { id: 'weather-location' },
    { id: 'quick-stats' },
    { id: 'notification-center' },
    { id: 'guidance' },
  ],
  analytics: [
    { id: 'temp-correlation' },
    { id: 'battery-health' },
    { id: 'predictive-analytics' },
    { id: 'device-config' },
    { id: 'historical-data' },
    { id: 'risk-distribution' },
    { id: 'device-usage' },
  ],
}

export default function BatteryTempDashboard() {
  const [currentDeviceTemp, setCurrentDeviceTemp] = useState(42)
  const [currentOutdoorTemp, setCurrentOutdoorTemp] = useState(38)
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('laptop')
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
  const guidanceMessage = getGuidanceMessage(currentDeviceTemp, currentOutdoorTemp, selectedDevice)

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

  const renderCard = (cardId: string) => {
    const cardProps = {
      id: cardId,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
      isDragging: draggedCard === cardId,
      dragOverTarget,
    }

    const cardComponent = (() => {
      switch (cardId) {
        case 'device-temp':
          return <DeviceTemperatureCard temperature={currentDeviceTemp} />
        case 'outdoor-temp':
          return <OutdoorTemperatureCard temperature={currentOutdoorTemp} />
        case 'battery-level':
          return <BatteryCard batteryLevel={batteryLevel} />
        case 'risk-status':
          return (
            <RiskStatusCard
              riskStatus={currentRisk}
              deviceTemp={currentDeviceTemp}
              outdoorTemp={currentOutdoorTemp}
            />
          )
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
        case 'guidance':
          return <GuidanceCard message={guidanceMessage} />
        case 'notification-center':
          return <NotificationCenter />
        case 'temp-correlation':
          return <TemperatureCorrelationCard />
        case 'battery-health':
          return <BatteryHealthCard />
        case 'weather-location':
          return <WeatherLocationPanel />
        case 'predictive-analytics':
          return <PredictiveAnalyticsPanel />
        case 'historical-data':
          return <HistoricalDataPanel />
        case 'device-config':
          return <DeviceConfigPanel />
        case 'risk-distribution':
          return <RiskDistributionCard />
        case 'device-usage':
          return <DeviceUsageCard />
        case 'quick-stats':
          return <QuickStatsCard />
        default:
          return null
      }
    })()

    if (!cardComponent)
      return null

    return (
      <div data-card-id={cardId} onDragLeave={handleDragLeave}>
        <DraggableCard {...cardProps}>{cardComponent}</DraggableCard>
      </div>
    )
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
      <style jsx>
        {`
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(7, 200px);
          gap: 1.5rem;
          width: 100%;
          height: auto;
        }

        .bento-grid > div {
          position: relative;
          overflow: hidden;
          border: 2px solid #e2e8f0;
          background: rgba(59, 130, 246, 0.1);
          min-height: 180px;
        }

        /* Monitoring page grid positioning using nth-child */
        .bento-grid[data-page="monitoring"] > div:nth-child(1) { grid-area: 1 / 1 / 2 / 2; } /* device-temp */
        .bento-grid[data-page="monitoring"] > div:nth-child(2) { grid-area: 1 / 2 / 2 / 3; } /* outdoor-temp */
        .bento-grid[data-page="monitoring"] > div:nth-child(3) { grid-area: 1 / 3 / 2 / 4; } /* battery-level */
        .bento-grid[data-page="monitoring"] > div:nth-child(4) { grid-area: 1 / 4 / 2 / 5; } /* risk-status */
        .bento-grid[data-page="monitoring"] > div:nth-child(5) { grid-area: 2 / 1 / 4 / 3; } /* heat-risk-meter */
        .bento-grid[data-page="monitoring"] > div:nth-child(6) { grid-area: 2 / 3 / 4 / 5; } /* weather-location */
        .bento-grid[data-page="monitoring"] > div:nth-child(7) { grid-area: 4 / 1 / 5 / 3; } /* quick-stats */
        .bento-grid[data-page="monitoring"] > div:nth-child(8) { grid-area: 4 / 3 / 6 / 5; } /* notification-center */
        .bento-grid[data-page="monitoring"] > div:nth-child(9) { grid-area: 5 / 1 / 6 / 3; } /* guidance */

        /* Analytics page grid positioning using nth-child */
        .bento-grid[data-page="analytics"] > div:nth-child(1) { grid-area: 1 / 1 / 3 / 3; } /* temp-correlation */
        .bento-grid[data-page="analytics"] > div:nth-child(2) { grid-area: 1 / 3 / 3 / 5; } /* battery-health */
        .bento-grid[data-page="analytics"] > div:nth-child(3) { grid-area: 3 / 1 / 5 / 4; } /* predictive-analytics */
        .bento-grid[data-page="analytics"] > div:nth-child(4) { grid-area: 3 / 4 / 6 / 5; } /* device-config */
        .bento-grid[data-page="analytics"] > div:nth-child(5) { grid-area: 5 / 1 / 6 / 4; } /* historical-data */
        .bento-grid[data-page="analytics"] > div:nth-child(6) { grid-area: 6 / 1 / 7 / 3; } /* risk-distribution */
        .bento-grid[data-page="analytics"] > div:nth-child(7) { grid-area: 6 / 3 / 7 / 5; } /* device-usage */

        @media (max-width: 1024px) {
          .bento-grid {
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: auto;
          }

          .bento-grid[data-page="monitoring"] > div,
          .bento-grid[data-page="analytics"] > div {
            grid-area: auto !important;
          }
        }

        @media (max-width: 640px) {
          .bento-grid {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
          }
        }
      `}
      </style>

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
          <div className="max-w-none mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <PageTransition pageKey={currentPage}>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {pageTitle}
                  </h1>
                  <p className="text-gray-600">
                    {pageDescription}
                  </p>
                </PageTransition>
              </div>
              <div className="flex gap-3 ml-6">
                <Button
                  variant={selectedDevice === 'laptop' ? 'default' : 'outline'}
                  onClick={() => setSelectedDevice('laptop')}
                  className={`${
                    selectedDevice === 'laptop'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 bg-white'
                  } rounded-lg px-6 py-3 transition-all duration-200`}
                >
                  <Laptop className="w-5 h-5 mr-2" />
                  Laptop
                </Button>
                <Button
                  variant={selectedDevice === 'mobile' ? 'default' : 'outline'}
                  onClick={() => setSelectedDevice('mobile')}
                  className={`${
                    selectedDevice === 'mobile'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 bg-white'
                  } rounded-lg px-6 py-3 transition-all duration-200`}
                >
                  <Smartphone className="w-5 h-5 mr-2" />
                  Mobile
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content with Bento Box Layout */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-none mx-auto">
            <PageTransition pageKey={currentPage}>
              <StaggeredGrid
                className="bento-grid"
                data-page={currentPage}
                staggerDelay={75}
              >
                {currentCardOrder.map((cardItem, index) => {
                  const card = renderCard(cardItem.id)

                  return (
                    <div
                      key={cardItem.id}
                      className="bento-card"
                      data-card={cardItem.id}
                      data-index={index}
                    >
                      {card}
                    </div>
                  )
                })}
              </StaggeredGrid>
            </PageTransition>
          </div>
        </div>
      </div>
    </div>
  )
}
