import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api, COLORS, formatPrice, SHADOWS } from '@/utils/api'

export default function CartScreen() {
  const router = useRouter()
  const [cart, setCart] = useState<any>({ items: [] })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/api/cart')
      setCart(data)
    } catch {
      // Not logged in or error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCart() }, [])

  const updateQty = async (productId: string, qty: number) => {
    setUpdating(productId)
    try {
      await api.put('/api/cart', { productId, quantity: qty })
      fetchCart()
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (productId: string) => {
    Alert.alert('Remove Item', 'Remove this item from cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          await api.delete(`/api/cart?productId=${productId}`)
          fetchCart()
        },
      },
    ])
  }

  const items = cart?.items || []
  const subtotal = items.reduce((s: number, i: any) => s + (i.productId?.price || 0) * i.quantity, 0)
  const deliveryCharge = subtotal > 499 ? 0 : 40
  const total = subtotal + deliveryCharge

  if (loading) return <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 80 }} />

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyText}>Add fresh groceries to get started!</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/products')}>
          <Ionicons name="storefront" size={18} color="#fff" />
          <Text style={styles.shopBtnText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.productId?._id || Math.random().toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const p = item.productId
          if (!p) return null
          return (
            <View style={styles.cartItem}>
              <Image
                source={{ uri: p.imageUrl || `https://source.unsplash.com/100x100/?${encodeURIComponent(p.name)},food` }}
                style={styles.itemImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.itemPrice}>{formatPrice(p.price)}</Text>
                <Text style={styles.itemSubtotal}>Subtotal: {formatPrice(p.price * item.quantity)}</Text>
              </View>
              <View style={styles.qtyControls}>
                <TouchableOpacity
                  onPress={() => item.quantity > 1 ? updateQty(p._id, item.quantity - 1) : removeItem(p._id)}
                  style={styles.qtyBtn}
                >
                  <Ionicons name={item.quantity > 1 ? 'remove' : 'trash-outline'} size={14} color={item.quantity > 1 ? COLORS.primary : '#ef4444'} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>
                  {updating === p._id ? '...' : item.quantity}
                </Text>
                <TouchableOpacity onPress={() => updateQty(p._id, item.quantity + 1)} style={styles.qtyBtn}>
                  <Ionicons name="add" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
          )
        }}
        ListFooterComponent={
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal ({items.length} items)</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={[styles.summaryValue, deliveryCharge === 0 && { color: COLORS.primary }]}>
                {deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}
              </Text>
            </View>
            {deliveryCharge > 0 && (
              <Text style={styles.freeDeliveryHint}>Add {formatPrice(499 - subtotal)} more for free delivery</Text>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={() => router.push('/checkout' as any)}>
              <Ionicons name="card" size={20} color="#fff" />
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  list: { padding: 12 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: COLORS.dark, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#6b7280', marginBottom: 24, textAlign: 'center' },
  shopBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16 },
  shopBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cartItem: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#d1fae5', alignItems: 'center', gap: 12, ...SHADOWS.small },
  itemImage: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#f0fdf4' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 2 },
  itemPrice: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  itemSubtotal: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f0fdf4', borderRadius: 12, padding: 4 },
  qtyBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...SHADOWS.small },
  qtyText: { fontSize: 14, fontWeight: '800', color: COLORS.dark, minWidth: 16, textAlign: 'center' },
  summary: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginTop: 8, borderWidth: 1, borderColor: '#d1fae5' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: '#6b7280' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#374151' },
  freeDeliveryHint: { fontSize: 11, color: '#9ca3af', marginBottom: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#d1fae5', paddingTop: 12, marginTop: 4, marginBottom: 20 },
  totalLabel: { fontSize: 18, fontWeight: '800', color: COLORS.dark },
  totalValue: { fontSize: 20, fontWeight: '900', color: COLORS.primary },
  checkoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 16 },
  checkoutBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
})
