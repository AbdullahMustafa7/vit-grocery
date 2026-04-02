'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ArrowLeft, MapPin, Phone, Package } from 'lucide-react'
import Link from 'next/link'
import OrderTimeline from '@/components/OrderTimeline'
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const AGENT_TRANSITIONS: Record<string, string> = {
  picked_up: 'on_the_way',
  on_the_way: 'delivered',
}

export default function AgentDeliveryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const fetchOrder = () => axios.get(`/api/orders/${params.id}`).then(({ data }) => setOrder(data)).finally(() => setLoading(false))
  useEffect(() => { fetchOrder() }, [params.id])

  const updateStatus = async () => {
    const nextStatus = AGENT_TRANSITIONS[order.status]
    if (!nextStatus) return
    setUpdating(true)
    try {
      await axios.patch(`/api/orders/${order._id}/status`, { status: nextStatus })
      toast.success(`Order marked as ${ORDER_STATUS_LABELS[nextStatus]}!`)
      if (nextStatus === 'delivered') {
        router.push('/agent/deliveries')
      } else {
        fetchOrder()
      }
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse"><div className="h-48 skeleton rounded-2xl" /></div>
  }
  if (!order) return <div className="text-center py-20">Order not found</div>

  const nextStatus = AGENT_TRANSITIONS[order.status]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/agent/deliveries" className="p-2 hover:bg-green-50 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-green-700" />
        </Link>
        <h1 className="text-xl font-bold text-green-900">Delivery #{order._id.slice(-8).toUpperCase()}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Order Status */}
          <div className="bg-white rounded-2xl border border-green-100 p-6">
            <h2 className="font-bold text-green-900 mb-5">Order Progress</h2>
            <OrderTimeline status={order.status} />
          </div>

          {/* Action button */}
          {nextStatus && (
            <button
              onClick={updateStatus}
              disabled={updating}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold text-lg transition-colors disabled:opacity-60 shadow-md flex items-center justify-center gap-2"
            >
              {updating ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                ORDER_STATUS_LABELS[nextStatus] === 'On the Way'
                  ? '🚚 I\'m On My Way'
                  : '✅ Mark as Delivered'
              )}
            </button>
          )}
          {order.status === 'delivered' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-center text-green-700 font-semibold">
              ✅ Delivery Complete! Earning: {formatPrice(50)}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Customer info */}
          <div className="bg-white rounded-2xl border border-green-100 p-5">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-green-600" />
              Customer Details
            </h3>
            <p className="font-medium text-gray-800">{order.customerId?.name}</p>
            <p className="text-sm text-gray-500">{order.customerId?.phone || 'No phone'}</p>
            <p className="text-sm text-gray-500">{order.customerId?.email}</p>
          </div>

          {/* Delivery address */}
          <div className="bg-white rounded-2xl border border-green-100 p-5">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" />
              Drop-off Address
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">{order.deliveryAddress}</p>
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl border border-green-100 p-5">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-green-600" />
              Order Items ({order.items?.length})
            </h3>
            <div className="space-y-2">
              {order.items?.map((item: any) => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.productId?.name} x{item.quantity}</span>
                  <span className="font-medium text-green-700">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-green-100 pt-2 flex justify-between font-bold text-green-900">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
