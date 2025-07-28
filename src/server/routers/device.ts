import * as si from 'systeminformation'
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
})
