import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Header } from '@/components/layout/header'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'SwipeCars - Find Your Dream Car',
    template: '%s | SwipeCars',
  },
  description: 'Discover and buy cars the fun way. Swipe right on cars you love, connect with sellers, and drive away happy.',
  keywords: ['cars', 'car marketplace', 'buy cars', 'sell cars', 'car listings', 'auto marketplace'],
  authors: [{ name: 'SwipeCars' }],
  creator: 'SwipeCars',
  publisher: 'SwipeCars',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'SwipeCars - Find Your Dream Car',
    description: 'Discover and buy cars the fun way. Swipe right on cars you love.',
    siteName: 'SwipeCars',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SwipeCars - Find Your Dream Car',
    description: 'Discover and buy cars the fun way. Swipe right on cars you love.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
