import mongoose from 'mongoose'

export interface IRating {
  _id: string
  orderId: mongoose.Types.ObjectId
  customerId: mongoose.Types.ObjectId
  agentId?: mongoose.Types.ObjectId
  rating: number
  comment?: string
  createdAt: Date
}

const RatingSchema = new mongoose.Schema<IRating>({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryAgent' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Rating || mongoose.model<IRating>('Rating', RatingSchema)
