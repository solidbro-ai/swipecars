'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { ThreadPreview, MessageWithSender } from '@/types'
import { encryptMessage, decryptMessage } from '@/lib/encryption'

interface UseMessagesOptions {
  pollInterval?: number
}

export function useThreads(options: UseMessagesOptions = {}) {
  const { pollInterval = 5000 } = options
  const [threads, setThreads] = useState<ThreadPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout>()

  const fetchThreads = useCallback(async () => {
    try {
      const response = await fetch('/api/messages/threads')
      if (!response.ok) throw new Error('Failed to fetch threads')
      
      const data = await response.json()
      setThreads(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchThreads()
    
    // Poll for new messages
    intervalRef.current = setInterval(fetchThreads, pollInterval)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchThreads, pollInterval])

  const refresh = useCallback(() => {
    setLoading(true)
    fetchThreads()
  }, [fetchThreads])

  const getTotalUnread = useCallback(() => {
    return threads.reduce((sum, thread) => sum + thread.unreadCount, 0)
  }, [threads])

  return {
    threads,
    loading,
    error,
    refresh,
    getTotalUnread,
  }
}

interface UseThreadMessagesOptions {
  threadId: string
  mySecretKey: string
  pollInterval?: number
}

export function useThreadMessages(options: UseThreadMessagesOptions) {
  const { threadId, mySecretKey, pollInterval = 3000 } = options
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [thread, setThread] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout>()

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/messages/${threadId}`)
      if (!response.ok) throw new Error('Failed to fetch messages')
      
      const data = await response.json()
      setThread(data.thread)
      setMessages(data.messages)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [threadId])

  useEffect(() => {
    fetchMessages()
    
    // Poll for new messages
    intervalRef.current = setInterval(fetchMessages, pollInterval)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchMessages, pollInterval])

  const sendMessage = useCallback(async (
    content: string,
    receiverId: string,
    receiverPublicKey: string
  ) => {
    try {
      setSending(true)
      
      // Encrypt the message
      const encrypted = encryptMessage(content, mySecretKey, receiverPublicKey)
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          receiverId,
          encryptedContent: encrypted.encrypted,
          nonce: encrypted.nonce,
        }),
      })
      
      if (!response.ok) throw new Error('Failed to send message')
      
      const newMessage = await response.json()
      setMessages(prev => [...prev, newMessage])
      
      return newMessage
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
      throw err
    } finally {
      setSending(false)
    }
  }, [threadId, mySecretKey])

  const decryptMessages = useCallback((
    messages: MessageWithSender[],
    myUserId: string
  ) => {
    return messages.map(msg => {
      try {
        const senderPublicKey = msg.sender.publicKey
        if (!senderPublicKey) return { ...msg, decryptedContent: '[Unable to decrypt]' }
        
        const decrypted = decryptMessage(
          msg.encryptedContent,
          msg.nonce,
          senderPublicKey,
          mySecretKey
        )
        
        return { ...msg, decryptedContent: decrypted || '[Unable to decrypt]' }
      } catch {
        return { ...msg, decryptedContent: '[Unable to decrypt]' }
      }
    })
  }, [mySecretKey])

  const markAsRead = useCallback(async () => {
    try {
      await fetch(`/api/messages/${threadId}/read`, { method: 'POST' })
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }, [threadId])

  return {
    messages,
    thread,
    loading,
    sending,
    error,
    sendMessage,
    decryptMessages,
    markAsRead,
    refresh: fetchMessages,
  }
}

export function useCreateThread() {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createThread = useCallback(async (carId: string, sellerId: string) => {
    try {
      setCreating(true)
      setError(null)
      
      const response = await fetch('/api/messages/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId, sellerId }),
      })
      
      if (!response.ok) throw new Error('Failed to create thread')
      
      const data = await response.json()
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      throw err
    } finally {
      setCreating(false)
    }
  }, [])

  return { createThread, creating, error }
}
