'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Users, Package, ShoppingCart, DollarSign, AlertCircle } from 'lucide-react'
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/admin/stats').then(({ data }) => setStats(data)).finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600', href: '/admin/users' },
    { label: 'Total Orders', value: stats?.totalOrders, icon: ShoppingCart, color: 'bg-yellow-50 text-yellow-600', href: '/admin/orders' },
    { label: 'Total Products', value: stats?.totalProducts, icon: Package, color: 'bg-green-50 text-green-600', href: '/admin/products' },
    { label: 'Total Revenue', value: stats ? formatPrice(stats.totalRevenue) : '...', icon: DollarSign, color: 'bg-purple-50 text-purple-600', href: '/admin/orders' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
      <h1 className="text-2xl font-bold text-green-900 mb-8">Admin Dashboard</h1>

      {/* Pending Approval Alert */}
      {stats?.pendingApprovals > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-6 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-amber-700 text-sm">
            <strong>{stats.pendingApprovals}</strong> vendor/agent account{stats.pendingApprovals !== 1 ? 's' : ''} pending approval.{' '}
            <Link href="/admin/users" className="underline font-medium">Review now →</Link>
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href}>
              <div className="bg-white rounded-2xl border border-green-100 p-5 hover:border-green-300 hover:shadow-md transition-all cursor-pointer">
                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xl font-bold text-gray-800">{loading ? '...' : stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-green-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-green-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-green-600 text-sm font-medium hover:text-green-700">View All</Link>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-14 skeleton rounded-xl" />)}</div>
        ) : (
          <div className="space-y-3">
            {stats?.recentOrders?.map((order: any) => (
              <div key={order._id} className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div>
                  <span className="font-medium text-sm text-gray-800">#{order._id.slice(-8).toUpperCase()}</span>
                  <span className="text-xs text-gray-500 ml-3">{order.customerId?.name} · {formatDate(order.createdAt)}</span>
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
