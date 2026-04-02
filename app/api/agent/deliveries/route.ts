import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Order, Product, Vendor, User, DeliveryAgent } from '@/lib/models'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'agent') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()
    const agent = await DeliveryAgent.findOne({ userId: session.user.id })
    if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'assigned'

    let query: any = {}
    if (type === 'available') {
      // Match orders that are ready and have no agent assigned (null or field missing entirely)
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
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'agent') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()
    const agent = await DeliveryAgent.findOne({ userId: session.user.id })
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
