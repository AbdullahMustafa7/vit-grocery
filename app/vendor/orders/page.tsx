'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const VENDOR_TRANSITIONS: Record<string, string> = {
  pending: 'confirmed',
  confirmed: 'ready',
}

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')

  const fetchOrders = () => axios.get('/api/vendor/orders').then(({ data }) => setOrders(data)).finally(() => setLoading(false))
  useEffect(() => { fetchOrders() }, [])

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId)
    try {
      await axios.patch(`/api/orders/${orderId}/status`, { status })
      toast.success(`Order marked as ${ORDER_STATUS_LABELS[status]}`)
      fetchOrders()
    } catch {
      toast.error('Failed to update order')
    } finally {
      setUpdating(null)
    }
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
      <h1 className="text-2xl font-bold text-green-900 mb-6">Manage Orders</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'confirmed', 'ready', 'delivered', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${filter === s ? 'bg-green-600 text-white' : 'bg-white border border-green-200 text-gray-600 hover:bg-green-50'}`}>
            {s === 'all' ? 'All' : ORDER_STATUS_LABELS[s] || s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 skeleton rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No orders found</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const nextStatus = VENDOR_TRANSITIONS[order.status]
            return (
              <div key={order._id} className="bg-white rounded-2xl border border-green-100 p-5 hover:border-green-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-semibold text-gray-800">#{order._id.slice(-8).toUpperCase()}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Customer: <span className="font-medium">{order.customerId?.name}</span></p>
                    <p className="text-sm text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {order.items?.map((item: any) => (
                        <span key={item._id} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                          {item.productId?.name} x{item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-green-700">{formatPrice(order.total)}</span>
                    {nextStatus && (
                      <button
                        onClick={() => updateStatus(order._id, nextStatus)}
                        disabled={updating === order._id}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 whitespace-nowrap"
                      >
                        {updating === order._id ? '...' : `Mark ${ORDER_STATUS_LABELS[nextStatus]}`}
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3">📍 {order.deliveryAddress}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
