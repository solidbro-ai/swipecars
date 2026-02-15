import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const threads = await prisma.messageThread.findMany({
      where: {
        participants: {
          some: { userId: session.user.id },
        },
      },
      include: {
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            price: true,
            images: {
              take: 1,
              orderBy: { order: 'asc' },
              select: { url: true },
            },
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            encryptedContent: true,
            createdAt: true,
            senderId: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    // Calculate unread count for each thread
    const threadsWithUnread = await Promise.all(
      threads.map(async (thread) => {
        const participant = thread.participants.find(
          (p) => p.user.id === session.user.id
        )
        
        const unreadCount = await prisma.message.count({
          where: {
            threadId: thread.id,
            receiverId: session.user.id,
            createdAt: {
              gt: participant?.lastReadAt || new Date(0),
            },
          },
        })

        const otherUser = thread.participants.find(
          (p) => p.user.id !== session.user.id
        )?.user

        return {
          id: thread.id,
          car: thread.car,
          otherUser: otherUser || { id: '', name: 'Unknown', image: null },
          lastMessage: thread.messages[0]
            ? {
                content: '[Encrypted]',
                createdAt: thread.messages[0].createdAt,
              }
            : null,
          unreadCount,
        }
      })
    )

    return NextResponse.json(threadsWithUnread)
  } catch (error) {
    console.error('Threads fetch error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch threads' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { carId, sellerId } = await request.json()

    if (!carId || !sellerId) {
      return NextResponse.json(
        { message: 'Car ID and Seller ID are required' },
        { status: 400 }
      )
    }

    // Cannot message yourself
    if (sellerId === session.user.id) {
      return NextResponse.json(
        { message: 'Cannot message yourself' },
        { status: 400 }
      )
    }

    // Check if thread already exists
    const existingThread = await prisma.messageThread.findFirst({
      where: {
        carId,
        AND: [
          { participants: { some: { userId: session.user.id } } },
          { participants: { some: { userId: sellerId } } },
        ],
      },
    })

    if (existingThread) {
      return NextResponse.json(existingThread)
    }

    // Create new thread
    const thread = await prisma.messageThread.create({
      data: {
        carId,
        participants: {
          create: [
            { userId: session.user.id },
            { userId: sellerId },
          ],
        },
      },
      include: {
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            price: true,
            images: {
              take: 1,
              orderBy: { order: 'asc' },
              select: { url: true },
            },
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                publicKey: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(thread, { status: 201 })
  } catch (error) {
    console.error('Thread creation error:', error)
    return NextResponse.json(
      { message: 'Failed to create thread' },
      { status: 500 }
    )
  }
}
