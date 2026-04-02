'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import { Truck, Package, DollarSign, Star, CheckCircle } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function AgentDashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<{ orders: any[]; agent: any }>({ orders: [], agent: null })
  const [available, setAvailable] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)

  const fetchData = async () => {
    const [assigned, avail] = await Promise.all([
      axios.get('/api/agent/deliveries?type=assigned'),
      axios.get('/api/agent/deliveries?type=available'),
    ])
    setData(assigned.data)
    setAvailable(avail.data.orders || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const acceptDelivery = async (orderId: string) => {
    setAccepting(orderId)
    try {
      await axios.put('/api/agent/deliveries', { orderId, action: 'accept' })
      toast.success('Delivery accepted!')
      fetchData()
    } catch {
      toast.error('Failed to accept delivery')
    } finally {
      setAccepting(null)
    }
  }

  const agent = data.agent
  const activeDeliveries = data.orders.filter(o => ['picked_up', 'on_the_way'].includes(o.status))
  const completed = data.orders.filter(o => o.status === 'delivered').length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-green-900">Agent Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome, {session?.user?.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Deliveries', value: agent?.totalDeliveries || 0, icon: Truck, color: 'bg-blue-50 text-blue-600' },
          { label: 'Active Now', value: activeDeliveries.length, icon: Package, color: 'bg-yellow-50 text-yellow-600' },
          { label: 'Completed', value: completed, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
          { label: 'Total Earnings', value: formatPrice(agent?.earnings || 0), icon: DollarSign, color: 'bg-purple-50 text-purple-600' },
        ].map((stat) => {
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

      {/* Available Pickups */}
      <div className="bg-white rounded-2xl border border-green-100 p-6 mb-6">
        <h2 className="font-bold text-green-900 text-lg mb-5 flex items-center gap-2">
          <Package className="w-5 h-5 text-green-600" />
          Available Pickups ({available.length})
        </h2>

        {loading ? (
          <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>
        ) : available.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No available pickups right now. Check back soon!</p>
        ) : (
          <div className="space-y-3">
            {available.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-800">#{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-gray-600">{order.vendorId?.shopName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{order.items?.length} items · {formatPrice(order.total)}</p>
                  <p className="text-xs text-gray-500">📍 {order.deliveryAddress?.slice(0, 50)}...</p>
                </div>
                <button
                  onClick={() => acceptDelivery(order._id)}
                  disabled={accepting === order._id}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
                >
                  {accepting === order._id ? '...' : 'Accept'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Deliveries */}
      <div className="bg-white rounded-2xl border border-green-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-green-900 text-lg flex items-center gap-2">
            <Truck className="w-5 h-5 text-green-600" />
            My Deliveries
          </h2>
          <Link href="/agent/deliveries" className="text-green-600 text-sm hover:text-green-700 font-medium">View All</Link>
        </div>

        {data.orders.slice(0, 5).map((order) => (
          <Link key={order._id} href={`/agent/deliveries/${order._id}`}>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl mb-3 hover:bg-green-100 transition-colors cursor-pointer">
              <div>
                <p className="font-medium text-sm text-gray-800">#{order._id.slice(-6).toUpperCase()}</p>
                <p className="text-xs text-gray-500">{order.customerId?.name} · {formatDate(order.createdAt)}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                order.status === 'on_the_way' ? 'bg-indigo-100 text-indigo-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {order.status.replace('_', ' ')}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
