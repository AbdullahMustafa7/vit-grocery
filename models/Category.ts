import mongoose from 'mongoose'

export interface ICategory {
  _id: string
  name: string
  imageUrl: string
  createdAt: Date
}

const CategorySchema = new mongoose.Schema<ICategory>({
  name: { type: String, required: true, trim: true, unique: true },
  imageUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema)
