import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Order, Product, Vendor } from '@/lib/models'
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

    const [totalProducts, orders] = await Promise.all([
      Product.countDocuments({ vendorId: vendor._id }),
      Order.find({ vendorId: vendor._id }).lean(),
    ])

    const totalRevenue = orders
      .filter((o: any) => o.paymentStatus === 'paid')
      .reduce((s: number, o: any) => s + o.total, 0)

    const pendingOrders = orders.filter((o: any) => ['pending', 'confirmed'].includes(o.status)).length
    const completedOrders = orders.filter((o: any) => o.status === 'delivered').length

    return NextResponse.json({
      totalProducts,
      totalOrders: orders.length,
      pendingOrders,
      completedOrders,
      totalRevenue,
      vendor,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
