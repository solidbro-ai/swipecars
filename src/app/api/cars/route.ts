import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { carSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const excludeIds = searchParams.get('excludeIds')?.split(',').filter(Boolean) || []
    
    // Filter params
    const yearMin = searchParams.get('yearMin')
    const yearMax = searchParams.get('yearMax')
    const priceMin = searchParams.get('priceMin')
    const priceMax = searchParams.get('priceMax')
    const mileageMin = searchParams.get('mileageMin')
    const mileageMax = searchParams.get('mileageMax')
    const makes = searchParams.get('makes')?.split(',').filter(Boolean)
    const models = searchParams.get('models')?.split(',').filter(Boolean)
    const conditions = searchParams.get('conditions')?.split(',').filter(Boolean)
    const features = searchParams.get('features')?.split(',').filter(Boolean)

    const session = await getServerSession(authOptions)

    const where: any = {
      status: 'ACTIVE',
      NOT: {
        id: { in: excludeIds },
      },
    }

    if (yearMin) where.year = { ...where.year, gte: parseInt(yearMin) }
    if (yearMax) where.year = { ...where.year, lte: parseInt(yearMax) }
    if (priceMin) where.price = { ...where.price, gte: parseFloat(priceMin) }
    if (priceMax) where.price = { ...where.price, lte: parseFloat(priceMax) }
    if (mileageMin) where.mileage = { ...where.mileage, gte: parseInt(mileageMin) }
    if (mileageMax) where.mileage = { ...where.mileage, lte: parseInt(mileageMax) }
    if (makes?.length) where.make = { in: makes }
    if (models?.length) where.model = { in: models }
    if (conditions?.length) where.condition = { in: conditions }
    if (features?.length) where.features = { hasEvery: features }

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        include: {
          images: {
            orderBy: { order: 'asc' },
            select: { url: true, order: true },
          },
          likes: session?.user?.id ? {
            where: { userId: session.user.id },
            select: { id: true },
          } : false,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.car.count({ where }),
    ])

    const data = cars.map((car) => ({
      id: car.id,
      make: car.make,
      model: car.model,
      year: car.year,
      price: car.price,
      mileage: car.mileage,
      location: car.location,
      condition: car.condition,
      images: car.images,
      isLiked: Array.isArray(car.likes) && car.likes.length > 0,
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
    console.error('Cars fetch error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch cars' },
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

    const body = await request.json()
    
    const result = carSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { message: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { images, ...carData } = body

    const car = await prisma.car.create({
      data: {
        ...carData,
        userId: session.user.id,
        images: {
          create: images.map((url: string, index: number) => ({
            url,
            order: index,
          })),
        },
        priceHistory: {
          create: {
            price: carData.price,
          },
        },
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

    return NextResponse.json(car, { status: 201 })
  } catch (error) {
    console.error('Car creation error:', error)
    return NextResponse.json(
      { message: 'Failed to create listing' },
      { status: 500 }
    )
  }
}
