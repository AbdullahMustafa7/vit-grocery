import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Cart, Product, Category } from '@/lib/models'
import { getUser } from '@/lib/mobileAuth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const cart = await Cart.findOne({ userId: user.id })
      .populate({
        path: 'items.productId',
        populate: { path: 'categoryId', select: 'name' },
      })
      .lean()

    return NextResponse.json(cart || { items: [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { productId, quantity = 1 } = await req.json()

    let cart = await Cart.findOne({ userId: user.id })

    if (!cart) {
      cart = new Cart({ userId: user.id, items: [] })
    }

    const existingIdx = cart.items.findIndex(
      (item: any) => item.productId.toString() === productId
    )

    if (existingIdx >= 0) {
      cart.items[existingIdx].quantity += quantity
    } else {
      cart.items.push({ productId, quantity })
    }

    cart.updatedAt = new Date()
    await cart.save()

    return NextResponse.json({ message: 'Added to cart', itemCount: cart.items.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { productId, quantity } = await req.json()

    const cart = await Cart.findOne({ userId: user.id })
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 })

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (item: any) => item.productId.toString() !== productId
      )
    } else {
      const idx = cart.items.findIndex((item: any) => item.productId.toString() === productId)
      if (idx >= 0) cart.items[idx].quantity = quantity
    }

    cart.updatedAt = new Date()
    await cart.save()
    return NextResponse.json({ message: 'Cart updated', itemCount: cart.items.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')
    const clearAll = searchParams.get('clearAll')

    const cart = await Cart.findOne({ userId: user.id })
    if (!cart) return NextResponse.json({ message: 'Cart already empty' })

    if (clearAll === 'true') {
      cart.items = []
    } else if (productId) {
      cart.items = cart.items.filter((item: any) => item.productId.toString() !== productId)
    }

    cart.updatedAt = new Date()
    await cart.save()
    return NextResponse.json({ message: 'Item removed', itemCount: cart.items.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
