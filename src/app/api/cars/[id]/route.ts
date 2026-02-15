import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { carSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    const car = await prisma.car.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { order: 'asc' } },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
            location: true,
            publicKey: true,
          },
        },
        likes: session?.user?.id ? {
          where: { userId: session.user.id },
        } : false,
        priceHistory: {
          orderBy: { changedAt: 'desc' },
          take: 5,
        },
        _count: {
          select: { likes: true },
        },
      },
    })

    if (!car) {
      return NextResponse.json(
        { message: 'Car not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.car.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    })

    // Track recently viewed if user is logged in
    if (session?.user?.id) {
      await prisma.recentlyViewed.upsert({
        where: {
          userId_carId: {
            userId: session.user.id,
            carId: params.id,
          },
        },
        update: { viewedAt: new Date() },
        create: {
          userId: session.user.id,
          carId: params.id,
        },
      })
    }

    return NextResponse.json(car)
  } catch (error) {
    console.error('Car fetch error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch car' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const car = await prisma.car.findUnique({
      where: { id: params.id },
      select: { userId: true, price: true },
    })

    if (!car) {
      return NextResponse.json(
        { message: 'Car not found' },
        { status: 404 }
      )
    }

    if (car.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Not authorized to edit this listing' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { images, ...carData } = body

    // Track price changes
    const priceChanged = carData.price && carData.price !== car.price

    const updatedCar = await prisma.car.update({
      where: { id: params.id },
      data: {
        ...carData,
        images: images ? {
          deleteMany: {},
          create: images.map((url: string, index: number) => ({
            url,
            order: index,
          })),
        } : undefined,
        priceHistory: priceChanged ? {
          create: { price: carData.price },
        } : undefined,
      },
      include: {
        images: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    // If price dropped, notify users who liked this car
    if (priceChanged && carData.price < car.price) {
      // TODO: Implement price drop notifications
    }

    return NextResponse.json(updatedCar)
  } catch (error) {
    console.error('Car update error:', error)
    return NextResponse.json(
      { message: 'Failed to update listing' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const car = await prisma.car.findUnique({
      where: { id: params.id },
      select: { userId: true },
    })

    if (!car) {
      return NextResponse.json(
        { message: 'Car not found' },
        { status: 404 }
      )
    }

    if (car.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Not authorized to delete this listing' },
        { status: 403 }
      )
    }

    // Soft delete - mark as deleted
    await prisma.car.update({
      where: { id: params.id },
      data: { status: 'DELETED' },
    })

    return NextResponse.json({ message: 'Listing deleted' })
  } catch (error) {
    console.error('Car delete error:', error)
    return NextResponse.json(
      { message: 'Failed to delete listing' },
      { status: 500 }
    )
  }
}
