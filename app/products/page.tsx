'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { SlidersHorizontal, Grid, List, Search, X } from 'lucide-react'
import axios from 'axios'
import ProductCard from '@/components/ProductCard'
import { ProductCardSkeleton } from '@/components/LoadingSkeleton'

export const dynamic = 'force-dynamic'

function ProductsContent() {
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: '',
    maxPrice: '',
    sort: 'createdAt',
    order: 'desc',
  })

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.category) params.set('category', filters.category)
      if (filters.search) params.set('search', filters.search)
      if (filters.minPrice) params.set('minPrice', filters.minPrice)
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
      params.set('sort', filters.sort)
      params.set('order', filters.order)
      params.set('limit', '24')

      const { data } = await axios.get(`/api/products?${params}`)
      setProducts(data.products || [])
      setTotal(data.total || 0)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    axios.get('/api/categories').then(({ data }) => setCategories(data))
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const clearFilters = () => {
    setFilters({ category: '', search: '', minPrice: '', maxPrice: '', sort: 'createdAt', order: 'desc' })
  }

  const hasFilters = filters.category || filters.search || filters.minPrice || filters.maxPrice

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-green-900">
            {filters.search ? `Results for "${filters.search}"` : 'All Products'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{total} products found</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-green-200 rounded-xl text-sm font-medium text-green-700 hover:bg-green-50 transition-colors lg:hidden"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
          <button onClick={() => setView('grid')} className={`p-2 rounded-lg ${view === 'grid' ? 'bg-green-100 text-green-700' : 'text-gray-400'}`}>
            <Grid className="w-5 h-5" />
          </button>
          <button onClick={() => setView('list')} className={`p-2 rounded-lg ${view === 'list' ? 'bg-green-100 text-green-700' : 'text-gray-400'}`}>
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
          <div className="bg-white rounded-2xl border border-green-100 p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-green-900">Filters</h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-red-500 flex items-center gap-1 hover:text-red-600">
                  <X className="w-3 h-3" /> Clear all
                </button>
              )}
            </div>

            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Category</label>
              <div className="space-y-1">
                <button
                  onClick={() => setFilters((f) => ({ ...f, category: '' }))}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!filters.category ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-600 hover:bg-green-50'}`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setFilters((f) => ({ ...f, category: cat._id }))}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.category === cat._id ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-600 hover:bg-green-50'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Price Range (₹)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Sort By</label>
              <select
                value={`${filters.sort}-${filters.order}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-')
                  setFilters((f) => ({ ...f, sort, order }))
                }}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 bg-white"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className={view === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 gap-4' : 'space-y-4'}>
              {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🥦</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-400 text-sm mb-6">Try adjusting your filters or search term</p>
              <button onClick={clearFilters} className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={view === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 gap-4' : 'space-y-4'}>
              {products.map((product) => (
                view === 'grid' ? (
                  <ProductCard key={product._id} product={product} onCartUpdate={() => {}} />
                ) : (
                  <div key={product._id} className="bg-white rounded-2xl border border-green-100 p-4 flex gap-4 hover:border-green-300 hover:shadow-md transition-all">
                    <img
                      src={product.imageUrl || `https://source.unsplash.com/150x150/?${encodeURIComponent(product.name)},food`}
                      alt={product.name}
                      className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800">{product.name}</h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mt-1">{product.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xl font-bold text-green-700">₹{product.price}</span>
                        <ProductCard product={product} />
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}
