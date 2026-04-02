import type { Metadata, Viewport } from 'next'
import './globals.css'
import Providers from '@/components/Providers'
import Navbar from '@/components/Navbar'
import PWARegister from '@/components/PWARegister'

export const metadata: Metadata = {
  title: 'VIT Grocery – Fresh Groceries Delivered in 30 Minutes',
  description: 'Order fresh fruits, vegetables, dairy, and more from VIT Grocery. Fast delivery, great prices.',
  manifest: '/manifest.json',
  keywords: ['grocery', 'delivery', 'fresh food', 'VIT', 'online grocery'],
  openGraph: {
    title: 'VIT Grocery',
    description: 'Fresh groceries delivered in 30 minutes',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#16a34a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#16a34a" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <Providers>
          <PWARegister />
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
