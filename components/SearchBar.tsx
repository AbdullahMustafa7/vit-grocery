'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import Image from 'next/image'
import axios from 'axios'
import { formatPrice } from '@/lib/utils'

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const { data } = await axios.get(`/api/products/search?q=${encodeURIComponent(query)}`)
        setResults(data)
        setOpen(true)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query)}`)
      setOpen(false)
    }
  }

  const handleSelect = (product: any) => {
    router.push(`/products/${product._id}`)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={ref} className="relative w-full max-w-sm">
      <form onSubmit={handleSearch}>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-green-400 focus-within:bg-white transition-colors">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Search groceries..."
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setResults([]); setOpen(false) }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-green-100 z-50 overflow-hidden animate-fade-in">
          {results.map((product) => (
            <button
              key={product._id}
              onClick={() => handleSelect(product)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-green-50 flex-shrink-0 relative">
                <Image
                  src={product.imageUrl || `https://source.unsplash.com/50x50/?${encodeURIComponent(product.name)},food`}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 line-clamp-1">{product.name}</p>
                <p className="text-xs text-green-600 font-semibold">{formatPrice(product.price)}</p>
              </div>
              <Search className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
            </button>
          ))}
          <button
            onClick={handleSearch}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-green-700 font-medium hover:bg-green-50 border-t border-green-100 transition-colors"
          >
            <Search className="w-4 h-4" />
            Search for &ldquo;{query}&rdquo;
          </button>
        </div>
      )}

      {open && loading && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-green-100 z-50 p-4 text-center">
          <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      )}
    </div>
  )
}
