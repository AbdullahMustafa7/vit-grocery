import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Rating, Order } from '@/lib/models'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { orderId, rating, comment } = await req.json()

    if (!orderId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating data' }, { status: 400 })
    }

    const order = await Order.findById(orderId)
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.status !== 'delivered') {
      return NextResponse.json({ error: 'Can only rate delivered orders' }, { status: 400 })
    }
    if (order.customerId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check for existing rating
    const existing = await Rating.findOne({ orderId, customerId: session.user.id })
    if (existing) {
      return NextResponse.json({ error: 'You have already rated this order' }, { status: 409 })
    }

    const newRating = await Rating.create({
      orderId,
      customerId: session.user.id,
      agentId: order.agentId,
      rating,
      comment,
    })

    return NextResponse.json(newRating, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
