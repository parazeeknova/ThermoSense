import * as si from 'systeminformation'
import { z } from 'zod'
import { publicProcedure, router } from '../trpc'

export const deviceRouter = router({
  getInfo: publicProcedure.query(async () => {
    try {
      const cpuTemp = await si.cpuTemperature()
      const battery = await si.battery()
      const cpuInfo = await si.cpu()
      const currentLoad = await si.currentLoad()

      return {
        temperature: {
          cpu: cpuTemp.main || null,
          cores: cpuTemp.cores || [],
          max: cpuTemp.max || null,
          socket: cpuTemp.socket || [],
          chipset: cpuTemp.chipset || null,
        },
        battery: {
          hasBattery: battery.hasBattery || false,
          cycleCount: battery.cycleCount || 0,
          isCharging: battery.isCharging || false,
          designedCapacity: battery.designedCapacity || 0,
          maxCapacity: battery.maxCapacity || 0,
          currentCapacity: battery.currentCapacity || 0,
          voltage: battery.voltage || 0,
          capacityUnit: battery.capacityUnit || '',
          percent: battery.percent || 0,
          timeRemaining: battery.timeRemaining || null,
          acConnected: battery.acConnected || false,
          type: battery.type || '',
          model: battery.model || '',
          manufacturer: battery.manufacturer || '',
          serial: battery.serial || '',
        },
        cpu: {
          manufacturer: cpuInfo.manufacturer || '',
          brand: cpuInfo.brand || '',
          speed: cpuInfo.speed || 0,
          cores: cpuInfo.cores || 0,
          physicalCores: cpuInfo.physicalCores || 0,
          processors: cpuInfo.processors || 0,
        },
        load: {
          avgLoad: currentLoad.avgLoad || 0,
          currentLoad: currentLoad.currentLoad || 0,
          currentLoadUser: currentLoad.currentLoadUser || 0,
          currentLoadSystem: currentLoad.currentLoadSystem || 0,
        },
        timestamp: new Date().toISOString(),
      }
    }
    catch (error) {
      console.error('Error fetching device info:', error)
      throw new Error('Failed to fetch device information')
    }
  }),

  getTemperature: publicProcedure.query(async () => {
    try {
      const cpuTemp = await si.cpuTemperature()
      return {
        cpu: cpuTemp.main || null,
        cores: cpuTemp.cores || [],
        max: cpuTemp.max || null,
        socket: cpuTemp.socket || [],
        chipset: cpuTemp.chipset || null,
        timestamp: new Date().toISOString(),
      }
    }
    catch (error) {
      console.error('Error fetching temperature:', error)
      throw new Error('Failed to fetch temperature information')
    }
  }),

  getBattery: publicProcedure.query(async () => {
    try {
      const battery = await si.battery()
      return {
        hasBattery: battery.hasBattery || false,
        cycleCount: battery.cycleCount || 0,
        isCharging: battery.isCharging || false,
        designedCapacity: battery.designedCapacity || 0,
        maxCapacity: battery.maxCapacity || 0,
        currentCapacity: battery.currentCapacity || 0,
        voltage: battery.voltage || 0,
        capacityUnit: battery.capacityUnit || '',
        percent: battery.percent || 0,
        timeRemaining: battery.timeRemaining || null,
        acConnected: battery.acConnected || false,
        type: battery.type || '',
        model: battery.model || '',
        manufacturer: battery.manufacturer || '',
        serial: battery.serial || '',
        timestamp: new Date().toISOString(),
      }
    }
    catch (error) {
      console.error('Error fetching battery info:', error)
      throw new Error('Failed to fetch battery information')
    }
  }),

  getHistory: publicProcedure
    .input(z.object({
      timeRange: z.enum(['30min', '1hour', '6hours', '24hours']).optional().default('30min'),
      limit: z.number().min(1).max(100).optional().default(30),
      lat: z.number().optional(),
      lng: z.number().optional(),
      city: z.string().optional(),
    }))
    .query(async ({ input }) => {
      try {
        // This is a simplified version - in a real implementation, you'd store historical data
        // For now, we'll generate some mock historical data based on current readings
        const currentDeviceInfo = await si.cpuTemperature()
        const currentBattery = await si.battery()
        const currentLoad = await si.currentLoad()

        // Generate mock historical data
        const now = Date.now()
        const data = []
        const intervalMs = input.timeRange === '30min'
          ? 2 * 60 * 1000
          : input.timeRange === '1hour'
            ? 4 * 60 * 1000
            : input.timeRange === '6hours'
              ? 24 * 60 * 1000
              : 60 * 60 * 1000 // 24hours

        for (let i = input.limit - 1; i >= 0; i--) {
          const timestamp = new Date(now - (i * intervalMs)).toISOString()
          const baseTemp = currentDeviceInfo.main || 45
          const baseBattery = currentBattery.percent || 80
          const baseLoad = currentLoad.currentLoad || 30

          // Add some realistic variation
          const tempVariation = (Math.random() - 0.5) * 10
          const batteryVariation = (Math.random() - 0.5) * 5
          const loadVariation = (Math.random() - 0.5) * 20

          const deviceState = baseLoad + loadVariation > 50
            ? 'active'
            : baseLoad + loadVariation > 10 ? 'idle' : 'sleep'

          data.push({
            timestamp,
            batteryTemp: Math.max(20, baseTemp + tempVariation),
            ambientTemp: 25 + (Math.random() - 0.5) * 10,
            cpuLoad: Math.max(0, Math.min(100, baseLoad + loadVariation)),
            deviceState: deviceState as 'active' | 'idle' | 'sleep',
            batteryLevel: Math.max(0, Math.min(100, baseBattery + batteryVariation)),
            batteryHealth: 95 + (Math.random() - 0.5) * 10,
            location: input.lat && input.lng && input.city
              ? {
                  lat: input.lat,
                  lng: input.lng,
                  city: input.city,
                }
              : undefined,
            correlation: ((baseTemp + tempVariation - 25) / 25 * 100).toFixed(1),
            efficiency: Math.max(70, 100 - (baseTemp + tempVariation - 25) * 2),
            healthDegradation: Math.max(0, (baseTemp + tempVariation - 45) * 0.1),
            chargeEfficiency: Math.max(75, 100 - (baseTemp + tempVariation - 25) * 0.8),
            lifespan: Math.max(85, 100 - (baseTemp + tempVariation - 30) * 0.3),
          })
        }

        const summary = {
          avgDeviceTemp: data.reduce((sum, r) => sum + r.batteryTemp, 0) / data.length,
          avgAmbientTemp: data.reduce((sum, r) => sum + r.ambientTemp, 0) / data.length,
          avgCpuLoad: data.reduce((sum, r) => sum + r.cpuLoad, 0) / data.length,
          maxTempDiff: Math.max(...data.map(r => r.batteryTemp - r.ambientTemp)),
          avgBatteryHealth: data.reduce((sum, r) => sum + r.batteryHealth, 0) / data.length,
        }

        return {
          data,
          timeRange: input.timeRange,
          totalReadings: data.length,
          latestReading: data[data.length - 1],
          summary,
          collectedReadings: data.length,
          isRealData: false, // This is mock data
          isBootstrapping: data.length < 5, // Consider bootstrapping if we have less than 5 readings
          message: data.length < 5 ? 'Collecting initial data... Please wait a few moments and refresh.' : undefined,
        }
      }
      catch (error) {
        console.error('Error fetching device history:', error)
        throw new Error('Failed to fetch device history')
      }
    }),
})
