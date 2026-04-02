'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ShoppingCart, Plus, Check, Star } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import axios from 'axios'
import { formatPrice, cn } from '@/lib/utils'

interface ProductCardProps {
  product: {
    _id: string
    name: string
    description: string
    price: number
    stock: number
    imageUrl: string
    categoryId?: { name: string } | string
    vendorId?: { shopName: string } | string
  }
  onCartUpdate?: () => void
}

export default function ProductCard({ product, onCartUpdate }: ProductCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const categoryName =
    typeof product.categoryId === 'object' ? product.categoryId?.name : ''

  const vendorName =
    typeof product.vendorId === 'object' ? product.vendorId?.shopName : ''

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      toast.error('Please login to add items to cart')
      router.push('/login')
      return
    }

    setAdding(true)
    try {
      await axios.post('/api/cart', { productId: product._id, quantity: 1 })
      setAdded(true)
      toast.success(`${product.name} added to cart!`)
      onCartUpdate?.()
      setTimeout(() => setAdded(false), 2000)
    } catch {
      toast.error('Failed to add to cart')
    } finally {
      setAdding(false)
    }
  }

  const imgSrc = product.imageUrl || `https://source.unsplash.com/300x300/?${encodeURIComponent(product.name)},food`

  return (
    <Link href={`/products/${product._id}`}>
      <div className="group bg-white rounded-2xl overflow-hidden border border-green-50 hover:border-green-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
        {/* Image */}
        <div className="relative overflow-hidden bg-green-50 aspect-square">
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
          {/* Category badge */}
          {categoryName && (
            <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-green-700 text-xs font-medium px-2 py-1 rounded-full border border-green-100">
              {categoryName}
            </span>
          )}
          {/* Stock badge */}
          {product.stock <= 10 && product.stock > 0 && (
            <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              Only {product.stock} left
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-800 font-semibold px-3 py-1 rounded-full text-sm">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-800 text-sm mb-0.5 line-clamp-1">{product.name}</h3>
          {vendorName && <p className="text-xs text-gray-400 mb-1">{vendorName}</p>}
          <p className="text-gray-500 text-xs line-clamp-2 mb-2 leading-relaxed">{product.description}</p>

          {/* Rating (mock) */}
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={cn('w-3 h-3', s <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300')}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">(4.0)</span>
          </div>

          {/* Price + Add to Cart */}
          <div className="flex items-center justify-between mt-2">
            <div>
              <span className="text-lg font-bold text-green-700">{formatPrice(product.price)}</span>
              <span className="text-xs text-gray-400 line-through ml-1">
                {formatPrice(Math.round(product.price * 1.2))}
              </span>
            </div>
            {/* Only customers (and guests) can add to cart */}
            {(!session || session.user.role === 'customer') && (
              <button
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
                className={cn(
                  'flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
                  added
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : product.stock === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow active:scale-95'
                )}
              >
                {adding ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : added ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Plus className="w-3 h-3" />
                )}
                {added ? 'Added' : 'Add'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
