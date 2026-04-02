import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Product } from '@/lib/models'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''

    if (!q.trim() || q.trim().length < 2) {
      return NextResponse.json([])
    }

    await connectDB()
    const products = await Product.find({
      name: { $regex: q, $options: 'i' },
    })
      .select('name price imageUrl _id')
      .limit(8)
      .lean()

    return NextResponse.json(products)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
