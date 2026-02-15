'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  User,
  Car,
  Heart,
  MessageCircle,
  Settings,
  Edit,
  MapPin,
  Calendar,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { formatPrice, formatMileage, formatDate, getStatusLabel, getStatusColor, cn } from '@/lib/utils'

interface UserProfile {
  id: string
  name: string | null
  email: string | null
  image: string | null
  phone: string | null
  location: string | null
  bio: string | null
  contactPrefs: {
    email: boolean
    phone: boolean
    messages: boolean
  }
  createdAt: string
  _count: {
    cars: number
    likes: number
  }
}

interface CarListing {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  location: string
  status: string
  images: { url: string }[]
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [listings, setListings] = useState<CarListing[]>([])
  const [likedCars, setLikedCars] = useState<CarListing[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    bio: '',
    contactPrefs: {
      email: true,
      phone: false,
      messages: true,
    },
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/profile')
    }
  }, [status, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, listingsRes, likesRes] = await Promise.all([
          fetch('/api/users/me'),
          fetch('/api/users/me/listings'),
          fetch('/api/likes'),
        ])

        if (profileRes.ok) {
          const data = await profileRes.json()
          setProfile(data)
          setFormData({
            name: data.name || '',
            phone: data.phone || '',
            location: data.location || '',
            bio: data.bio || '',
            contactPrefs: data.contactPrefs || { email: true, phone: false, messages: true },
          })
        }

        if (listingsRes.ok) {
          const data = await listingsRes.json()
          setListings(data.data || [])
        }

        if (likesRes.ok) {
          const data = await likesRes.json()
          setLikedCars(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchData()
    }
  }, [session])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile((prev) => prev ? { ...prev, ...data } : null)
        setEditMode(false)
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been saved successfully.',
        })
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return <ProfileSkeleton />
  }

  if (!session?.user || !profile) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.image || ''} />
                <AvatarFallback className="text-2xl">
                  {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-muted-foreground">{profile.email}</p>
                {profile.location && (
                  <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground sm:justify-start">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </p>
                )}
                <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground sm:justify-start">
                  <Calendar className="h-4 w-4" />
                  Member since {formatDate(profile.createdAt)}
                </p>
              </div>
              <div className="flex gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{profile._count.cars}</p>
                  <p className="text-sm text-muted-foreground">Listings</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{profile._count.likes}</p>
                  <p className="text-sm text-muted-foreground">Liked</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="listings" className="gap-2">
              <Car className="h-4 w-4" />
              <span className="hidden sm:inline">Listings</span>
            </TabsTrigger>
            <TabsTrigger value="liked" className="gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Liked</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                {!editMode && (
                  <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {editMode ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, name: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, phone: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, location: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, bio: e.target.value }))
                        }
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} loading={saving}>
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setEditMode(false)}>
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p>{profile.name || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p>{profile.phone || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Location</p>
                      <p>{profile.location || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bio</p>
                      <p className="whitespace-pre-wrap">{profile.bio || 'No bio yet'}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Listings</CardTitle>
                <Link href="/cars/new">
                  <Button variant="gradient">Add Listing</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {listings.length === 0 ? (
                  <div className="py-12 text-center">
                    <Car className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 font-medium">No listings yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Start selling your car today!
                    </p>
                    <Link href="/cars/new">
                      <Button className="mt-4" variant="gradient">
                        Create Listing
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {listings.map((car) => (
                      <CarListItem key={car.id} car={car} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Liked Tab */}
          <TabsContent value="liked">
            <Card>
              <CardHeader>
                <CardTitle>Liked Cars</CardTitle>
              </CardHeader>
              <CardContent>
                {likedCars.length === 0 ? (
                  <div className="py-12 text-center">
                    <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 font-medium">No liked cars yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Start swiping to find cars you love!
                    </p>
                    <Link href="/browse">
                      <Button className="mt-4" variant="gradient">
                        Browse Cars
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {likedCars.map((car) => (
                      <CarCard key={car.id} car={car} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Contact Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via email
                    </p>
                  </div>
                  <Switch
                    checked={formData.contactPrefs.email}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        contactPrefs: { ...prev.contactPrefs, email: checked },
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Phone Number</p>
                    <p className="text-sm text-muted-foreground">
                      Display your phone on listings
                    </p>
                  </div>
                  <Switch
                    checked={formData.contactPrefs.phone}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        contactPrefs: { ...prev.contactPrefs, phone: checked },
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">In-App Messages</p>
                    <p className="text-sm text-muted-foreground">
                      Allow buyers to message you
                    </p>
                  </div>
                  <Switch
                    checked={formData.contactPrefs.messages}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        contactPrefs: { ...prev.contactPrefs, messages: checked },
                      }))
                    }
                  />
                </div>
                <Button onClick={handleSave} loading={saving}>
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function CarListItem({ car }: { car: CarListing }) {
  return (
    <Link href={`/cars/${car.id}`}>
      <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-secondary/50">
        <div className="relative h-20 w-28 overflow-hidden rounded-lg">
          {car.images[0] ? (
            <Image
              src={car.images[0].url}
              alt={`${car.make} ${car.model}`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Car className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">
            {car.year} {car.make} {car.model}
          </h3>
          <p className="text-lg font-bold text-primary">{formatPrice(car.price)}</p>
          <p className="text-sm text-muted-foreground">
            {formatMileage(car.mileage)} • {car.location}
          </p>
        </div>
        <Badge className={cn(getStatusColor(car.status), 'text-white')}>
          {getStatusLabel(car.status)}
        </Badge>
      </div>
    </Link>
  )
}

function CarCard({ car }: { car: CarListing }) {
  return (
    <Link href={`/cars/${car.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-video">
          {car.images[0] ? (
            <Image
              src={car.images[0].url}
              alt={`${car.make} ${car.model}`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Car className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold">
            {car.year} {car.make} {car.model}
          </h3>
          <p className="text-lg font-bold text-primary">{formatPrice(car.price)}</p>
          <p className="text-sm text-muted-foreground">
            {formatMileage(car.mileage)} • {car.location}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}

function ProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Skeleton className="h-12 w-full" />
        <Card className="mt-4">
          <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
