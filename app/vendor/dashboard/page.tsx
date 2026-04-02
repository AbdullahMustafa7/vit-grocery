'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { Package, ShoppingCart, TrendingUp, DollarSign, Plus } from 'lucide-react'
import Link from 'next/link'
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default function VendorDashboardPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get('/api/vendor/orders'),
      axios.get('/api/vendor/products'),
    ]).then(([o, p]) => {
      setOrders(o.data)
      setProducts(p.data)
    }).finally(() => setLoading(false))
  }, [])

  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s: number, o: any) => s + o.total, 0)
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length
  const completedOrders = orders.filter(o => o.status === 'delivered').length

  const stats = [
    { label: 'Total Products', value: products.length, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'Pending Orders', value: pendingOrders, icon: ShoppingCart, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Completed Orders', value: completedOrders, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: DollarSign, color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-green-900">Vendor Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {session?.user?.name}</p>
        </div>
        <Link href="/vendor/products" className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-green-100 p-5">
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xl font-bold text-gray-800">{loading ? '...' : stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-green-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-green-900">Recent Orders</h2>
          <Link href="/vendor/orders" className="text-green-600 text-sm hover:text-green-700 font-medium">View All</Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 skeleton rounded-xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No orders yet</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800 text-sm">#{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-gray-500">{order.customerId?.name} · {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-green-700">{formatPrice(order.total)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
