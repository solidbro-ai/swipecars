'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ThreadList } from '@/components/messages/thread-list'
import { MessageCircle } from 'lucide-react'

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/messages')
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border bg-card shadow-lg">
          <div className="h-[calc(100vh-12rem)]">
            <ThreadList />
          </div>
        </div>
      </div>
    </div>
  )
}
