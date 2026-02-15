'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Sparkles, Filter } from 'lucide-react'
import { SwipeCard, SwipeActions } from '@/components/cars/swipe-card'
import { CarDetailsModal } from '@/components/cars/car-details-modal'
import { FilterPanel } from '@/components/cars/filter-panel'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSwipeCars } from '@/hooks/use-cars'
import { useRecentlyViewed } from '@/hooks/use-local-storage'
import { CarCardData, CarWithDetails, CarFilters } from '@/types'

export default function BrowsePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [selectedCar, setSelectedCar] = useState<CarWithDetails | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const { addViewed } = useRecentlyViewed()

  const {
    cars,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    filters,
    setFilters,
    handleSwipe,
    resetSwipes,
    likedIds,
  } = useSwipeCars({ limit: 10 })

  const currentCar = cars[0] as CarCardData | undefined
  const nextCar = cars[1] as CarCardData | undefined

  const handleSwipeAction = useCallback(
    async (direction: 'left' | 'right') => {
      if (!currentCar) return
      
      handleSwipe(currentCar.id, direction === 'right' ? 'like' : 'pass')
      addViewed(currentCar.id)
    },
    [currentCar, handleSwipe, addViewed]
  )

  const handleInfo = useCallback(async () => {
    if (!currentCar) return
    
    try {
      const response = await fetch(`/api/cars/${currentCar.id}`)
      if (response.ok) {
        const car = await response.json()
        setSelectedCar(car)
        setDetailsOpen(true)
      }
    } catch (error) {
      console.error('Failed to fetch car details:', error)
    }
  }, [currentCar])

  const handleLike = useCallback(async () => {
    if (!selectedCar) return
    
    handleSwipe(selectedCar.id, 'like')
    setDetailsOpen(false)
  }, [selectedCar, handleSwipe])

  const handleMessage = useCallback(async () => {
    if (!selectedCar || !session) return
    
    // Create or get existing thread and navigate to messages
    try {
      const response = await fetch('/api/messages/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId: selectedCar.id,
          sellerId: selectedCar.userId,
        }),
      })
      
      if (response.ok) {
        const thread = await response.json()
        router.push(`/messages/${thread.id}`)
      }
    } catch (error) {
      console.error('Failed to create thread:', error)
    }
  }, [selectedCar, session, router])

  const handleFilterChange = useCallback((newFilters: CarFilters) => {
    setFilters(newFilters)
    resetSwipes()
  }, [setFilters, resetSwipes])

  if (loading && cars.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-8">
        <div className="relative h-[500px] w-full max-w-md">
          <Skeleton className="absolute inset-0 rounded-3xl" />
        </div>
        <div className="mt-8 flex gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-16 w-16 rounded-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-8 text-center">
        <p className="text-lg text-destructive">Something went wrong</p>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <Button className="mt-4" onClick={refresh}>
          Try Again
        </Button>
      </div>
    )
  }

  if (cars.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-8 text-center">
        <Sparkles className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">No More Cars</h2>
        <p className="mt-2 text-muted-foreground">
          You've seen all available cars matching your criteria.
        </p>
        <div className="mt-6 flex gap-4">
          <FilterPanel
            filters={filters}
            onChange={handleFilterChange}
            onReset={() => handleFilterChange({})}
          />
          <Button onClick={resetSwipes} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Start Over
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center px-4 py-8">
      {/* Filters */}
      <div className="mb-6 flex w-full max-w-md items-center justify-between">
        <h1 className="text-2xl font-bold">Find Your Car</h1>
        <FilterPanel
          filters={filters}
          onChange={handleFilterChange}
          onReset={() => handleFilterChange({})}
        />
      </div>

      {/* Card Stack */}
      <div className="relative h-[500px] w-full max-w-md">
        <AnimatePresence>
          {/* Next card (background) */}
          {nextCar && (
            <motion.div
              key={nextCar.id + '-next'}
              initial={{ scale: 0.95, opacity: 0.5 }}
              animate={{ scale: 0.95, opacity: 0.5 }}
              className="absolute inset-0"
            >
              <SwipeCard
                car={nextCar}
                onSwipe={() => {}}
                onInfo={() => {}}
                isTop={false}
              />
            </motion.div>
          )}

          {/* Current card (top) */}
          {currentCar && (
            <SwipeCard
              key={currentCar.id}
              car={currentCar}
              onSwipe={handleSwipeAction}
              onInfo={handleInfo}
              isTop={true}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Swipe Actions */}
      <SwipeActions
        onPass={() => handleSwipeAction('left')}
        onLike={() => handleSwipeAction('right')}
        onInfo={handleInfo}
        disabled={!currentCar}
      />

      {/* Loading more indicator */}
      {loading && (
        <p className="mt-4 text-sm text-muted-foreground">Loading more cars...</p>
      )}

      {/* Car Details Modal */}
      <CarDetailsModal
        car={selectedCar}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onLike={handleLike}
        onMessage={handleMessage}
        isLiked={selectedCar ? likedIds.has(selectedCar.id) : false}
      />
    </div>
  )
}
