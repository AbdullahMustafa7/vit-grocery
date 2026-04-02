import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Order, Product, User, Vendor } from '@/lib/models'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'vendor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()
    const vendor = await Vendor.findOne({ userId: session.user.id })
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

    // Get all product IDs that belong to this vendor
    const vendorProducts = await Product.find({ vendorId: vendor._id }).select('_id').lean()
    const productIds = vendorProducts.map((p: any) => p._id)

    // Find orders either tagged with this vendorId OR containing vendor's products
    const orders = await Order.find({
      $or: [
        { vendorId: vendor._id },
        { 'items.productId': { $in: productIds } },
      ],
    })
      .populate('customerId', 'name email phone')
      .populate({ path: 'items.productId', select: 'name imageUrl price' })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(orders)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
