'use client'

import { useState, useCallback, useEffect } from 'react'
import { CarCardData, CarFilters, PaginatedResponse } from '@/types'

interface UseCarsOptions {
  initialFilters?: CarFilters
  excludeIds?: string[]
  limit?: number
}

export function useCars(options: UseCarsOptions = {}) {
  const { initialFilters = {}, excludeIds = [], limit = 10 } = options
  const [cars, setCars] = useState<CarCardData[]>([])
  const [filters, setFilters] = useState<CarFilters>(initialFilters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)

  const fetchCars = useCallback(async (pageNum: number, reset = false) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.set('page', pageNum.toString())
      params.set('limit', limit.toString())
      
      if (excludeIds.length > 0) {
        params.set('excludeIds', excludeIds.join(','))
      }

      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value) && value.length > 0) {
            params.set(key, value.join(','))
          } else if (!Array.isArray(value)) {
            params.set(key, String(value))
          }
        }
      })

      const response = await fetch(`/api/cars?${params.toString()}`)
      const result: PaginatedResponse<CarCardData> = await response.json()

      if (!response.ok) {
        throw new Error('Failed to fetch cars')
      }

      setCars(prev => reset ? result.data : [...prev, ...result.data])
      setHasMore(result.pagination.hasMore)
      setTotal(result.pagination.total)
      setPage(pageNum)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [filters, excludeIds, limit])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchCars(page + 1)
    }
  }, [fetchCars, loading, hasMore, page])

  const refresh = useCallback(() => {
    fetchCars(1, true)
  }, [fetchCars])

  const updateFilters = useCallback((newFilters: Partial<CarFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({})
  }, [])

  useEffect(() => {
    fetchCars(1, true)
  }, [filters]) // Re-fetch when filters change

  return {
    cars,
    loading,
    error,
    hasMore,
    total,
    page,
    filters,
    loadMore,
    refresh,
    updateFilters,
    resetFilters,
    setFilters,
  }
}

export function useSwipeCars(options: UseCarsOptions = {}) {
  const [passedIds, setPassedIds] = useState<Set<string>>(new Set())
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  
  const { cars, loading, error, hasMore, loadMore, refresh, filters, setFilters, ...rest } = useCars({
    ...options,
    excludeIds: [...passedIds, ...likedIds],
  })

  const handleSwipe = useCallback(async (carId: string, action: 'like' | 'pass') => {
    try {
      if (action === 'like') {
        setLikedIds(prev => new Set([...prev, carId]))
        
        // Save like to server
        await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ carId }),
        })
      } else {
        setPassedIds(prev => new Set([...prev, carId]))
      }
    } catch (err) {
      console.error('Swipe action failed:', err)
    }
  }, [])

  const undoSwipe = useCallback((carId: string) => {
    setLikedIds(prev => {
      const next = new Set(prev)
      next.delete(carId)
      return next
    })
    setPassedIds(prev => {
      const next = new Set(prev)
      next.delete(carId)
      return next
    })
  }, [])

  const resetSwipes = useCallback(() => {
    setPassedIds(new Set())
    setLikedIds(new Set())
    refresh()
  }, [refresh])

  // Auto-load more when running low
  useEffect(() => {
    if (cars.length < 3 && hasMore && !loading) {
      loadMore()
    }
  }, [cars.length, hasMore, loading, loadMore])

  return {
    cars,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    filters,
    setFilters,
    handleSwipe,
    undoSwipe,
    resetSwipes,
    likedIds,
    passedIds,
    ...rest,
  }
}
