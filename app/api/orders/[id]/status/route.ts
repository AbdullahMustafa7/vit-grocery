import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Order, DeliveryAgent } from '@/lib/models'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export const dynamic = 'force-dynamic'

const VENDOR_TRANSITIONS: Record<string, string> = {
  pending: 'confirmed',
  confirmed: 'ready',
}

const AGENT_TRANSITIONS: Record<string, string> = {
  picked_up: 'on_the_way',
  on_the_way: 'delivered',
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { id } = await params
    const { status } = await req.json()
    const order = await Order.findById(id)
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const role = session.user.role

    if (role === 'vendor') {
      const allowed = VENDOR_TRANSITIONS[order.status]
      if (!allowed || allowed !== status) {
        return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 })
      }
    } else if (role === 'agent') {
      const agent = await DeliveryAgent.findOne({ userId: session.user.id })
      if (!agent || order.agentId?.toString() !== agent._id.toString()) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      const allowed = AGENT_TRANSITIONS[order.status]
      if (!allowed || allowed !== status) {
        return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 })
      }
    } else if (role === 'admin') {
      // Admin can set any valid status
    } else if (role === 'customer' && status === 'cancelled' && order.status === 'pending') {
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
