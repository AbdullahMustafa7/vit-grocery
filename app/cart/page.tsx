'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { formatPrice } from '@/lib/utils'
import { OrderCardSkeleton } from '@/components/LoadingSkeleton'

export const dynamic = 'force-dynamic'

export default function CartPage() {
  const { data: session } = useSession()
  const [cart, setCart] = useState<any>({ items: [] })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [promoCode, setPromoCode] = useState('')

  const fetchCart = async () => {
    try {
      const { data } = await axios.get('/api/cart')
      setCart(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCart() }, [])

  const updateQty = async (productId: string, qty: number) => {
    setUpdating(productId)
    try {
      await axios.put('/api/cart', { productId, quantity: qty })
      await fetchCart()
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (productId: string) => {
    setUpdating(productId)
    try {
      await axios.delete(`/api/cart?productId=${productId}`)
      toast.success('Item removed from cart')
      await fetchCart()
    } finally {
      setUpdating(null)
    }
  }

  const items = cart?.items || []
  const subtotal = items.reduce((sum: number, item: any) => sum + (item.productId?.price || 0) * item.quantity, 0)
  const deliveryCharge = subtotal > 499 ? 0 : 40
  const total = subtotal + deliveryCharge

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="h-8 skeleton rounded w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1,2,3].map(i => <OrderCardSkeleton key={i} />)}
          </div>
          <div className="h-64 skeleton rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-green-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-green-900 mb-2">Please login to view cart</h2>
        <Link href="/login" className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium inline-block mt-4">
          Login
        </Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center page-transition">
        <div className="text-7xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-green-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Add some fresh groceries to get started!</p>
        <Link href="/products" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-semibold transition-colors shadow-md">
          <ShoppingBag className="w-5 h-5" />
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
      <h1 className="text-2xl font-bold text-green-900 mb-8">Your Cart ({items.length} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item: any) => {
            const product = item.productId
            if (!product) return null
            const imgSrc = product.imageUrl || `https://source.unsplash.com/150x150/?${encodeURIComponent(product.name)},food`

            return (
              <div key={item._id || product._id} className="bg-white rounded-2xl border border-green-100 p-4 flex gap-4 hover:border-green-300 transition-colors">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-green-50 flex-shrink-0 relative">
                  <Image src={imgSrc} alt={product.name} fill className="object-cover" unoptimized />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 line-clamp-1">{product.name}</h3>
                  <p className="text-green-700 font-bold text-lg mt-0.5">{formatPrice(product.price)}</p>
                  <p className="text-gray-500 text-sm">Subtotal: {formatPrice(product.price * item.quantity)}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  {/* Remove */}
                  <button
                    onClick={() => removeItem(product._id)}
                    disabled={updating === product._id}
                    className="text-red-400 hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {/* Qty controls */}
                  <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => updateQty(product._id, item.quantity - 1)}
                      disabled={updating === product._id || item.quantity <= 1}
                      className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-green-50 transition-colors disabled:opacity-50"
                    >
                      <Minus className="w-3 h-3 text-green-700" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-green-800">
                      {updating === product._id ? '...' : item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(product._id, item.quantity + 1)}
                      disabled={updating === product._id || item.quantity >= (product.stock || 99)}
                      className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-green-50 transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3 text-green-700" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          <Link href="/products" className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium mt-4">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-2xl border border-green-100 p-6 sticky top-20">
            <h2 className="font-bold text-green-900 text-lg mb-5">Order Summary</h2>

            {/* Promo code */}
            <div className="flex gap-2 mb-5">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400"
                />
              </div>
              <button
                onClick={() => toast('Promo codes coming soon!')}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-medium hover:bg-green-200 transition-colors"
              >
                Apply
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.length} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge</span>
                <span className={deliveryCharge === 0 ? 'text-green-600 font-medium' : ''}>
                  {deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}
                </span>
              </div>
              {deliveryCharge > 0 && (
                <p className="text-xs text-gray-400">Add {formatPrice(499 - subtotal)} more for free delivery</p>
              )}
              <div className="border-t border-green-100 pt-3 flex justify-between font-bold text-lg text-green-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-6 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5" />
            </Link>

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
              <span>🔒 Secure Checkout</span>
              <span>💳 Stripe Powered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
