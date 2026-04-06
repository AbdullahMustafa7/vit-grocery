import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Order, DeliveryAgent } from '@/lib/models'
import { getUser } from '@/lib/mobileAuth'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { id } = await params
    const { status } = await req.json()
    const order = await Order.findById(id)
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const VENDOR_TRANSITIONS: Record<string, string> = { pending: 'confirmed', confirmed: 'ready' }
    const AGENT_TRANSITIONS: Record<string, string> = { ready: 'picked_up', picked_up: 'on_the_way', on_the_way: 'delivered' }

    if (user.role === 'vendor') {
      if (VENDOR_TRANSITIONS[order.status] !== status) {
        return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 })
      }
    } else if (user.role === 'agent') {
      const agent = await DeliveryAgent.findOne({ userId: user.id })
      if (!agent || order.agentId?.toString() !== agent._id.toString()) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      if (AGENT_TRANSITIONS[order.status] !== status) {
        return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 })
      }
    } else if (user.role === 'admin') {
      // Admin can set any status
    } else if (user.role === 'customer' && status === 'cancelled' && order.status === 'pending') {
      // Customer can cancel pending orders
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    order.status = status
    await order.save()
    return NextResponse.json(order)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
