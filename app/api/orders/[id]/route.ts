import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Order, Product, User, Vendor, DeliveryAgent } from '@/lib/models'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export const dynamic = 'force-dynamic'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { id } = await params
    const order = await Order.findById(id)
      .populate('customerId', 'name email phone')
      .populate('vendorId', 'shopName shopAddress phone')
      .populate({ path: 'items.productId', select: 'name imageUrl price' })
      .populate({ path: 'agentId', populate: { path: 'userId', select: 'name phone' } })
      .lean()

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const role = session.user.role
    const userId = session.user.id

    if (role === 'customer' && (order as any).customerId?._id?.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
