import { Car, CarImage, User, Message, MessageThread, Like, FilterPreset, PriceHistory } from '@prisma/client'

// Extended types with relations
export type CarWithImages = Car & {
  images: CarImage[]
}

export type CarWithDetails = Car & {
  images: CarImage[]
  user: Pick<User, 'id' | 'name' | 'image' | 'email' | 'phone' | 'location' | 'publicKey'>
  likes?: { id: string }[]
  _count?: {
    likes: number
  }
  priceHistory?: PriceHistory[]
}

export type CarCardData = {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  location: string
  condition: string
  images: { url: string; order: number }[]
  isLiked?: boolean
}

export type UserProfile = Pick<User, 'id' | 'name' | 'email' | 'image' | 'phone' | 'location' | 'bio' | 'publicKey' | 'createdAt'> & {
  contactPrefs: {
    email: boolean
    phone: boolean
    messages: boolean
  }
  _count?: {
    cars: number
    likes: number
  }
}

export type MessageThreadWithDetails = MessageThread & {
  car: CarWithImages & {
    user: Pick<User, 'id' | 'name' | 'image'>
  }
  participants: {
    user: Pick<User, 'id' | 'name' | 'image' | 'publicKey'>
    lastReadAt: Date
  }[]
  messages: (Message & {
    sender: Pick<User, 'id' | 'name' | 'image' | 'publicKey'>
  })[]
  _count: {
    messages: number
  }
}

export type MessageWithSender = Message & {
  sender: Pick<User, 'id' | 'name' | 'image' | 'publicKey'>
}

export type ThreadPreview = {
  id: string
  car: {
    id: string
    make: string
    model: string
    year: number
    images: { url: string }[]
  }
  otherUser: {
    id: string
    name: string | null
    image: string | null
  }
  lastMessage?: {
    content: string
    createdAt: Date
  }
  unreadCount: number
}

export type FilterPresetWithFilters = FilterPreset & {
  filters: CarFilters
}

export interface CarFilters {
  yearMin?: number
  yearMax?: number
  priceMin?: number
  priceMax?: number
  mileageMin?: number
  mileageMax?: number
  makes?: string[]
  models?: string[]
  conditions?: string[]
  features?: string[]
  location?: string
  distance?: number
}

export interface SwipeAction {
  carId: string
  action: 'like' | 'pass'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
  }
}
