'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import {
  MapPin,
  Gauge,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  X,
  Info,
  Share2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CarCardData } from '@/types'
import { formatPrice, formatMileage, getConditionLabel, getConditionColor, cn } from '@/lib/utils'

interface SwipeCardProps {
  car: CarCardData
  onSwipe: (direction: 'left' | 'right') => void
  onInfo: () => void
  isTop?: boolean
}

export function SwipeCard({ car, onSwipe, onInfo, isTop = false }: SwipeCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null)

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-300, 0, 300], [-25, 0, 25])
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0])
  
  // Like/Nope indicators
  const likeOpacity = useTransform(x, [0, 100, 200], [0, 0.5, 1])
  const nopeOpacity = useTransform(x, [-200, -100, 0], [1, 0.5, 0])

  const handleDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      const swipeThreshold = 150
      const velocity = info.velocity.x

      if (info.offset.x > swipeThreshold || velocity > 500) {
        setExitDirection('right')
        onSwipe('right')
      } else if (info.offset.x < -swipeThreshold || velocity < -500) {
        setExitDirection('left')
        onSwipe('left')
      }
    },
    [onSwipe]
  )

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % car.images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + car.images.length) % car.images.length)
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.share({
        title: `${car.year} ${car.make} ${car.model}`,
        text: `Check out this ${car.year} ${car.make} ${car.model} for ${formatPrice(car.price)}`,
        url: `${window.location.origin}/cars/${car.id}`,
      })
    } catch (err) {
      // Fallback to copying link
      navigator.clipboard.writeText(`${window.location.origin}/cars/${car.id}`)
    }
  }

  return (
    <motion.div
      className={cn(
        'absolute w-full max-w-md aspect-[3/4] cursor-grab active:cursor-grabbing',
        !isTop && 'pointer-events-none'
      )}
      style={{ x, rotate, opacity }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      animate={
        exitDirection
          ? {
              x: exitDirection === 'right' ? 500 : -500,
              opacity: 0,
              transition: { duration: 0.3 },
            }
          : {}
      }
    >
      <div className="relative h-full w-full overflow-hidden rounded-3xl bg-card shadow-2xl">
        {/* Image Gallery */}
        <div className="relative h-[65%] w-full overflow-hidden">
          {car.images.length > 0 ? (
            <Image
              src={car.images[currentImageIndex]?.url || '/placeholder-car.jpg'}
              alt={`${car.make} ${car.model}`}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}

          {/* Image navigation dots */}
          {car.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              {car.images.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    idx === currentImageIndex
                      ? 'w-6 bg-white'
                      : 'w-1.5 bg-white/50'
                  )}
                />
              ))}
            </div>
          )}

          {/* Image navigation arrows */}
          {car.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Top actions */}
          <div className="absolute right-3 top-3 flex gap-2">
            <Button
              size="icon-sm"
              variant="secondary"
              className="rounded-full bg-white/80 backdrop-blur-sm"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Like/Nope indicators */}
          <motion.div
            className="absolute left-6 top-6 rounded-lg border-4 border-green-500 px-4 py-2 font-bold text-green-500"
            style={{ opacity: likeOpacity, rotate: -15 }}
          >
            LIKE
          </motion.div>
          <motion.div
            className="absolute right-6 top-6 rounded-lg border-4 border-red-500 px-4 py-2 font-bold text-red-500"
            style={{ opacity: nopeOpacity, rotate: 15 }}
          >
            NOPE
          </motion.div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Car Info */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {car.year} {car.make} {car.model}
              </h2>
              <p className="text-3xl font-bold text-white">
                {formatPrice(car.price)}
              </p>
            </div>
            <Badge className={cn(getConditionColor(car.condition), 'text-white')}>
              {getConditionLabel(car.condition)}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-white/90">
            <div className="flex items-center gap-1">
              <Gauge className="h-4 w-4" />
              {formatMileage(car.mileage)}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {car.location}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface SwipeActionsProps {
  onPass: () => void
  onLike: () => void
  onInfo: () => void
  disabled?: boolean
}

export function SwipeActions({ onPass, onLike, onInfo, disabled }: SwipeActionsProps) {
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <Button
        variant="pass"
        size="icon-xl"
        className="rounded-full shadow-lg transition-transform hover:scale-110"
        onClick={onPass}
        disabled={disabled}
      >
        <X className="h-8 w-8" />
      </Button>

      <Button
        variant="outline"
        size="icon-lg"
        className="rounded-full shadow-lg transition-transform hover:scale-105"
        onClick={onInfo}
        disabled={disabled}
      >
        <Info className="h-6 w-6" />
      </Button>

      <Button
        variant="like"
        size="icon-xl"
        className="rounded-full shadow-lg transition-transform hover:scale-110"
        onClick={onLike}
        disabled={disabled}
      >
        <Heart className="h-8 w-8" />
      </Button>
    </div>
  )
}
