'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Lock, ArrowLeft, Car } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useThreadMessages } from '@/hooks/use-messages'
import { MessageWithSender } from '@/types'
import { formatRelativeTime, formatPrice, cn } from '@/lib/utils'
import { decryptMessage } from '@/lib/encryption'

interface MessageThreadProps {
  threadId: string
  onBack?: () => void
}

export function MessageThread({ threadId, onBack }: MessageThreadProps) {
  const { data: session } = useSession()
  const [newMessage, setNewMessage] = useState('')
  const [userSecretKey, setUserSecretKey] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Fetch user's secret key
  useEffect(() => {
    const fetchKey = async () => {
      try {
        const response = await fetch('/api/users/me/keys')
        if (response.ok) {
          const data = await response.json()
          setUserSecretKey(data.privateKey)
        }
      } catch (error) {
        console.error('Failed to fetch encryption key:', error)
      }
    }
    fetchKey()
  }, [])

  const {
    messages,
    thread,
    loading,
    sending,
    sendMessage,
    markAsRead,
  } = useThreadMessages({
    threadId,
    mySecretKey: userSecretKey || '',
  })

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark as read
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead()
    }
  }, [messages.length, markAsRead])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !userSecretKey || !thread) return

    const otherUser = thread.participants.find(
      (p: any) => p.user.id !== session?.user?.id
    )?.user

    if (!otherUser?.publicKey) {
      console.error('Cannot encrypt: recipient public key not found')
      return
    }

    try {
      await sendMessage(newMessage.trim(), otherUser.id, otherUser.publicKey)
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const decryptMessageContent = useCallback((msg: MessageWithSender) => {
    if (!userSecretKey) return '[Loading...]'
    
    try {
      const senderPublicKey = msg.sender.publicKey
      if (!senderPublicKey) return '[Unable to decrypt]'
      
      const decrypted = decryptMessage(
        msg.encryptedContent,
        msg.nonce,
        senderPublicKey,
        userSecretKey
      )
      
      return decrypted || '[Unable to decrypt]'
    } catch {
      return '[Unable to decrypt]'
    }
  }, [userSecretKey])

  if (loading) {
    return <MessageThreadSkeleton />
  }

  if (!thread) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Thread not found</p>
      </div>
    )
  }

  const otherUser = thread.participants.find(
    (p: any) => p.user.id !== session?.user?.id
  )?.user

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b p-4">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherUser?.image || ''} />
          <AvatarFallback>
            {otherUser?.name?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className="font-semibold">{otherUser?.name || 'Unknown User'}</h3>
          <Link
            href={`/cars/${thread.car.id}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
          >
            <Car className="h-3 w-3" />
            {thread.car.year} {thread.car.make} {thread.car.model} •{' '}
            {formatPrice(thread.car.price)}
          </Link>
        </div>

        <Badge variant="secondary" className="gap-1">
          <Lock className="h-3 w-3" />
          E2E Encrypted
        </Badge>
      </div>

      {/* Car Preview */}
      <Link href={`/cars/${thread.car.id}`} className="block border-b">
        <div className="flex items-center gap-3 p-3 hover:bg-secondary/50">
          <div className="relative h-16 w-24 overflow-hidden rounded-lg">
            {thread.car.images?.[0] ? (
              <Image
                src={thread.car.images[0].url}
                alt={`${thread.car.make} ${thread.car.model}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Car className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium">
              {thread.car.year} {thread.car.make} {thread.car.model}
            </p>
            <p className="text-lg font-bold text-primary">
              {formatPrice(thread.car.price)}
            </p>
          </div>
        </div>
      </Link>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <Badge variant="outline" className="gap-1 text-xs">
              <Lock className="h-3 w-3" />
              Messages are end-to-end encrypted
            </Badge>
          </div>

          <AnimatePresence initial={false}>
            {messages.map((message, idx) => {
              const isOwn = message.senderId === session?.user?.id
              const showAvatar =
                idx === 0 || messages[idx - 1]?.senderId !== message.senderId

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex items-end gap-2',
                    isOwn && 'flex-row-reverse'
                  )}
                >
                  {showAvatar ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.sender.image || ''} />
                      <AvatarFallback className="text-xs">
                        {message.sender.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-8" />
                  )}

                  <div
                    className={cn(
                      'max-w-[70%] rounded-2xl px-4 py-2',
                      isOwn
                        ? 'rounded-br-sm bg-primary text-primary-foreground'
                        : 'rounded-bl-sm bg-secondary'
                    )}
                  >
                    <p className="break-words">{decryptMessageContent(message)}</p>
                    <p
                      className={cn(
                        'mt-1 text-xs',
                        isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      )}
                    >
                      {formatRelativeTime(message.createdAt)}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending || !userSecretKey}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim() || sending || !userSecretKey}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  )
}

function MessageThreadSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b p-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-1 h-3 w-48" />
        </div>
      </div>
      <div className="flex-1 space-y-4 p-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn('flex items-end gap-2', i % 2 === 0 && 'flex-row-reverse')}
          >
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className={cn('h-16 rounded-2xl', i % 2 === 0 ? 'w-48' : 'w-64')} />
          </div>
        ))}
      </div>
      <div className="border-t p-4">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  )
}
