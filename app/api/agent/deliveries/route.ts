import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Order, DeliveryAgent } from '@/lib/models'
import { getUser } from '@/lib/mobileAuth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const user = await getUser(req)
    if (!user || user.role !== 'agent') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await connectDB()
    const agent = await DeliveryAgent.findOne({ userId: user.id })
    if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'assigned'

    let query: any = {}
    if (type === 'available') {
      query = { status: 'ready', $or: [{ agentId: null }, { agentId: { $exists: false } }] }
    } else {
      query = { agentId: agent._id }
    }

    const orders = await Order.find(query)
      .populate('customerId', 'name phone address')
      .populate({ path: 'items.productId', select: 'name price' })
      .populate('vendorId', 'shopName shopAddress')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ orders, agent })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getUser(req)
    if (!user || user.role !== 'agent') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await connectDB()
    const agent = await DeliveryAgent.findOne({ userId: user.id })
    if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

    const { orderId, action } = await req.json()

    if (action === 'accept') {
      const order = await Order.findByIdAndUpdate(
        orderId,
        { agentId: agent._id, status: 'picked_up' },
        { new: true }
      )
      return NextResponse.json(order)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
