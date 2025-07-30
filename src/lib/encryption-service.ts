/* eslint-disable node/prefer-global/buffer */
import { createCipheriv, createDecipheriv, createHash, pbkdf2Sync, randomBytes } from 'node:crypto'

class EncryptionService {
  private readonly algorithm = 'aes-256-gcm'
  private readonly keyLength = 32
  private readonly ivLength = 16
  private readonly saltLength = 32
  private readonly tagLength = 16

  // Generate a key from a password using PBKDF2
  private deriveKey(password: string, salt: Buffer): Buffer {
    return pbkdf2Sync(password, salt, 100000, this.keyLength, 'sha256')
  }

  /**
   * Get or generate a master password for encryption
   * In production, this should be derived from user authentication or stored securely
   */
  private getMasterPassword(): string {
    // For now, use a static password. In production, this should be:
    // 1. Derived from user authentication
    // 2. Stored in secure system keychain
    // 3. Generated per-user or per-session
    // eslint-disable-next-line node/prefer-global/process
    return process.env.ENCRYPTION_KEY || 'thermosense-default-key-change-in-production'
  }

  encrypt(data: string): string {
    try {
      const masterPassword = this.getMasterPassword()
      const salt = randomBytes(this.saltLength)
      const iv = randomBytes(this.ivLength)
      const key = this.deriveKey(masterPassword, salt)

      const cipher = createCipheriv(this.algorithm, key, iv)

      let encrypted = cipher.update(data, 'utf8', 'hex')
      encrypted += cipher.final('hex')

      const tag = cipher.getAuthTag()

      // Combine salt + iv + tag + encrypted data
      const combined = Buffer.concat([
        salt,
        iv,
        tag,
        Buffer.from(encrypted, 'hex'),
      ])

      return combined.toString('base64')
    }
    catch (error) {
      console.error('Encryption error:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  decrypt(encryptedData: string): string {
    try {
      const masterPassword = this.getMasterPassword()
      const combined = Buffer.from(encryptedData, 'base64')

      // Extract components
      const salt = combined.subarray(0, this.saltLength)
      const iv = combined.subarray(this.saltLength, this.saltLength + this.ivLength)
      const tag = combined.subarray(
        this.saltLength + this.ivLength,
        this.saltLength + this.ivLength + this.tagLength,
      )
      const encrypted = combined.subarray(this.saltLength + this.ivLength + this.tagLength)

      const key = this.deriveKey(masterPassword, salt)

      const decipher = createDecipheriv(this.algorithm, key, iv)
      decipher.setAuthTag(tag)

      let decrypted = decipher.update(encrypted, undefined, 'utf8')
      decrypted += decipher.final('utf8')

      return decrypted
    }
    catch (error) {
      console.error('Decryption error:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  generateHash(data: string): string {
    return createHash('sha256').update(data).digest('hex')
  }

  generateSalt(): string {
    return randomBytes(this.saltLength).toString('hex')
  }

  verifyIntegrity(encryptedData: string): boolean {
    try {
      this.decrypt(encryptedData)
      return true
    }
    catch {
      return false
    }
  }
}

export const encryptionService = new EncryptionService()
