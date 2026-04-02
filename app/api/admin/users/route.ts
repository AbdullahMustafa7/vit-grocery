import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { User, Vendor, DeliveryAgent } from '@/lib/models'
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
    const users = await User.find({}, '-password').sort({ createdAt: -1 }).lean()
    return NextResponse.json(users)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()
    const { userId, approved } = await req.json()

    const user = await User.findByIdAndUpdate(userId, { approved }, { new: true })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Also update vendor/agent profile
    if (user.role === 'vendor') {
      await Vendor.findOneAndUpdate({ userId }, { approved })
    } else if (user.role === 'agent') {
      await DeliveryAgent.findOneAndUpdate({ userId }, { available: approved })
    }

    return NextResponse.json({ message: `User ${approved ? 'approved' : 'rejected'} successfully` })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
