'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import axios from 'axios'
import { CheckCircle, MapPin, Phone, Package, ArrowLeft } from 'lucide-react'
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import OrderTimeline from '@/components/OrderTimeline'

export const dynamic = 'force-dynamic'

function OrderDetailContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const isSuccess = searchParams.get('success') === 'true'
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id as string

  useEffect(() => {
    axios.get(`/api/orders/${orderId}`)
      .then(({ data }) => setOrder(data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load order'))
      .finally(() => setLoading(false))

    const interval = setInterval(() => {
      axios.get(`/api/orders/${orderId}`).then(({ data }) => setOrder(data)).catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [orderId])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 skeleton rounded w-40 mb-6" />
        <div className="h-48 skeleton rounded-2xl" />
      </div>
    )
  }

  if (error) return (
    <div className="text-center py-20">
      <p className="text-red-500 font-medium">{error}</p>
      <Link href="/orders" className="mt-4 inline-block text-green-600 hover:underline text-sm">← Back to Orders</Link>
    </div>
  )

  if (!order) return <div className="text-center py-20 text-gray-500">Order not found</div>

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
      {isSuccess && (
        <div className="flex items-center gap-3 p-5 bg-green-50 border border-green-200 rounded-2xl mb-8 animate-slide-up">
          <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
          <div>
            <p className="font-bold text-green-800">Order placed successfully! 🎉</p>
            <p className="text-sm text-green-600">Your groceries are being prepared. Track your order below.</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <Link href="/orders" className="p-2 hover:bg-green-50 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-green-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-green-900">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <span className={`ml-auto text-sm px-3 py-1 rounded-full font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-green-100 p-6">
          <h2 className="font-bold text-green-900 mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600" />
            Order Status
          </h2>
          <OrderTimeline status={order.status} />
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-green-100 p-5">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" />
              Delivery Address
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">{order.deliveryAddress}</p>
          </div>

          {order.agentId && (
            <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-600" />
                Your Delivery Agent
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  {order.agentId?.userId?.name?.[0] || 'A'}
                </div>
                <div>
                  <p className="font-medium text-green-800">{order.agentId?.userId?.name || 'Agent'}</p>
                  <p className="text-sm text-green-600">{order.agentId?.userId?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-green-100 p-5">
            <h3 className="font-semibold text-green-900 mb-3">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Method</span>
                <span className="font-medium text-gray-700">
                  {order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment'}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Payment Status</span>
                <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.paymentStatus === 'pending' && order.paymentMethod === 'cod' ? 'Pay on Delivery' : order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-green-900 pt-2 border-t border-green-100">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-green-100 p-6">
        <h2 className="font-bold text-green-900 mb-5">Order Items ({order.items?.length})</h2>
        <div className="space-y-3">
          {order.items?.map((item: any) => {
            const p = item.productId
            const imgSrc = p?.imageUrl || `https://source.unsplash.com/100x100/?${encodeURIComponent(p?.name || 'grocery')},food`
            return (
              <div key={item._id} className="flex items-center gap-4 p-3 bg-green-50 rounded-xl">
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 relative">
                  <Image src={imgSrc} alt={p?.name || ''} fill className="object-cover" unoptimized />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800">{p?.name}</p>
                  <p className="text-sm text-gray-500">x{item.quantity} × {formatPrice(item.price)}</p>
                </div>
                <span className="font-bold text-green-700">{formatPrice(item.price * item.quantity)}</span>
              </div>
            )
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-green-100 flex justify-between font-bold text-green-900 text-lg">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  )
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 skeleton rounded w-40 mb-6" />
        <div className="h-48 skeleton rounded-2xl" />
      </div>
    }>
      <OrderDetailContent />
    </Suspense>
  )
}
