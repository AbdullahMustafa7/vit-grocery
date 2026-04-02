'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Plus, Minus, Star, ArrowLeft, Package, Truck, Shield } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import { formatPrice } from '@/lib/utils'
import ProductCard from '@/components/ProductCard'
import { ProductGridSkeleton } from '@/components/LoadingSkeleton'

export const dynamic = 'force-dynamic'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [product, setProduct] = useState<any>(null)
  const [related, setRelated] = useState<any[]>([])
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(true)

  const productId = Array.isArray(params.id) ? params.id[0] : params.id as string

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${productId}`)
        setProduct(data)
        if (data.categoryId?._id) {
          const rel = await axios.get(`/api/products?category=${data.categoryId._id}&limit=5`)
          setRelated(rel.data.products?.filter((p: any) => p._id !== data._id).slice(0, 4) || [])
        }
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [productId])

  const handleAddToCart = async () => {
    if (!session) {
      toast.error('Please login to add to cart')
      router.push('/login')
      return
    }
    setAdding(true)
    try {
      await axios.post('/api/cart', { productId: product._id, quantity })
      toast.success(`${product.name} added to cart!`)
    } catch {
      toast.error('Failed to add to cart')
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 skeleton rounded w-32 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square skeleton rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 skeleton rounded w-3/4" />
            <div className="h-4 skeleton rounded w-full" />
            <div className="h-4 skeleton rounded w-2/3" />
            <div className="h-10 skeleton rounded w-32" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return <div className="text-center py-20 text-gray-500">Product not found</div>

  const imgSrc = product.imageUrl || `https://source.unsplash.com/600x600/?${encodeURIComponent(product.name)},food`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-green-700">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-green-700">Products</Link>
        <span>/</span>
        <span className="text-green-700 font-medium line-clamp-1">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        {/* Image */}
        <div className="relative">
          <div className="aspect-square rounded-3xl overflow-hidden bg-green-50 shadow-lg">
            <Image
              src={imgSrc}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              unoptimized
            />
          </div>
          {product.categoryId?.name && (
            <span className="absolute top-4 left-4 bg-white text-green-700 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
              {product.categoryId.name}
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-green-900 mb-2">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-sm text-gray-500">(4.0) · 128 reviews</span>
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">{product.description || 'Fresh quality product.'}</p>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-black text-green-700">{formatPrice(product.price)}</span>
            <span className="text-lg text-gray-400 line-through">{formatPrice(Math.round(product.price * 1.2))}</span>
            <span className="bg-green-100 text-green-700 text-sm font-semibold px-2 py-0.5 rounded-full">17% OFF</span>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-700' : 'text-red-600'}`}>
              {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left!` : 'Out of Stock'}
            </span>
          </div>

          {/* Quantity */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-green-50 transition-colors"
                >
                  <Minus className="w-4 h-4 text-green-700" />
                </button>
                <span className="w-8 text-center font-bold text-green-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-green-50 transition-colors"
                >
                  <Plus className="w-4 h-4 text-green-700" />
                </button>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-60 shadow-md hover:shadow-lg active:scale-95"
            >
              {adding ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
              {product.stock === 0 ? 'Out of Stock' : adding ? 'Adding...' : 'Add to Cart'}
            </button>
            <Link
              href="/cart"
              className="px-6 py-4 rounded-2xl border-2 border-green-600 text-green-700 font-semibold hover:bg-green-50 transition-colors"
            >
              View Cart
            </Link>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { icon: Truck, text: 'Fast Delivery' },
              { icon: Package, text: 'Fresh Quality' },
              { icon: Shield, text: 'Secure Payment' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-2 p-3 bg-green-50 rounded-xl">
                <Icon className="w-5 h-5 text-green-600" />
                <span className="text-xs font-medium text-green-700 text-center">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-green-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
