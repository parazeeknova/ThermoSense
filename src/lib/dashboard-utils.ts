import type { DeviceUsageData, RiskLevel, RiskStatus, TemperatureData } from '@/types/dashboard'

export function getRiskLevel(deviceTemp: number, outdoorTemp: number): RiskStatus {
  const tempDiff = deviceTemp - outdoorTemp
  if (tempDiff > 15 || deviceTemp > 45)
    return 'critical'
  if (tempDiff > 8 || deviceTemp > 40)
    return 'caution'
  return 'safe'
}

// Mock data for temperature correlation
export const temperatureData: TemperatureData[] = [
  { time: '00:00', deviceTemp: 35, outdoorTemp: 22, batteryHealth: 98 },
  { time: '04:00', deviceTemp: 32, outdoorTemp: 20, batteryHealth: 98 },
  { time: '08:00', deviceTemp: 38, outdoorTemp: 25, batteryHealth: 97 },
  { time: '12:00', deviceTemp: 45, outdoorTemp: 32, batteryHealth: 95 },
  { time: '16:00', deviceTemp: 48, outdoorTemp: 35, batteryHealth: 93 },
  { time: '20:00', deviceTemp: 42, outdoorTemp: 28, batteryHealth: 94 },
]

export const riskLevels: RiskLevel[] = [
  { name: 'Safe', value: 65, color: '#10B981' },
  { name: 'Caution', value: 25, color: '#F59E0B' },
  { name: 'Critical', value: 10, color: '#EF4444' },
]

export const deviceUsageData: DeviceUsageData[] = [
  { device: 'Laptop', usage: 8.5 },
  { device: 'Phone', usage: 6.2 },
  { device: 'Tablet', usage: 3.1 },
]

export const chartConfig = {
  deviceTemp: {
    label: 'Device Temperature',
    color: '#10B981',
  },
  outdoorTemp: {
    label: 'Outdoor Temperature',
    color: '#059669',
  },
  batteryHealth: {
    label: 'Battery Health',
    color: '#10B981',
  },
  usage: {
    label: 'Usage Hours',
    color: '#10B981',
  },
}
