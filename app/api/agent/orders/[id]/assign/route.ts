import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Order, DeliveryAgent } from '@/lib/models'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'agent') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()
    const { id } = await params
    const agent = await DeliveryAgent.findOne({ userId: session.user.id })
    if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    if (!agent.isApproved) return NextResponse.json({ error: 'Account not approved' }, { status: 403 })

    const order = await Order.findById(id)
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.status !== 'ready') {
      return NextResponse.json({ error: 'Order is not ready for pickup' }, { status: 400 })
    }
    if (order.agentId) {
      return NextResponse.json({ error: 'Order already assigned' }, { status: 409 })
    }

    order.agentId = agent._id
    order.status = 'picked_up'
    await order.save()

    return NextResponse.json(order)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
