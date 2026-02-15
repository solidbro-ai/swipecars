import Link from 'next/link'
import Image from 'next/image'
import { Car, Heart, MessageCircle, Shield, Zap, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: Zap,
    title: 'Swipe to Discover',
    description: 'Browse cars like never before. Swipe right on cars you love, left on those you don\'t.',
  },
  {
    icon: Shield,
    title: 'Secure Messaging',
    description: 'End-to-end encrypted messaging keeps your conversations private and secure.',
  },
  {
    icon: Heart,
    title: 'Save Favorites',
    description: 'Like cars to save them for later. Get notified when prices drop on your favorites.',
  },
  {
    icon: Sparkles,
    title: 'Smart Filters',
    description: 'Find exactly what you\'re looking for with advanced filters and saved presets.',
  },
]

const stats = [
  { value: '10K+', label: 'Active Listings' },
  { value: '50K+', label: 'Happy Buyers' },
  { value: '4.9', label: 'App Rating' },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center text-white">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Find Your Dream Car
              <span className="block text-blue-200">The Fun Way</span>
            </h1>
            <p className="mt-6 text-lg text-blue-100 md:text-xl">
              Swipe through thousands of cars, connect with sellers instantly,
              and drive away in your perfect match. Car shopping, reimagined.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/browse">
                <Button size="xl" className="w-full bg-white text-blue-600 hover:bg-blue-50 sm:w-auto">
                  Start Swiping
                </Button>
              </Link>
              <Link href="/cars/new">
                <Button size="xl" variant="outline" className="w-full border-white text-white hover:bg-white/10 sm:w-auto">
                  Sell Your Car
                </Button>
              </Link>
            </div>
          </div>

          {/* Floating car cards preview */}
          <div className="relative mt-16 hidden md:block">
            <div className="mx-auto flex max-w-lg justify-center">
              <div className="relative">
                {/* Background cards */}
                <div className="absolute -left-8 -top-4 h-80 w-64 rotate-[-8deg] rounded-3xl bg-white/10 backdrop-blur-sm" />
                <div className="absolute -right-8 -top-4 h-80 w-64 rotate-[8deg] rounded-3xl bg-white/10 backdrop-blur-sm" />
                
                {/* Main card */}
                <div className="relative h-80 w-64 rounded-3xl bg-white shadow-2xl">
                  <div className="absolute inset-0 overflow-hidden rounded-3xl">
                    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300" />
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900">2024 Tesla Model 3</h3>
                      <p className="text-xl font-bold text-blue-600">$42,990</p>
                      <div className="mt-2 flex gap-4 text-sm text-gray-500">
                        <span>15K mi</span>
                        <span>Electric</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b bg-white py-12 dark:bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why SwipeCars?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We've reimagined car shopping to be faster, more fun, and completely secure.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <Card key={idx} className="group relative overflow-hidden transition-all hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-secondary/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Finding your perfect car is as easy as 1-2-3.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Browse & Swipe',
                description: 'Set your preferences and start swiping through cars that match your criteria.',
              },
              {
                step: '2',
                title: 'Connect',
                description: 'Message sellers directly with our secure, encrypted messaging system.',
              },
              {
                step: '3',
                title: 'Drive Away',
                description: 'Meet up, inspect the car, and drive away in your new ride!',
              },
            ].map((item, idx) => (
              <div key={idx} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-6 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-16 text-center text-white md:px-16">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Find Your Perfect Car?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
                Join thousands of happy car buyers who found their dream ride on SwipeCars.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/register">
                  <Button size="xl" className="bg-white text-blue-600 hover:bg-blue-50">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-hero-gradient">
                <Car className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">SwipeCars</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SwipeCars. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
