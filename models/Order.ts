import mongoose from 'mongoose'

export type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed'

export interface IOrderItem {
  productId: mongoose.Types.ObjectId
  quantity: number
  price: number
}

export interface IOrder {
  _id: string
  customerId: mongoose.Types.ObjectId
  vendorId?: mongoose.Types.ObjectId
  agentId?: mongoose.Types.ObjectId
  items: IOrderItem[]
  status: OrderStatus
  total: number
  deliveryAddress: string
  stripePaymentIntentId?: string
  paymentStatus: PaymentStatus
  paymentMethod: 'stripe' | 'cod'
  createdAt: Date
}

const OrderSchema = new mongoose.Schema<IOrder>({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryAgent' },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true },
    },
  ],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'ready', 'picked_up', 'on_the_way', 'delivered', 'cancelled'],
    default: 'pending',
  },
  total: { type: Number, required: true },
  deliveryAddress: { type: String, required: true },
  stripePaymentIntentId: { type: String },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'cod'],
    default: 'stripe',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)
