import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Order, Product, User, Vendor, DeliveryAgent } from '@/lib/models'
import { getUser } from '@/lib/mobileAuth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const role = user.role
    const query: any = {}

    if (role === 'customer') {
      query.customerId = user.id
    } else if (role === 'admin') {
      // all orders
    } else {
      query.customerId = user.id
    }

    const orders = await Order.find(query)
      .populate('customerId', 'name email phone')
      .populate({ path: 'items.productId', select: 'name imageUrl price' })
      .populate('vendorId', 'shopName')
      .populate({ path: 'agentId', populate: { path: 'userId', select: 'name phone' } })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(orders)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const body = await req.json()
    const { items, deliveryAddress, stripePaymentIntentId, total, paymentMethod } = body
    const isCOD = paymentMethod === 'cod'

    let vendorId = body.vendorId
    if (!vendorId && items?.length > 0) {
      const firstProduct = await Product.findById(items[0].productId).select('vendorId').lean() as any
      vendorId = firstProduct?.vendorId
    }

    const order = await Order.create({
      customerId: user.id,
      vendorId,
      items,
      deliveryAddress,
      stripePaymentIntentId: isCOD ? undefined : stripePaymentIntentId,
      total,
      paymentMethod: isCOD ? 'cod' : 'stripe',
      paymentStatus: isCOD ? 'pending' : 'paid',
      status: 'pending',
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
