import mongoose from 'mongoose'

export interface IProduct {
  _id: string
  vendorId?: mongoose.Types.ObjectId
  categoryId: mongoose.Types.ObjectId
  name: string
  description: string
  price: number
  stock: number
  imageUrl: string
  createdAt: Date
}

const ProductSchema = new mongoose.Schema<IProduct>({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  imageUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)
