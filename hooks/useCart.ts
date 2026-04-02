'use client'

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'

export interface CartItem {
  productId: {
    _id: string
    name: string
    price: number
    imageUrl: string
    stock: number
  }
  quantity: number
}

export function useCart() {
  const { data: session } = useSession()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!session) return
    try {
      const { data } = await axios.get('/api/cart')
      setItems(data.items || [])
    } catch (err) {
      // silent
    }
  }, [session])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce(
    (sum, item) => sum + (item.productId?.price || 0) * item.quantity,
    0
  )

  const addToCart = async (productId: string, quantity = 1) => {
    setLoading(true)
    try {
      await axios.post('/api/cart', { productId, quantity })
      await fetchCart()
      return true
    } catch (err) {
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    setLoading(true)
    try {
      await axios.put('/api/cart', { productId, quantity })
      await fetchCart()
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (productId: string) => {
    setLoading(true)
    try {
      await axios.delete(`/api/cart?productId=${productId}`)
      await fetchCart()
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    try {
      await axios.delete('/api/cart?clearAll=true')
      setItems([])
    } catch (err) {
      // silent
    }
  }

  return { items, itemCount, subtotal, loading, addToCart, updateQuantity, removeItem, clearCart, refetch: fetchCart }
}
