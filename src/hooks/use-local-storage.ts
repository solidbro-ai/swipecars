'use client'

import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Get from local storage then parse
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }, [initialValue, key])

  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Read from localStorage on mount
  useEffect(() => {
    setStoredValue(readValue())
  }, [readValue])

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}

export function useRecentlyViewed(maxItems = 20) {
  const [recentIds, setRecentIds] = useLocalStorage<string[]>('recentlyViewed', [])

  const addViewed = useCallback((carId: string) => {
    setRecentIds(prev => {
      const filtered = prev.filter(id => id !== carId)
      return [carId, ...filtered].slice(0, maxItems)
    })
  }, [setRecentIds, maxItems])

  const clearViewed = useCallback(() => {
    setRecentIds([])
  }, [setRecentIds])

  return { recentIds, addViewed, clearViewed }
}

export function useDarkMode() {
  const [isDark, setIsDark] = useLocalStorage('darkMode', false)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const toggle = useCallback(() => {
    setIsDark(prev => !prev)
  }, [setIsDark])

  return { isDark, setIsDark, toggle }
}
