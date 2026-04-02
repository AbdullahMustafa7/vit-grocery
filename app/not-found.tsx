import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 page-transition">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🥦</div>
        <h1 className="text-4xl font-black text-green-900 mb-3">404</h1>
        <h2 className="text-xl font-bold text-gray-700 mb-3">Page Not Found</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Oops! The page you&apos;re looking for seems to have gone out of stock.
          Let&apos;s get you back to the fresh stuff.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/products"
            className="flex items-center gap-2 border border-green-300 text-green-700 hover:bg-green-50 px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <Search className="w-4 h-4" />
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  )
}
