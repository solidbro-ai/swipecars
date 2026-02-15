import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const thread = await prisma.messageThread.findFirst({
      where: {
        id: params.threadId,
        participants: {
          some: { userId: session.user.id },
        },
      },
      include: {
        car: {
          include: {
            images: {
              take: 3,
              orderBy: { order: 'asc' },
            },
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
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

    if (!thread) {
      return NextResponse.json(
        { message: 'Thread not found' },
        { status: 404 }
      )
    }

    const messages = await prisma.message.findMany({
      where: { threadId: params.threadId },
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
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ thread, messages })
  } catch (error) {
    console.error('Thread fetch error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch thread' },
      { status: 500 }
    )
  }
}
