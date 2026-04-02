'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, Star, Truck, ShieldCheck, Clock, Leaf, ChevronRight } from 'lucide-react'
import axios from 'axios'
import ProductCard from '@/components/ProductCard'
import { ProductCardSkeleton } from '@/components/LoadingSkeleton'
import Footer from '@/components/Footer'
import toast from 'react-hot-toast'

const CATEGORY_ICONS: Record<string, string> = {
  Fruits: '🍎', Vegetables: '🥦', Dairy: '🥛', Bakery: '🍞',
  Beverages: '🧃', Snacks: '🍪', Meat: '🥩',
}

const TESTIMONIALS = [
  { name: 'Priya S.', text: 'Fastest delivery I\'ve ever seen! Got my groceries in under 25 minutes.', rating: 5 },
  { name: 'Rahul K.', text: 'Amazing quality produce. Everything was fresh and well-packed.', rating: 5 },
  { name: 'Ananya M.', text: 'The app is so easy to use. Love the variety of products available!', rating: 4 },
]

export default function HomePage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get('/api/categories'),
      axios.get('/api/products?limit=8'),
    ]).then(([cats, prods]) => {
      setCategories(cats.data)
      setFeaturedProducts(prods.data.products || [])
    }).finally(() => setLoading(false))
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) router.push(`/products?search=${encodeURIComponent(search)}`)
  }

  return (
    <div className="page-transition">
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-green-600 via-green-500 to-green-400 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/30">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Now delivering in 30 minutes!
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
              Fresh Groceries
              <br />
              <span className="text-green-100">Delivered in</span>
              <br />
              <span className="text-yellow-300">30 Minutes</span>
            </h1>

            <p className="text-green-100 text-lg mb-8 max-w-lg">
              Get fresh fruits, vegetables, dairy, and more delivered to your doorstep. Quality guaranteed, prices you love.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for groceries..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg text-sm"
                />
              </div>
              <button
                type="submit"
                className="bg-green-800 hover:bg-green-900 text-white px-6 py-4 rounded-2xl font-semibold transition-colors shadow-lg flex items-center gap-2"
              >
                Search
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 mt-8">
              {[
                { icon: Truck, text: 'Free delivery over ₹499' },
                { icon: ShieldCheck, text: '100% fresh guarantee' },
                { icon: Clock, text: '30-min delivery' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-green-100 text-sm">
                  <Icon className="w-4 h-4" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-green-900">Shop by Category</h2>
          <Link href="/products" className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
          {loading
            ? Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 skeleton rounded-2xl" />
                  <div className="h-3 skeleton rounded w-12" />
                </div>
              ))
            : categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/products?category=${cat._id}`}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-50 hover:bg-green-100 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg border border-green-100">
                    {CATEGORY_ICONS[cat.name] || '🛒'}
                  </div>
                  <span className="text-xs font-medium text-gray-600 group-hover:text-green-700 text-center">
                    {cat.name}
                  </span>
                </Link>
              ))}
        </div>
      </section>

      {/* TODAY'S DEALS */}
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-green-900">Today&apos;s Deals</h2>
              <p className="text-gray-500 text-sm mt-1">Special prices just for today</p>
            </div>
            <Link href="/products" className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium bg-white px-4 py-2 rounded-xl border border-green-200">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-40">
                    <ProductCardSkeleton />
                  </div>
                ))
              : featuredProducts.slice(0, 8).map((product) => (
                  <div key={product._id} className="flex-shrink-0 w-40 sm:w-48">
                    <ProductCard product={product} />
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* FRESH PICKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-green-900">Fresh Picks</h2>
            <p className="text-gray-500 text-sm mt-1">Hand-picked quality products</p>
          </div>
          <Link href="/products" className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium">
            See All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="bg-green-900 py-12 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-10">Why Choose VIT Grocery?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: Truck, title: '30-Minute Delivery', desc: 'Ultra-fast delivery right to your door. No waiting, no hassle.' },
              { icon: Leaf, title: '100% Fresh Produce', desc: 'Directly sourced from farms. Fresh, natural, and healthy.' },
              { icon: ShieldCheck, title: 'Safe & Secure', desc: 'All payments secured. Quality guaranteed or money back.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center p-6 bg-white/10 rounded-2xl border border-white/10">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7 text-green-300" />
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-green-200 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-green-900 text-center mb-8">What Our Customers Say</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm hover-scale">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {t.name[0]}
                </div>
                <span className="font-medium text-gray-800 text-sm">{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DOWNLOAD APP BANNER */}
      <section className="bg-gradient-to-r from-green-600 to-green-500 py-12 mx-4 sm:mx-8 lg:mx-16 rounded-3xl mb-12">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Get the VIT Grocery App</h2>
          <p className="text-green-100 text-sm mb-6">Download our mobile app for an even better experience. Available on Android and iOS.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => toast('🚀 Android app coming soon! Stay tuned.', { icon: '📱', duration: 3000 })}
              className="bg-white text-green-700 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-green-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              📱 Google Play
            </button>
            <button
              onClick={() => toast('🚀 iOS app coming soon! Stay tuned.', { icon: '🍎', duration: 3000 })}
              className="bg-white text-green-700 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-green-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              🍎 App Store
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
