import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const ENC_PREFIX = 'enc:'

function getKey(): Buffer | null {
  const keyHex = process.env.TOKEN_ENCRYPTION_KEY
  if (!keyHex) return null
  const key = Buffer.from(keyHex, 'hex')
  if (key.length !== 32) {
    console.error('[token-encrypt] TOKEN_ENCRYPTION_KEY must be 32 bytes (64 hex chars) — ignoring')
    return null
  }
  return key
}

export function encryptToken(plaintext: string): string {
  const key = getKey()
  if (!key) {
    console.warn('[token-encrypt] TOKEN_ENCRYPTION_KEY not set — storing token in plaintext')
    return plaintext
  }
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${ENC_PREFIX}${iv.toString('base64url')}:${authTag.toString('base64url')}:${encrypted.toString('base64url')}`
}

export function decryptToken(value: string): string {
  if (!value.startsWith(ENC_PREFIX)) return value  // plaintext (pre-encryption or no key)
  const key = getKey()
  if (!key) throw new Error('[token-encrypt] TOKEN_ENCRYPTION_KEY not set but encrypted token found')
  const parts = value.slice(ENC_PREFIX.length).split(':')
  if (parts.length !== 3) throw new Error('[token-encrypt] Invalid encrypted token format')
  const [ivB64, authTagB64, encryptedB64] = parts
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivB64, 'base64url'))
  decipher.setAuthTag(Buffer.from(authTagB64, 'base64url'))
  return Buffer.concat([decipher.update(Buffer.from(encryptedB64, 'base64url')), decipher.final()]).toString('utf8')
}
