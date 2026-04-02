import mongoose from 'mongoose'

export interface ICartItem {
  productId: mongoose.Types.ObjectId
  quantity: number
}

export interface ICart {
  _id: string
  userId: mongoose.Types.ObjectId
  items: ICartItem[]
  updatedAt: Date
}

const CartSchema = new mongoose.Schema<ICart>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
})

export default mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema)
