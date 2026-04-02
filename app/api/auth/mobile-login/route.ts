import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { User, Vendor, DeliveryAgent } from '@/lib/models'
import { sign } from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    await connectDB()
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email' }, { status: 401 })
    }

    // Check account lock
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000)
      return NextResponse.json(
        { error: `Account locked. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}` },
        { status: 423 }
      )
    }

    const isValid = await user.comparePassword(password)

    if (!isValid) {
      user.loginAttempts = (user.loginAttempts || 0) + 1
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000)
        user.loginAttempts = 0
        await user.save()
        return NextResponse.json({ error: 'Too many failed attempts. Account locked for 15 minutes.' }, { status: 423 })
      }
      await user.save()
      const remaining = 5 - user.loginAttempts
      return NextResponse.json(
        { error: `Incorrect password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining` },
        { status: 401 }
      )
    }

    // Reset on success
    user.loginAttempts = 0
    user.lockUntil = undefined
    await user.save()

    if ((user.role === 'vendor' || user.role === 'agent') && !user.approved) {
      return NextResponse.json({ error: 'Account pending admin approval' }, { status: 403 })
    }

    // Sign JWT for mobile
    const token = sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '30d' }
    )

    return NextResponse.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    })
  } catch (error: any) {
    console.error('Mobile login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
