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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        publicKey: true,
        privateKeyEnc: true,
      },
    })

    if (!user || !user.publicKey || !user.privateKeyEnc) {
      return NextResponse.json(
        { message: 'Encryption keys not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      publicKey: user.publicKey,
      privateKey: user.privateKeyEnc, // In production, this should be encrypted
    })
  } catch (error) {
    console.error('Keys fetch error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch keys' },
      { status: 500 }
    )
  }
}
