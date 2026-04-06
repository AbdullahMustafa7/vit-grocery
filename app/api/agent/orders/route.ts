import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Order, DeliveryAgent } from '@/lib/models'
import { getUser } from '@/lib/mobileAuth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const user = await getUser(req)
    if (!user || user.role !== 'agent') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()
    const agent = await DeliveryAgent.findOne({ userId: user.id })
    if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

    const orders = await Order.find({ agentId: agent._id })
      .populate('customerId', 'name phone')
      .populate('vendorId', 'shopName shopAddress')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(orders)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
