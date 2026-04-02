import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser {
  _id: string
  name: string
  email: string
  password: string
  phone?: string
  role: 'customer' | 'vendor' | 'agent' | 'admin'
  address?: string
  approved: boolean
  loginAttempts: number
  lockUntil?: Date
  createdAt: Date
  comparePassword(password: string): Promise<boolean>
}

const UserSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true, minlength: 2, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: { type: String, required: true, minlength: 8 },
  phone: {
    type: String,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number'],
  },
  role: {
    type: String,
    enum: ['customer', 'vendor', 'agent', 'admin'],
    default: 'customer',
  },
  address: { type: String, trim: true },
  approved: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  createdAt: { type: Date, default: Date.now },
})

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password)
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
