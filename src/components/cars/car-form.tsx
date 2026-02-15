'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
  Upload,
  X,
  Loader2,
  GripVertical,
  Plus,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import {
  CAR_MAKES,
  CAR_MODELS,
  CAR_CONDITIONS,
  CAR_FEATURES,
  YEAR_MIN,
  YEAR_MAX,
} from '@/lib/constants'
import { CarInput } from '@/lib/validations'
import { compressImage, cn } from '@/lib/utils'

interface ImageFile {
  id: string
  file?: File
  url: string
  uploading?: boolean
}

interface CarFormProps {
  initialData?: Partial<CarInput> & { images?: { url: string }[] }
  carId?: string
  mode: 'create' | 'edit'
}

export function CarForm({ initialData, carId, mode }: CarFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<ImageFile[]>(
    initialData?.images?.map((img, idx) => ({
      id: `existing-${idx}`,
      url: img.url,
    })) || []
  )

  const [formData, setFormData] = useState<Partial<CarInput>>({
    make: initialData?.make || '',
    model: initialData?.model || '',
    year: initialData?.year || new Date().getFullYear(),
    price: initialData?.price || 0,
    mileage: initialData?.mileage || 0,
    location: initialData?.location || '',
    description: initialData?.description || '',
    condition: initialData?.condition || 'GOOD',
    features: initialData?.features || [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const availableModels = formData.make ? CAR_MODELS[formData.make] || [] : []

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newImages: ImageFile[] = []

    for (const file of acceptedFiles) {
      const id = `new-${Date.now()}-${Math.random()}`
      const compressed = await compressImage(file)
      const url = URL.createObjectURL(compressed)
      
      newImages.push({
        id,
        file: new File([compressed], file.name, { type: 'image/jpeg' }),
        url,
      })
    }

    setImages((prev) => [...prev, ...newImages])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024,
  })

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.make) newErrors.make = 'Make is required'
    if (!formData.model) newErrors.model = 'Model is required'
    if (!formData.year) newErrors.year = 'Year is required'
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required'
    if (formData.mileage === undefined || formData.mileage < 0)
      newErrors.mileage = 'Valid mileage is required'
    if (!formData.location) newErrors.location = 'Location is required'
    if (!formData.description || formData.description.length < 20)
      newErrors.description = 'Description must be at least 20 characters'
    if (images.length === 0) newErrors.images = 'At least one image is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = []

    for (const image of images) {
      if (image.file) {
        const formData = new FormData()
        formData.append('file', image.file)

        const response = await fetch('/api/uploads', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Failed to upload image')
        }

        const { url } = await response.json()
        uploadedUrls.push(url)
      } else {
        uploadedUrls.push(image.url)
      }
    }

    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors below',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      // Upload images first
      const imageUrls = await uploadImages()

      const endpoint = mode === 'create' ? '/api/cars' : `/api/cars/${carId}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images: imageUrls,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save listing')
      }

      const car = await response.json()

      toast({
        title: mode === 'create' ? 'Listing Created!' : 'Listing Updated!',
        description: 'Your car listing has been saved successfully.',
      })

      router.push(`/cars/${car.id}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features?.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...(prev.features || []), feature],
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 font-medium">
              {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              or click to select (max 10 images, 10MB each)
            </p>
          </div>

          {errors.images && (
            <p className="mt-2 text-sm text-destructive">{errors.images}</p>
          )}

          {images.length > 0 && (
            <Reorder.Group
              axis="x"
              values={images}
              onReorder={setImages}
              className="mt-4 flex flex-wrap gap-3"
            >
              {images.map((image) => (
                <Reorder.Item
                  key={image.id}
                  value={image}
                  className="relative h-24 w-24 cursor-grab overflow-hidden rounded-lg border active:cursor-grabbing"
                >
                  <Image
                    src={image.url}
                    alt="Car"
                    fill
                    className="object-cover"
                  />
                  {image.uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="absolute bottom-1 left-1 rounded bg-black/50 p-0.5">
                    <GripVertical className="h-3 w-3 text-white" />
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="make">Make *</Label>
              <Select
                value={formData.make}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, make: value, model: '' }))
                }
              >
                <SelectTrigger className={errors.make ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select make" />
                </SelectTrigger>
                <SelectContent>
                  {CAR_MAKES.map((make) => (
                    <SelectItem key={make} value={make}>
                      {make}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.make && (
                <p className="mt-1 text-sm text-destructive">{errors.make}</p>
              )}
            </div>

            <div>
              <Label htmlFor="model">Model *</Label>
              <Select
                value={formData.model}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, model: value }))
                }
                disabled={!formData.make}
              >
                <SelectTrigger className={errors.model ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.model && (
                <p className="mt-1 text-sm text-destructive">{errors.model}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="year">Year *</Label>
              <Select
                value={formData.year?.toString()}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, year: Number(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => YEAR_MAX - i).map(
                    (year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))
                }
                error={errors.price}
              />
            </div>

            <div>
              <Label htmlFor="mileage">Mileage *</Label>
              <Input
                id="mileage"
                type="number"
                value={formData.mileage || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, mileage: Number(e.target.value) }))
                }
                error={errors.mileage}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="City, State"
                value={formData.location || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                error={errors.location}
              />
            </div>

            <div>
              <Label htmlFor="condition">Condition *</Label>
              <Select
                value={formData.condition}
                onValueChange={(value: any) =>
                  setFormData((prev) => ({ ...prev, condition: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {CAR_CONDITIONS.map((condition) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Tell buyers about your car..."
              value={formData.description || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              error={errors.description}
              className="min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {CAR_FEATURES.map((feature) => (
              <label
                key={feature}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-secondary',
                  formData.features?.includes(feature) && 'border-primary bg-primary/5'
                )}
              >
                <Checkbox
                  checked={formData.features?.includes(feature)}
                  onCheckedChange={() => toggleFeature(feature)}
                />
                <span className="text-sm">{feature}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" variant="gradient" className="flex-1" loading={loading}>
          {mode === 'create' ? 'Create Listing' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
