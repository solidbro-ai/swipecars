import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { threadId, receiverId, encryptedContent, nonce } = await request.json()

    if (!threadId || !receiverId || !encryptedContent || !nonce) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify user is participant of thread
    const thread = await prisma.messageThread.findFirst({
      where: {
        id: threadId,
        participants: {
          some: { userId: session.user.id },
        },
      },
    })

    if (!thread) {
      return NextResponse.json(
        { message: 'Thread not found or access denied' },
        { status: 404 }
      )
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        threadId,
        senderId: session.user.id,
        receiverId,
        encryptedContent,
        nonce,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            publicKey: true,
          },
        },
      },
    })

    // Update thread timestamp
    await prisma.messageThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Message send error:', error)
    return NextResponse.json(
      { message: 'Failed to send message' },
      { status: 500 }
    )
  }
}
