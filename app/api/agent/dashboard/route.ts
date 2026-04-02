import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Order, Vendor, User, DeliveryAgent } from '@/lib/models'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'agent') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()
    const agent = await DeliveryAgent.findOne({ userId: session.user.id })
    if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

    const [assignedOrders, availableOrders] = await Promise.all([
      Order.find({ agentId: agent._id })
        .populate('customerId', 'name phone')
        .populate('vendorId', 'shopName shopAddress')
        .sort({ createdAt: -1 })
        .lean(),
      Order.find({ status: 'ready', agentId: null })
        .populate('vendorId', 'shopName shopAddress')
        .lean(),
    ])

    return NextResponse.json({ agent, assignedOrders, availableOrders })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
