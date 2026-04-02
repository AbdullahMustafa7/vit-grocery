import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { User, Order, Product, Vendor, DeliveryAgent, Category } from '@/lib/models'
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

    const [totalUsers, totalOrders, totalProducts, recentOrders, pendingApprovals, revenue] =
      await Promise.all([
        User.countDocuments(),
        Order.countDocuments(),
        Product.countDocuments(),
        Order.find().sort({ createdAt: -1 }).limit(5)
          .populate('customerId', 'name email')
          .lean(),
        User.countDocuments({ approved: false, role: { $in: ['vendor', 'agent'] } }),
        Order.aggregate([
          { $match: { paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
      ])

    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalProducts,
      recentOrders,
      pendingApprovals,
      totalRevenue: revenue[0]?.total || 0,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
