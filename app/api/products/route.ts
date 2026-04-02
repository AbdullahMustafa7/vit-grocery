import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Product, Category, Vendor } from '@/lib/models'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const query: any = {}
    if (category) query.categoryId = category
    if (search) query.name = { $regex: search, $options: 'i' }
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }

    const sortObj: any = {}
    sortObj[sort] = order === 'asc' ? 1 : -1

    const total = await Product.countDocuments(query)
    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .populate('vendorId', 'shopName')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const role = session.user.role
    if (role !== 'vendor' && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()
    const body = await req.json()

    let vendorId = body.vendorId
    if (role === 'vendor' && !vendorId) {
      const vendor = await Vendor.findOne({ userId: session.user.id })
      if (!vendor) return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 })
      vendorId = vendor._id
    }

    const product = await Product.create({ ...body, vendorId })
    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
