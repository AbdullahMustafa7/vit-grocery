'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Package, X, Upload, ImageIcon } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default function VendorProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', categoryId: '', imageUrl: '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fetchProducts = () =>
    axios.get('/api/vendor/products').then(({ data }) => setProducts(data)).finally(() => setLoading(false))

  useEffect(() => {
    fetchProducts()
    axios.get('/api/categories').then(({ data }) => setCategories(data))
  }, [])

  const openModal = (product?: any) => {
    if (product) {
      setEditing(product)
      setForm({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        stock: product.stock.toString(),
        categoryId: product.categoryId?._id || '',
        imageUrl: product.imageUrl || '',
      })
    } else {
      setEditing(null)
      setForm({ name: '', description: '', price: '', stock: '', categoryId: '', imageUrl: '' })
    }
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.stock) {
      toast.error('Please fill all required fields')
      return
    }
    setSaving(true)
    try {
      const data = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        categoryId: form.categoryId || undefined,
        imageUrl: form.imageUrl || `https://source.unsplash.com/300x300/?${encodeURIComponent(form.name)},food`,
      }
      if (editing) {
        await axios.put('/api/vendor/products', { id: editing._id, ...data })
        toast.success('Product updated!')
      } else {
        await axios.post('/api/vendor/products', data)
        toast.success('Product added!')
      }
      setShowModal(false)
      fetchProducts()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await axios.post('/api/upload', fd)
      setForm(f => ({ ...f, imageUrl: data.url }))
      toast.success('Image uploaded!')
    } catch {
      toast.error('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    try {
      await axios.delete(`/api/vendor/products?id=${id}`)
      toast.success('Product deleted')
      fetchProducts()
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-green-900">My Products</h1>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-48 skeleton rounded-2xl" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-green-200 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No products yet</h3>
          <button onClick={() => openModal()} className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 mt-4">
            Add First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p._id} className="bg-white rounded-2xl border border-green-100 overflow-hidden hover:border-green-300 hover:shadow-md transition-all">
              <div className="relative aspect-square bg-green-50">
                <Image
                  src={p.imageUrl || `https://source.unsplash.com/300x300/?${encodeURIComponent(p.name)},food`}
                  alt={p.name} fill className="object-cover" unoptimized
                />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{p.name}</h3>
                <p className="text-green-700 font-bold">{formatPrice(p.price)}</p>
                <p className="text-xs text-gray-400">Stock: {p.stock}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openModal(p)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100">
                    <Edit className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-green-900 text-lg">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Fresh Apples" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="0" min="0" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                    placeholder="0" min="0" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 bg-white">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                {/* Image preview */}
                {form.imageUrl && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden mb-2 bg-green-50 border border-green-100">
                    <Image src={form.imageUrl} alt="preview" fill className="object-cover" unoptimized />
                  </div>
                )}
                {/* Upload button */}
                <label className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-colors mb-2 text-sm font-medium
                  ${uploading ? 'border-green-200 text-green-400' : 'border-green-300 text-green-600 hover:border-green-500 hover:bg-green-50'}`}>
                  {uploading ? (
                    <><div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="w-4 h-4" /> Upload Image</>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
                {/* Or paste URL */}
                <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="Or paste image URL (leave blank for auto)" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400" />
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                {editing ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
