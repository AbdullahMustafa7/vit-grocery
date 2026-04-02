import React, { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { api, COLORS } from '@/utils/api'
import { useAuth } from '@/context/AuthContext'

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    api.get(`/api/products/${id}`).then(({ data }) => {
      setProduct(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  const addToCart = async () => {
    if (!user) {
      router.push('/login')
      return
    }
    setAdding(true)
    try {
      await api.post('/api/cart', { productId: id, quantity: qty })
      Alert.alert('Added to cart!', `${product.name} added successfully.`)
    } catch {
      Alert.alert('Error', 'Failed to add to cart')
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    )
  }

  const imageUri = product.imageUrl ||
    `https://source.unsplash.com/400x300/?${encodeURIComponent(product.name)},food`

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Image source={{ uri: imageUri }} style={styles.image} />

      <View style={styles.content}>
        {product.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
        )}

        <Text style={styles.name}>{product.name}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{product.price.toLocaleString('en-IN')}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </Text>
          )}
        </View>

        {product.description && (
          <Text style={styles.description}>{product.description}</Text>
        )}

        <View style={styles.qtyRow}>
          <Text style={styles.qtyLabel}>Quantity</Text>
          <View style={styles.qtyControls}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQty(Math.max(1, qty - 1))}
            >
              <Ionicons name="remove" size={18} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{qty}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQty(qty + 1)}
            >
              <Ionicons name="add" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addButton, (adding || !product.inStock) && styles.addButtonDisabled]}
          onPress={addToCart}
          disabled={adding || !product.inStock}
        >
          {adding ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="cart-outline" size={20} color="#fff" />
              <Text style={styles.addButtonText}>
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#666', fontSize: 16 },
  image: { width: '100%', height: 280, backgroundColor: '#f0fdf4' },
  content: { padding: 20 },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  categoryText: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
  name: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  price: { fontSize: 24, fontWeight: '800', color: COLORS.primary },
  originalPrice: {
    fontSize: 16,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  description: { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: 20 },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  qtyLabel: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    minWidth: 24,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  addButtonDisabled: { opacity: 0.6 },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
