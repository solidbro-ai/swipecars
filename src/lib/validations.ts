import { z } from 'zod'
import { CAR_MAKES, CAR_CONDITIONS, CAR_FEATURES } from './constants'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  contactPrefs: z.object({
    email: z.boolean(),
    phone: z.boolean(),
    messages: z.boolean(),
  }).optional(),
})

export const carSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number()
    .int()
    .min(1900, 'Year must be 1900 or later')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  price: z.number()
    .positive('Price must be positive')
    .max(10000000, 'Price seems too high'),
  mileage: z.number()
    .int()
    .min(0, 'Mileage cannot be negative')
    .max(1000000, 'Mileage seems too high'),
  location: z.string().min(1, 'Location is required'),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description must be less than 5000 characters'),
  condition: z.enum(['NEW', 'LIKE_NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR']),
  features: z.array(z.string()),
  status: z.enum(['ACTIVE', 'PENDING', 'SOLD', 'DELETED']).optional(),
})

export const carFiltersSchema = z.object({
  yearMin: z.number().optional(),
  yearMax: z.number().optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  mileageMin: z.number().optional(),
  mileageMax: z.number().optional(),
  makes: z.array(z.string()).optional(),
  models: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  location: z.string().optional(),
  distance: z.number().optional(),
})

export const filterPresetSchema = z.object({
  name: z.string().min(1, 'Preset name is required').max(50, 'Name too long'),
  filters: carFiltersSchema,
})

export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
  threadId: z.string().cuid(),
  receiverId: z.string().cuid(),
})

export const reportSchema = z.object({
  carId: z.string().cuid().optional(),
  reportedUserId: z.string().cuid().optional(),
  reason: z.enum(['SPAM', 'SCAM', 'INAPPROPRIATE', 'WRONG_INFO', 'DUPLICATE', 'OTHER']),
  description: z.string().max(1000, 'Description too long').optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type CarInput = z.infer<typeof carSchema>
export type CarFiltersInput = z.infer<typeof carFiltersSchema>
export type FilterPresetInput = z.infer<typeof filterPresetSchema>
export type MessageInput = z.infer<typeof messageSchema>
export type ReportInput = z.infer<typeof reportSchema>
