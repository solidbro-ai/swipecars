'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { MessageCircle, Car, Search } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useThreads } from '@/hooks/use-messages'
import { ThreadPreview } from '@/types'
import { formatRelativeTime, truncate, cn } from '@/lib/utils'

interface ThreadListProps {
  onSelectThread?: (threadId: string) => void
  selectedThreadId?: string
}

export function ThreadList({ onSelectThread, selectedThreadId }: ThreadListProps) {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const { threads, loading, getTotalUnread } = useThreads()

  const filteredThreads = threads.filter((thread) => {
    if (!searchQuery) return true
    const search = searchQuery.toLowerCase()
    return (
      thread.otherUser.name?.toLowerCase().includes(search) ||
      `${thread.car.year} ${thread.car.make} ${thread.car.model}`
        .toLowerCase()
        .includes(search)
    )
  })

  const totalUnread = getTotalUnread()

  if (loading) {
    return <ThreadListSkeleton />
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Messages</h2>
          {totalUnread > 0 && (
            <Badge variant="default">{totalUnread} unread</Badge>
          )}
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {filteredThreads.length === 0 ? (
          <EmptyState searchQuery={searchQuery} />
        ) : (
          <div className="divide-y">
            {filteredThreads.map((thread) => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                isSelected={
                  selectedThreadId === thread.id ||
                  pathname === `/messages/${thread.id}`
                }
                onClick={() => onSelectThread?.(thread.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface ThreadItemProps {
  thread: ThreadPreview
  isSelected?: boolean
  onClick?: () => void
}

function ThreadItem({ thread, isSelected, onClick }: ThreadItemProps) {
  return (
    <Link
      href={`/messages/${thread.id}`}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <motion.div
        whileHover={{ backgroundColor: 'hsl(var(--secondary))' }}
        className={cn(
          'flex cursor-pointer items-start gap-3 p-4 transition-colors',
          isSelected && 'bg-secondary',
          thread.unreadCount > 0 && 'bg-primary/5'
        )}
      >
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarImage src={thread.otherUser.image || ''} />
            <AvatarFallback>
              {thread.otherUser.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {thread.unreadCount > 0 && (
            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between">
            <p className={cn('font-medium', thread.unreadCount > 0 && 'font-bold')}>
              {thread.otherUser.name || 'Unknown User'}
            </p>
            {thread.lastMessage && (
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(thread.lastMessage.createdAt)}
              </span>
            )}
          </div>

          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
            <Car className="h-3 w-3" />
            {thread.car.year} {thread.car.make} {thread.car.model}
          </p>

          {thread.lastMessage && (
            <p
              className={cn(
                'mt-1 truncate text-sm',
                thread.unreadCount > 0
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {truncate(thread.lastMessage.content, 50)}
            </p>
          )}
        </div>

        {/* Car thumbnail */}
        {thread.car.images?.[0] && (
          <div className="relative hidden h-12 w-16 overflow-hidden rounded-lg sm:block">
            <Image
              src={thread.car.images[0].url}
              alt={`${thread.car.make} ${thread.car.model}`}
              fill
              className="object-cover"
            />
          </div>
        )}
      </motion.div>
    </Link>
  )
}

function EmptyState({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <MessageCircle className="h-16 w-16 text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-medium">
        {searchQuery ? 'No conversations found' : 'No messages yet'}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {searchQuery
          ? 'Try a different search term'
          : "When you start a conversation with a seller, it'll appear here"}
      </p>
    </div>
  )
}

function ThreadListSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="mt-3 h-10 w-full" />
      </div>
      <div className="flex-1 divide-y">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-2 h-3 w-48" />
              <Skeleton className="mt-2 h-3 w-64" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
