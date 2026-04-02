import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { User, Vendor, DeliveryAgent } from '@/lib/models'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, phone, role } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }

    // Validate name
    if (name.trim().length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 })
    }

    // Validate email
    const emailRegex = /^\S+@\S+\.\S+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    // Validate password
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(password)) {
      return NextResponse.json({
        error: 'Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character',
      }, { status: 400 })
    }

    // Validate phone if provided
    if (phone) {
      const phoneRegex = /^[6-9]\d{9}$/
      if (!phoneRegex.test(phone)) {
        return NextResponse.json({ error: 'Please enter a valid 10-digit Indian phone number' }, { status: 400 })
      }
    }

    // Validate role
    const validRoles = ['customer', 'vendor', 'agent']
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    await connectDB()

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    const userRole = role || 'customer'
    const approved = userRole === 'customer'

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone || undefined,
      role: userRole,
      approved,
    })

    // Create vendor/agent profiles
    if (userRole === 'vendor') {
      await Vendor.create({
        userId: user._id,
        shopName: `${name.trim()}'s Shop`,
        approved: false,
      })
    } else if (userRole === 'agent') {
      await DeliveryAgent.create({
        userId: user._id,
        available: false,
      })
    }

    return NextResponse.json({
      message: userRole === 'customer'
        ? 'Account created successfully! Please login.'
        : 'Account created! Awaiting admin approval before you can login.',
      role: userRole,
    }, { status: 201 })
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 })
  }
}
