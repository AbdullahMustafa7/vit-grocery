import mongoose from 'mongoose'

export interface IVendor {
  _id: string
  userId: mongoose.Types.ObjectId
  shopName: string
  shopAddress?: string
  approved: boolean
  totalSales: number
  createdAt: Date
}

const VendorSchema = new mongoose.Schema<IVendor>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shopName: { type: String, required: true, trim: true },
  shopAddress: { type: String, trim: true },
  approved: { type: Boolean, default: false },
  totalSales: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Vendor || mongoose.model<IVendor>('Vendor', VendorSchema)
