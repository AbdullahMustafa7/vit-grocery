'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { Package, ChevronRight, Clock } from 'lucide-react'
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import { OrderCardSkeleton } from '@/components/LoadingSkeleton'

export const dynamic = 'force-dynamic'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/orders').then(({ data }) => setOrders(data)).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-8 skeleton rounded w-40 mb-6" />
        <div className="space-y-4">{[1,2,3,4].map(i => <OrderCardSkeleton key={i} />)}</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
      <h1 className="text-2xl font-bold text-green-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-green-200 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h3>
          <p className="text-gray-400 mb-8">Start shopping to see your orders here</p>
          <Link href="/products" className="bg-green-600 text-white px-8 py-3 rounded-2xl font-medium hover:bg-green-700 transition-colors inline-block">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order._id} href={`/orders/${order._id}`}>
              <div className="bg-white rounded-2xl border border-green-100 p-5 hover:border-green-300 hover:shadow-md transition-all duration-200 cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="font-semibold text-green-900">{formatPrice(order.total)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" />
                    {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                {/* Items preview */}
                {order.items?.slice(0, 3).map((item: any) => (
                  <span key={item._id} className="inline-block mr-2 mt-2 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                    {item.productId?.name} x{item.quantity}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
