'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import { Search } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchOrders = () => axios.get('/api/orders').then(({ data }) => setOrders(data)).finally(() => setLoading(false))
  useEffect(() => { fetchOrders() }, [])

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await axios.patch(`/api/orders/${orderId}/status`, { status })
      toast.success('Order updated!')
      fetchOrders()
    } catch { toast.error('Failed to update') }
  }

  const filtered = orders.filter(o => {
    const matchSearch = !search || o._id.includes(search) || o.customerId?.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-900">All Orders</h1>
        <p className="text-gray-500 text-sm mt-1">{orders.length} total orders</p>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 w-56" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'confirmed', 'ready', 'picked_up', 'on_the_way', 'delivered', 'cancelled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-colors ${statusFilter === s ? 'bg-green-600 text-white' : 'bg-white border border-green-200 text-gray-600 hover:bg-green-50'}`}>
              {s === 'all' ? 'All' : ORDER_STATUS_LABELS[s] || s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl border border-green-100 p-5 hover:border-green-300 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Link href={`/orders/${order._id}`} className="font-semibold text-gray-800 hover:text-green-700 text-sm">
                      #{order._id.slice(-8).toUpperCase()}
                    </Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Customer: <span className="font-medium">{order.customerId?.name}</span>
                    {order.customerId?.email && <span className="text-gray-400"> ({order.customerId.email})</span>}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-green-700">{formatPrice(order.total)}</span>
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order._id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-green-400 bg-white"
                  >
                    {['pending','confirmed','ready','picked_up','on_the_way','delivered','cancelled'].map(s => (
                      <option key={s} value={s}>{ORDER_STATUS_LABELS[s] || s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">No orders found</div>
          )}
        </div>
      )}
    </div>
  )
}
