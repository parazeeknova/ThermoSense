import type { APIKeyConfiguration, APIService } from '@/types/api-keys'
import { promises as fs } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { encryptionService } from './encryption-service'

interface StoredKeyData {
  service: APIService
  encryptedKey: string
  keyHash: string
  isActive: boolean
  lastValidated: string
  createdAt: string
  updatedAt: string
}

class KeyStorageService {
  private readonly storageDir: string
  private readonly storageFile: string

  constructor() {
    // Use different storage locations based on environment
    if (typeof window !== 'undefined') {
      // Browser environment - will use localStorage
      this.storageDir = ''
      this.storageFile = ''
    }
    else {
      // Node.js environment (Electron main process or Next.js server)
      this.storageDir = join(homedir(), '.thermosense')
      this.storageFile = join(this.storageDir, 'api-keys.json')
    }
  }

  /**
   * Ensure storage directory exists
   */
  private async ensureStorageDir(): Promise<void> {
    if (typeof window !== 'undefined')
      return // Browser environment

    try {
      await fs.access(this.storageDir)
    }
    catch {
      await fs.mkdir(this.storageDir, { recursive: true })
    }
  }

  /**
   * Load all stored keys from file or localStorage
   */
  private async loadStoredKeys(): Promise<Record<string, StoredKeyData>> {
    if (typeof window !== 'undefined') {
      // Browser environment
      const stored = localStorage.getItem('thermosense-api-keys')
      return stored ? JSON.parse(stored) : {}
    }

    // Node.js environment
    try {
      await this.ensureStorageDir()
      const data = await fs.readFile(this.storageFile, 'utf8')
      return JSON.parse(data)
    }
    catch {
      return {}
    }
  }

  /**
   * Save all keys to file or localStorage
   */
  private async saveStoredKeys(keys: Record<string, StoredKeyData>): Promise<void> {
    if (typeof window !== 'undefined') {
      // Browser environment
      localStorage.setItem('thermosense-api-keys', JSON.stringify(keys))
      return
    }

    // Node.js environment
    await this.ensureStorageDir()
    await fs.writeFile(this.storageFile, JSON.stringify(keys, null, 2))
  }

  /**
   * Save an API key securely
   */
  async saveKey(service: APIService, key: string): Promise<void> {
    try {
      const encryptedKey = encryptionService.encrypt(key)
      const keyHash = encryptionService.generateHash(key)
      const now = new Date().toISOString()

      const keyData: StoredKeyData = {
        service,
        encryptedKey,
        keyHash,
        isActive: true,
        lastValidated: now,
        createdAt: now,
        updatedAt: now,
      }

      const storedKeys = await this.loadStoredKeys()
      storedKeys[service] = keyData
      await this.saveStoredKeys(storedKeys)
    }
    catch (error) {
      console.error(`Failed to save ${service} API key:`, error)
      throw new Error(`Failed to save ${service} API key`)
    }
  }

  /**
   * Retrieve and decrypt an API key
   */
  async getKey(service: APIService): Promise<string | null> {
    try {
      const storedKeys = await this.loadStoredKeys()
      const keyData = storedKeys[service]

      if (!keyData || !keyData.isActive) {
        return null
      }

      return encryptionService.decrypt(keyData.encryptedKey)
    }
    catch (error) {
      console.error(`Failed to retrieve ${service} API key:`, error)
      return null
    }
  }

  /**
   * Remove an API key
   */
  async removeKey(service: APIService): Promise<void> {
    try {
      const storedKeys = await this.loadStoredKeys()
      delete storedKeys[service]
      await this.saveStoredKeys(storedKeys)
    }
    catch (error) {
      console.error(`Failed to remove ${service} API key:`, error)
      throw new Error(`Failed to remove ${service} API key`)
    }
  }

  /**
   * Check if a key exists for a service
   */
  async hasKey(service: APIService): Promise<boolean> {
    try {
      const storedKeys = await this.loadStoredKeys()
      const keyData = storedKeys[service]
      return keyData?.isActive === true
    }
    catch {
      return false
    }
  }

  /**
   * Get key configuration without the actual key
   */
  async getKeyConfig(service: APIService): Promise<APIKeyConfiguration | null> {
    try {
      const storedKeys = await this.loadStoredKeys()
      const keyData = storedKeys[service]

      if (!keyData) {
        return null
      }

      return {
        id: service,
        service,
        keyHash: keyData.keyHash,
        encryptedKey: keyData.encryptedKey,
        isActive: keyData.isActive,
        lastValidated: new Date(keyData.lastValidated),
        createdAt: new Date(keyData.createdAt),
        updatedAt: new Date(keyData.updatedAt),
      }
    }
    catch (error) {
      console.error(`Failed to get ${service} key config:`, error)
      return null
    }
  }

  /**
   * Update key metadata (without changing the key itself)
   */
  async updateKeyMetadata(service: APIService, updates: Partial<Pick<StoredKeyData, 'isActive' | 'lastValidated'>>): Promise<void> {
    try {
      const storedKeys = await this.loadStoredKeys()
      const keyData = storedKeys[service]

      if (!keyData) {
        throw new Error(`No key found for service: ${service}`)
      }

      storedKeys[service] = {
        ...keyData,
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      await this.saveStoredKeys(storedKeys)
    }
    catch (error) {
      console.error(`Failed to update ${service} key metadata:`, error)
      throw new Error(`Failed to update ${service} key metadata`)
    }
  }

  /**
   * List all configured services
   */
  async listConfiguredServices(): Promise<APIService[]> {
    try {
      const storedKeys = await this.loadStoredKeys()
      return Object.keys(storedKeys).filter(service => storedKeys[service].isActive) as APIService[]
    }
    catch {
      return []
    }
  }
}

export const keyStorageService = new KeyStorageService()
