import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Order, Product, Vendor } from '@/lib/models'
import { getUser } from '@/lib/mobileAuth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const user = await getUser(req)
    if (!user || user.role !== 'vendor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()
    const vendor = await Vendor.findOne({ userId: user.id })
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

    const vendorProducts = await Product.find({ vendorId: vendor._id }).select('_id').lean()
    const productIds = vendorProducts.map((p: any) => p._id)

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
