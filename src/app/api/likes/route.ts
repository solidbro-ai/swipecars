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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const [likes, total] = await Promise.all([
      prisma.like.findMany({
        where: { userId: session.user.id },
        include: {
          car: {
            include: {
              images: {
                orderBy: { order: 'asc' },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.like.count({
        where: { userId: session.user.id },
      }),
    ])

    const data = likes
      .filter((like) => like.car.status === 'ACTIVE')
      .map((like) => ({
        id: like.car.id,
        make: like.car.make,
        model: like.car.model,
        year: like.car.year,
        price: like.car.price,
        mileage: like.car.mileage,
        location: like.car.location,
        condition: like.car.condition,
        images: like.car.images,
        likedAt: like.createdAt,
      }))

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    })
  } catch (error) {
    console.error('Likes fetch error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch likes' },
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

    const { carId } = await request.json()

    if (!carId) {
      return NextResponse.json(
        { message: 'Car ID is required' },
        { status: 400 }
      )
    }

    // Check if car exists
    const car = await prisma.car.findUnique({
      where: { id: carId },
    })

    if (!car) {
      return NextResponse.json(
        { message: 'Car not found' },
        { status: 404 }
      )
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_carId: {
          userId: session.user.id,
          carId,
        },
      },
    })

    if (existingLike) {
      return NextResponse.json({ message: 'Already liked' })
    }

    const like = await prisma.like.create({
      data: {
        userId: session.user.id,
        carId,
      },
    })

    return NextResponse.json(like, { status: 201 })
  } catch (error) {
    console.error('Like error:', error)
    return NextResponse.json(
      { message: 'Failed to like car' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const carId = searchParams.get('carId')

    if (!carId) {
      return NextResponse.json(
        { message: 'Car ID is required' },
        { status: 400 }
      )
    }

    await prisma.like.delete({
      where: {
        userId_carId: {
          userId: session.user.id,
          carId,
        },
      },
    })

    return NextResponse.json({ message: 'Like removed' })
  } catch (error) {
    console.error('Unlike error:', error)
    return NextResponse.json(
      { message: 'Failed to unlike car' },
      { status: 500 }
    )
  }
}
