import mongoose from 'mongoose'

export interface IDeliveryAgent {
  _id: string
  userId: mongoose.Types.ObjectId
  available: boolean
  totalDeliveries: number
  earnings: number
  createdAt: Date
}

const DeliveryAgentSchema = new mongoose.Schema<IDeliveryAgent>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  available: { type: Boolean, default: true },
  totalDeliveries: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.DeliveryAgent || mongoose.model<IDeliveryAgent>('DeliveryAgent', DeliveryAgentSchema)
