import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Product, Vendor } from '@/lib/models'
import { getUser } from '@/lib/mobileAuth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const user = await getUser(req)
    if (!user || user.role !== 'vendor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await connectDB()
    const vendor = await Vendor.findOne({ userId: user.id })
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

    const products = await Product.find({ vendorId: vendor._id })
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(products)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUser(req)
    if (!user || user.role !== 'vendor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await connectDB()
    const vendor = await Vendor.findOne({ userId: user.id })
    if (!vendor) return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 })

    const body = await req.json()
    const { name, description, price, stock, categoryId, imageUrl } = body

    if (!name || price == null || stock == null) {
      return NextResponse.json({ error: 'name, price and stock are required' }, { status: 400 })
    }

    const product = await Product.create({
      name, description,
      price: Number(price), stock: Number(stock),
      categoryId: categoryId || undefined,
      imageUrl: imageUrl || `https://source.unsplash.com/300x300/?${encodeURIComponent(name)},food`,
      vendorId: vendor._id,
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getUser(req)
    if (!user || user.role !== 'vendor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await connectDB()
    const vendor = await Vendor.findOne({ userId: user.id })
    if (!vendor) return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 })

    const body = await req.json()
    const { id, name, description, price, stock, categoryId, imageUrl } = body
    if (!id) return NextResponse.json({ error: 'Product id is required' }, { status: 400 })

    const product = await Product.findOne({ _id: id, vendorId: vendor._id })
    if (!product) return NextResponse.json({ error: 'Product not found or not yours' }, { status: 404 })

    Object.assign(product, {
      name: name ?? product.name,
      description: description ?? product.description,
      price: price != null ? Number(price) : product.price,
      stock: stock != null ? Number(stock) : product.stock,
      categoryId: categoryId || product.categoryId,
      imageUrl: imageUrl || product.imageUrl,
    })

    await product.save()
    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getUser(req)
    if (!user || user.role !== 'vendor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await connectDB()
    const vendor = await Vendor.findOne({ userId: user.id })
    if (!vendor) return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Product id is required' }, { status: 400 })

    const product = await Product.findOneAndDelete({ _id: id, vendorId: vendor._id })
    if (!product) return NextResponse.json({ error: 'Product not found or not yours' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
