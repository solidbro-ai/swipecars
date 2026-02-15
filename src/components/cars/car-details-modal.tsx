'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
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
  User,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { CarWithDetails } from '@/types'
import {
  formatPrice,
  formatMileage,
  formatDate,
  getConditionLabel,
  getConditionColor,
  cn,
} from '@/lib/utils'

interface CarDetailsModalProps {
  car: CarWithDetails | null
  open: boolean
  onClose: () => void
  onLike?: () => void
  onMessage?: () => void
  isLiked?: boolean
}

export function CarDetailsModal({
  car,
  open,
  onClose,
  onLike,
  onMessage,
  isLiked = false,
}: CarDetailsModalProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageFullscreen, setImageFullscreen] = useState(false)

  if (!car) return null

  const isOwner = session?.user?.id === car.userId

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % car.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + car.images.length) % car.images.length)
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${car.year} ${car.make} ${car.model}`,
        text: `Check out this ${car.year} ${car.make} ${car.model} for ${formatPrice(car.price)}`,
        url: `${window.location.origin}/cars/${car.id}`,
      })
    } catch {
      navigator.clipboard.writeText(`${window.location.origin}/cars/${car.id}`)
    }
  }

  const handleReport = () => {
    router.push(`/report?carId=${car.id}`)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0">
          {/* Image Gallery */}
          <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl bg-muted">
            {car.images.length > 0 ? (
              <Image
                src={car.images[currentImageIndex]?.url}
                alt={`${car.make} ${car.model}`}
                fill
                className="cursor-pointer object-cover"
                onClick={() => setImageFullscreen(true)}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-muted-foreground">No images available</span>
              </div>
            )}

            {/* Navigation */}
            {car.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {car.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={cn(
                        'h-2 rounded-full transition-all',
                        idx === currentImageIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'
                      )}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Thumbnails */}
            {car.images.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 flex gap-1 overflow-x-auto bg-black/30 p-2 backdrop-blur-sm">
                {car.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={cn(
                      'relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition',
                      idx === currentImageIndex ? 'border-white' : 'border-transparent opacity-60'
                    )}
                  >
                    <Image
                      src={img.url}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {car.year} {car.make} {car.model}
                </h2>
                <p className="text-3xl font-bold text-primary">
                  {formatPrice(car.price)}
                </p>
              </div>
              <Badge className={cn(getConditionColor(car.condition), 'text-white')}>
                {getConditionLabel(car.condition)}
              </Badge>
            </div>

            {/* Quick Stats */}
            <div className="mb-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Gauge className="h-5 w-5" />
                <span>{formatMileage(car.mileage)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span>{car.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-5 w-5" />
                <span>Listed {formatDate(car.createdAt)}</span>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Description */}
            <div className="mb-6">
              <h3 className="mb-2 font-semibold">Description</h3>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {car.description}
              </p>
            </div>

            {/* Features */}
            {car.features.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 font-semibold">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {car.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="gap-1">
                      <Check className="h-3 w-3" />
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-4" />

            {/* Seller Info */}
            <div className="mb-6">
              <h3 className="mb-3 font-semibold">Seller</h3>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={car.user.image || ''} />
                  <AvatarFallback>
                    {car.user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{car.user.name}</p>
                  {car.user.location && (
                    <p className="text-sm text-muted-foreground">{car.user.location}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row">
              {!isOwner && onLike && (
                <Button
                  variant={isLiked ? 'secondary' : 'like'}
                  className="flex-1 gap-2"
                  onClick={onLike}
                >
                  <Heart className={cn('h-5 w-5', isLiked && 'fill-current')} />
                  {isLiked ? 'Liked' : 'Like'}
                </Button>
              )}
              {!isOwner && onMessage && session && (
                <Button variant="gradient" className="flex-1 gap-2" onClick={onMessage}>
                  <MessageCircle className="h-5 w-5" />
                  Message Seller
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
              {!isOwner && (
                <Button variant="ghost" size="icon" onClick={handleReport}>
                  <Flag className="h-5 w-5" />
                </Button>
              )}
            </div>

            {isOwner && (
              <div className="mt-4 flex gap-3">
                <Link href={`/cars/${car.id}/edit`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Edit Listing
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Image Viewer */}
      <AnimatePresence>
        {imageFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
            onClick={() => setImageFullscreen(false)}
          >
            <button
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              onClick={() => setImageFullscreen(false)}
            >
              <X className="h-6 w-6" />
            </button>
            {car.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}
            <Image
              src={car.images[currentImageIndex]?.url}
              alt={`${car.make} ${car.model}`}
              fill
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
              {currentImageIndex + 1} / {car.images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
