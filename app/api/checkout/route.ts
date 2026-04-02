import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongoose'
import { Cart, Product, Order, Vendor } from '@/lib/models'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10' as any,
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { deliveryAddress } = await req.json()

    if (!deliveryAddress?.trim()) {
      return NextResponse.json({ error: 'Delivery address is required' }, { status: 400 })
    }

    // Validate cart server-side
    const cart = await Cart.findOne({ userId: session.user.id }).populate('items.productId')
    if (!cart || !cart.items.length) {
      return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 })
    }

    // Calculate real total server-side (never trust client-side total)
    let total = 0
    const validatedItems = []
    for (const item of cart.items) {
      const product = item.productId as any
      if (!product) continue
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `${product.name} is out of stock` }, { status: 400 })
      }
      total += product.price * item.quantity
      validatedItems.push({ productId: product._id, quantity: item.quantity, price: product.price })
    }

    const deliveryCharge = total > 499 ? 0 : 40
    const grandTotal = total + deliveryCharge

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(grandTotal * 100), // paise
      currency: 'inr',
      metadata: {
        userId: session.user.id,
        deliveryAddress,
        itemCount: cart.items.length.toString(),
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      total: grandTotal,
      subtotal: total,
      deliveryCharge,
      items: validatedItems,
    })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message || 'Payment setup failed' }, { status: 500 })
  }
}
