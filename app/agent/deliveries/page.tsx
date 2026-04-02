'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import { formatPrice, formatDate, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/lib/utils'
import { ChevronRight, MapPin, Package, CheckCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function AgentDeliveriesPage() {
  const [activeTab, setActiveTab] = useState<'available' | 'assigned'>('available')
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [accepting, setAccepting] = useState<string | null>(null)

  const fetchOrders = (tab: 'available' | 'assigned') => {
    setLoading(true)
    axios.get(`/api/agent/deliveries?type=${tab}`)
      .then(({ data }) => setOrders(data.orders || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchOrders(activeTab)
  }, [activeTab])

  const handleAccept = async (orderId: string) => {
    setAccepting(orderId)
    try {
      await axios.put('/api/agent/deliveries', { orderId, action: 'accept' })
      toast.success('Order accepted! Head to the vendor for pickup.')
      setActiveTab('assigned')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to accept order')
      setAccepting(null)
    }
  }

  const filtered = activeTab === 'all' ? orders : orders.filter(o => filter === 'all' || o.status === filter)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
      <h1 className="text-2xl font-bold text-green-900 mb-6">Deliveries</h1>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setActiveTab('available'); setFilter('all') }}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'available' ? 'bg-green-600 text-white shadow-sm' : 'bg-white border border-green-200 text-gray-600 hover:bg-green-50'}`}
        >
          Available Pickups
        </button>
        <button
          onClick={() => { setActiveTab('assigned'); setFilter('all') }}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'assigned' ? 'bg-green-600 text-white shadow-sm' : 'bg-white border border-green-200 text-gray-600 hover:bg-green-50'}`}
        >
          My Deliveries
        </button>
      </div>

      {/* Status filter — only for assigned tab */}
      {activeTab === 'assigned' && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'picked_up', 'on_the_way', 'delivered'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${filter === s ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-white border border-green-200 text-gray-600 hover:bg-green-50'}`}>
              {s === 'all' ? 'All' : ORDER_STATUS_LABELS[s] || s.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-28 skeleton rounded-2xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 text-green-200" />
          <p className="font-medium">
            {activeTab === 'available' ? 'No orders available for pickup right now' : 'No deliveries found'}
          </p>
          <p className="text-sm mt-1">
            {activeTab === 'available' ? 'Check back soon — vendors are preparing orders' : 'Accept a delivery from the Available Pickups tab'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Available tab — show all with Accept button */}
          {activeTab === 'available' && orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl border border-green-100 p-5 hover:border-green-300 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">#{order._id.slice(-8).toUpperCase()}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600 border border-blue-100">
                  Ready for Pickup
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Customer: <span className="font-medium">{order.customerId?.name || 'Customer'}</span>
              </p>
              {order.vendorId?.shopName && (
                <p className="text-sm text-gray-500">
                  Pickup from: <span className="font-medium text-green-700">{order.vendorId.shopName}</span>
                </p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
              <div className="flex items-start gap-1 mt-2 text-xs text-gray-400">
                <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{order.deliveryAddress}</span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div>
                  <span className="font-bold text-green-700 text-lg">{formatPrice(order.total)}</span>
                  <span className="text-xs text-gray-400 ml-2">· {order.items?.length || 0} items</span>
                </div>
                <button
                  onClick={() => handleAccept(order._id)}
                  disabled={accepting === order._id}
                  className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 active:scale-95 shadow-sm"
                >
                  {accepting === order._id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Accept Delivery
                </button>
              </div>
            </div>
          ))}

          {/* Assigned tab — filterable list with link to detail */}
          {activeTab === 'assigned' && filtered.map((order) => (
            <Link key={order._id} href={`/agent/deliveries/${order._id}`}>
              <div className="bg-white rounded-2xl border border-green-100 p-5 hover:border-green-300 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800">#{order._id.slice(-8).toUpperCase()}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <p className="text-sm text-gray-600">Customer: <span className="font-medium">{order.customerId?.name}</span></p>
                <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                <div className="flex items-start gap-1 mt-2 text-xs text-gray-400">
                  <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-1">{order.deliveryAddress}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-green-700">{formatPrice(order.total)}</span>
                  <span className="text-xs text-gray-500">Earnings: {formatPrice(50)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
