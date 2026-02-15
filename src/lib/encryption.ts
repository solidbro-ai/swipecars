import nacl from 'tweetnacl'
import naclUtil from 'tweetnacl-util'

export interface KeyPair {
  publicKey: string
  secretKey: string
}

export interface EncryptedMessage {
  encrypted: string
  nonce: string
}

/**
 * Generate a new keypair for a user
 */
export function generateKeyPair(): KeyPair {
  const keypair = nacl.box.keyPair()
  return {
    publicKey: naclUtil.encodeBase64(keypair.publicKey),
    secretKey: naclUtil.encodeBase64(keypair.secretKey),
  }
}

/**
 * Encrypt a message using the sender's secret key and receiver's public key
 */
export function encryptMessage(
  message: string,
  senderSecretKey: string,
  receiverPublicKey: string
): EncryptedMessage {
  const nonce = nacl.randomBytes(nacl.box.nonceLength)
  const messageUint8 = naclUtil.decodeUTF8(message)
  const senderSecretKeyUint8 = naclUtil.decodeBase64(senderSecretKey)
  const receiverPublicKeyUint8 = naclUtil.decodeBase64(receiverPublicKey)

  const encrypted = nacl.box(
    messageUint8,
    nonce,
    receiverPublicKeyUint8,
    senderSecretKeyUint8
  )

  return {
    encrypted: naclUtil.encodeBase64(encrypted),
    nonce: naclUtil.encodeBase64(nonce),
  }
}

/**
 * Decrypt a message using the receiver's secret key and sender's public key
 */
export function decryptMessage(
  encryptedMessage: string,
  nonce: string,
  senderPublicKey: string,
  receiverSecretKey: string
): string | null {
  try {
    const encryptedUint8 = naclUtil.decodeBase64(encryptedMessage)
    const nonceUint8 = naclUtil.decodeBase64(nonce)
    const senderPublicKeyUint8 = naclUtil.decodeBase64(senderPublicKey)
    const receiverSecretKeyUint8 = naclUtil.decodeBase64(receiverSecretKey)

    const decrypted = nacl.box.open(
      encryptedUint8,
      nonceUint8,
      senderPublicKeyUint8,
      receiverSecretKeyUint8
    )

    if (!decrypted) {
      return null
    }

    return naclUtil.encodeUTF8(decrypted)
  } catch (error) {
    console.error('Decryption error:', error)
    return null
  }
}

/**
 * Generate a shared key for symmetric encryption (for group chats in future)
 */
export function generateSharedKey(
  secretKey: string,
  publicKey: string
): Uint8Array {
  const secretKeyUint8 = naclUtil.decodeBase64(secretKey)
  const publicKeyUint8 = naclUtil.decodeBase64(publicKey)
  return nacl.box.before(publicKeyUint8, secretKeyUint8)
}

/**
 * Hash a string (for password verification, etc.)
 */
export function hashString(input: string): string {
  const inputUint8 = naclUtil.decodeUTF8(input)
  const hash = nacl.hash(inputUint8)
  return naclUtil.encodeBase64(hash)
}

/**
 * Generate a random token
 */
export function generateToken(length: number = 32): string {
  const bytes = nacl.randomBytes(length)
  return naclUtil.encodeBase64(bytes)
}
