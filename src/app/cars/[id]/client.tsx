'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Gauge,
  Calendar,
  Heart,
  MessageCircle,
  Share2,
  Flag,
  Check,
  Eye,
  TrendingDown,
  Edit,
  Car,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { CarWithDetails } from '@/types'
import {
  formatPrice,
  formatMileage,
  formatDate,
  getConditionLabel,
  getConditionColor,
  cn,
} from '@/lib/utils'

interface CarDetailClientProps {
  car: CarWithDetails
}

export function CarDetailClient({ car }: CarDetailClientProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [liking, setLiking] = useState(false)

  const isOwner = session?.user?.id === car.userId

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % car.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + car.images.length) % car.images.length)
  }

  const handleLike = async () => {
    if (!session) {
      router.push('/login?callbackUrl=' + encodeURIComponent(`/cars/${car.id}`))
      return
    }

    setLiking(true)
    try {
      if (isLiked) {
        await fetch(`/api/likes?carId=${car.id}`, { method: 'DELETE' })
        setIsLiked(false)
        toast({ title: 'Removed from likes' })
      } else {
        await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ carId: car.id }),
        })
        setIsLiked(true)
        toast({ title: 'Added to likes!' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' })
    } finally {
      setLiking(false)
    }
  }

  const handleMessage = async () => {
    if (!session) {
      router.push('/login?callbackUrl=' + encodeURIComponent(`/cars/${car.id}`))
      return
    }

    try {
      const response = await fetch('/api/messages/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId: car.id,
          sellerId: car.userId,
        }),
      })

      if (response.ok) {
        const thread = await response.json()
        router.push(`/messages/${thread.id}`)
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to start conversation', variant: 'destructive' })
    }
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${car.year} ${car.make} ${car.model}`,
        text: `Check out this ${car.year} ${car.make} ${car.model} for ${formatPrice(car.price)}`,
        url: window.location.href,
      })
    } catch {
      await navigator.clipboard.writeText(window.location.href)
      toast({ title: 'Link copied to clipboard!' })
    }
  }

  // Check for price drop
  const priceDropped = car.priceHistory && car.priceHistory.length > 1 &&
    car.priceHistory[0].price < car.priceHistory[1].price
  const priceDrop = priceDropped
    ? car.priceHistory![1].price - car.priceHistory![0].price
    : 0

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Image Gallery */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted md:aspect-[21/9]">
        {car.images.length > 0 ? (
          <Image
            src={car.images[currentImageIndex].url}
            alt={`${car.make} ${car.model}`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Car className="h-24 w-24 text-muted-foreground" />
          </div>
        )}

        {/* Navigation */}
        {car.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur-sm transition hover:bg-black/60"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur-sm transition hover:bg-black/60"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {car.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    idx === currentImageIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
                  )}
                />
              ))}
            </div>
          </>
        )}

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute left-4 top-4 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Actions */}
        <div className="absolute right-4 top-4 flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-white/80 backdrop-blur-sm"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Thumbnails */}
      {car.images.length > 1 && (
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-4">
            {car.images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setCurrentImageIndex(idx)}
                className={cn(
                  'relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition',
                  idx === currentImageIndex ? 'border-primary' : 'border-transparent opacity-60'
                )}
              >
                <Image src={img.url} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">
                    {car.year} {car.make} {car.model}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <Badge className={cn(getConditionColor(car.condition), 'text-white')}>
                      {getConditionLabel(car.condition)}
                    </Badge>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      {car.viewCount} views
                    </span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      {car._count?.likes || 0} likes
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-primary">{formatPrice(car.price)}</p>
                  {priceDropped && (
                    <p className="flex items-center justify-end gap-1 text-sm text-green-600">
                      <TrendingDown className="h-4 w-4" />
                      Price dropped {formatPrice(priceDrop)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <Card className="mb-6">
              <CardContent className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
                <div className="text-center">
                  <Gauge className="mx-auto h-6 w-6 text-muted-foreground" />
                  <p className="mt-1 font-semibold">{formatMileage(car.mileage)}</p>
                  <p className="text-xs text-muted-foreground">Mileage</p>
                </div>
                <div className="text-center">
                  <Calendar className="mx-auto h-6 w-6 text-muted-foreground" />
                  <p className="mt-1 font-semibold">{car.year}</p>
                  <p className="text-xs text-muted-foreground">Year</p>
                </div>
                <div className="text-center">
                  <MapPin className="mx-auto h-6 w-6 text-muted-foreground" />
                  <p className="mt-1 font-semibold">{car.location}</p>
                  <p className="text-xs text-muted-foreground">Location</p>
                </div>
                <div className="text-center">
                  <Car className="mx-auto h-6 w-6 text-muted-foreground" />
                  <p className="mt-1 font-semibold">{getConditionLabel(car.condition)}</p>
                  <p className="text-xs text-muted-foreground">Condition</p>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground">{car.description}</p>
              </CardContent>
            </Card>

            {/* Features */}
            {car.features.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {car.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="gap-1">
                        <Check className="h-3 w-3" />
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Card */}
            <Card>
              <CardHeader>
                <CardTitle>Seller</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={car.user.image || ''} />
                    <AvatarFallback className="text-lg">
                      {car.user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{car.user.name}</p>
                    {car.user.location && (
                      <p className="text-sm text-muted-foreground">{car.user.location}</p>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                {isOwner ? (
                  <div className="space-y-3">
                    <Link href={`/cars/${car.id}/edit`}>
                      <Button className="w-full gap-2">
                        <Edit className="h-4 w-4" />
                        Edit Listing
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      className="w-full gap-2"
                      variant={isLiked ? 'secondary' : 'like'}
                      onClick={handleLike}
                      loading={liking}
                    >
                      <Heart className={cn('h-5 w-5', isLiked && 'fill-current')} />
                      {isLiked ? 'Liked' : 'Like'}
                    </Button>
                    <Button
                      className="w-full gap-2"
                      variant="gradient"
                      onClick={handleMessage}
                    >
                      <MessageCircle className="h-5 w-5" />
                      Message Seller
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full gap-2 text-muted-foreground"
                      onClick={() => router.push(`/report?carId=${car.id}`)}
                    >
                      <Flag className="h-4 w-4" />
                      Report Listing
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Listing Info */}
            <Card>
              <CardContent className="space-y-2 pt-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Listed</span>
                  <span>{formatDate(car.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{formatDate(car.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID</span>
                  <span className="font-mono text-xs">{car.id.slice(0, 8)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
