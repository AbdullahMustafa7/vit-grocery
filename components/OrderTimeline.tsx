'use client'

import { CheckCircle, Clock, Package, Truck, MapPin, Home, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock, description: 'Your order has been placed' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, description: 'Vendor confirmed your order' },
  { key: 'ready', label: 'Ready for Pickup', icon: Package, description: 'Order is packed and ready' },
  { key: 'picked_up', label: 'Picked Up', icon: Truck, description: 'Delivery agent picked up your order' },
  { key: 'on_the_way', label: 'On the Way', icon: MapPin, description: 'Your order is on the way' },
  { key: 'delivered', label: 'Delivered', icon: Home, description: 'Order delivered successfully!' },
]

interface OrderTimelineProps {
  status: string
}

export default function OrderTimeline({ status }: OrderTimelineProps) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-200">
        <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
        <div>
          <p className="font-semibold text-red-700">Order Cancelled</p>
          <p className="text-sm text-red-500">This order has been cancelled</p>
        </div>
      </div>
    )
  }

  const currentIdx = STEPS.findIndex((s) => s.key === status)

  return (
    <div className="space-y-0">
      {STEPS.map((step, idx) => {
        const Icon = step.icon
        const isDone = idx <= currentIdx
        const isCurrent = idx === currentIdx
        const isLast = idx === STEPS.length - 1

        return (
          <div key={step.key} className="flex gap-4">
            {/* Icon column */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500',
                  isDone
                    ? 'bg-green-500 shadow-lg shadow-green-200'
                    : 'bg-gray-100 border-2 border-gray-200'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5',
                    isDone ? 'text-white' : 'text-gray-400'
                  )}
                />
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 h-8 mt-1 transition-all duration-500',
                    idx < currentIdx ? 'bg-green-400' : 'bg-gray-200'
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn('pb-6 flex-1', isLast && 'pb-0')}>
              <div className={cn('flex items-center gap-2', isCurrent && 'animate-pulse')}>
                <p
                  className={cn(
                    'font-semibold text-sm',
                    isDone ? 'text-green-700' : 'text-gray-400'
                  )}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    Current
                  </span>
                )}
              </div>
              <p className={cn('text-xs mt-0.5', isDone ? 'text-gray-500' : 'text-gray-300')}>
                {step.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
