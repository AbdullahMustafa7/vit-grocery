'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Trash2, Package, Search } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchProducts = () => axios.get('/api/products?limit=100').then(({ data }) => setProducts(data.products || [])).finally(() => setLoading(false))
  useEffect(() => { fetchProducts() }, [])

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return
    setDeleting(id)
    try {
      await axios.delete(`/api/products/${id}`)
      toast.success('Product deleted')
      fetchProducts()
    } catch { toast.error('Failed to delete') }
    finally { setDeleting(null) }
  }

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-green-900">All Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} products</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 w-56" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5,6,7,8,9,10].map(i => <div key={i} className="h-48 skeleton rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((p) => (
            <div key={p._id} className="bg-white rounded-2xl border border-green-100 overflow-hidden hover:border-green-300 hover:shadow-md transition-all">
              <div className="relative aspect-square bg-green-50">
                <Image src={p.imageUrl || `https://source.unsplash.com/200x200/?${encodeURIComponent(p.name)},food`}
                  alt={p.name} fill className="object-cover" unoptimized />
                {p.categoryId?.name && (
                  <span className="absolute top-1 left-1 bg-white/90 text-green-700 text-xs px-1.5 py-0.5 rounded-full">
                    {p.categoryId.name}
                  </span>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-gray-800 text-xs line-clamp-1">{p.name}</h3>
                <p className="text-green-700 font-bold text-sm">{formatPrice(p.price)}</p>
                <p className="text-xs text-gray-400">Stock: {p.stock}</p>
                <button onClick={() => deleteProduct(p._id)} disabled={deleting === p._id}
                  className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-60">
                  <Trash2 className="w-3 h-3" />
                  {deleting === p._id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16">
              <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">No products found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
