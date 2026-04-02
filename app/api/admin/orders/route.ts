import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Order, Product, User, Vendor, DeliveryAgent } from '@/lib/models'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()
    const orders = await Order.find()
      .populate('customerId', 'name email phone')
      .populate('vendorId', 'shopName')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(orders)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
