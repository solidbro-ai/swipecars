'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MessageThread } from '@/components/messages/message-thread'

export default function ThreadPage({ params }: { params: { threadId: string } }) {
  const { status } = useSession()
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
            <MessageThread
              threadId={params.threadId}
              onBack={() => router.push('/messages')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
