import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { User, Vendor, DeliveryAgent } from '@/lib/models'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()
    const { id } = await params
    const { approved } = await req.json()
    const user = await User.findById(id)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (user.role === 'vendor') {
      await Vendor.findOneAndUpdate({ userId: user._id }, { isApproved: approved })
    } else if (user.role === 'agent') {
      await DeliveryAgent.findOneAndUpdate({ userId: user._id }, { isApproved: approved })
    } else {
      return NextResponse.json({ error: 'Only vendor/agent accounts can be approved' }, { status: 400 })
    }

    return NextResponse.json({ success: true, approved })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
