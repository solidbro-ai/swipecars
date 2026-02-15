import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { CarDetailClient } from './client'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await prisma.car.findUnique({
    where: { id: params.id },
    select: {
      make: true,
      model: true,
      year: true,
      price: true,
      images: { take: 1, orderBy: { order: 'asc' } },
    },
  })

  if (!car) {
    return {
      title: 'Car Not Found',
    }
  }

  const title = `${car.year} ${car.make} ${car.model}`
  const description = `Check out this ${car.year} ${car.make} ${car.model} for $${car.price.toLocaleString()} on SwipeCars.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: car.images[0] ? [car.images[0].url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: car.images[0] ? [car.images[0].url] : [],
    },
  }
}

export default async function CarDetailPage({ params }: Props) {
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
      priceHistory: {
        orderBy: { changedAt: 'desc' },
        take: 5,
      },
      _count: {
        select: { likes: true },
      },
    },
  })

  if (!car || car.status === 'DELETED') {
    notFound()
  }

  // Increment view count
  await prisma.car.update({
    where: { id: params.id },
    data: { viewCount: { increment: 1 } },
  })

  return <CarDetailClient car={car} />
}
