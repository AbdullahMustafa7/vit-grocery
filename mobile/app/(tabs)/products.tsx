import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, Image, ActivityIndicator, RefreshControl,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { api, COLORS, formatPrice, SHADOWS } from '@/utils/api'

export default function ProductsScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  const fetchProducts = useCallback(async () => {
    try {
      const q: Record<string, string> = { limit: '20' }
      if (debouncedSearch) q.search = debouncedSearch
      if (params.category) q.category = params.category as string
      const queryStr = new URLSearchParams(q).toString()
      const { data } = await api.get(`/api/products?${queryStr}`)
      setProducts(data.products || [])
    } catch (e) {
      console.log('Error:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [debouncedSearch, params.category])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/products/${item._id}`)}
    >
      <Image
        source={{ uri: item.imageUrl || `https://source.unsplash.com/300x300/?${encodeURIComponent(item.name)},food` }}
        style={styles.productImage}
      />
      {item.categoryId?.name && (
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{item.categoryId.name}</Text>
        </View>
      )}
      {item.stock === 0 && (
        <View style={styles.outOfStockOverlay}>
          <Text style={styles.outOfStockText}>Out of Stock</Text>
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.productBottom}>
          <View>
            <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
            <Text style={styles.originalPrice}>{formatPrice(Math.round(item.price * 1.2))}</Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, item.stock === 0 && styles.addBtnDisabled]}
            disabled={item.stock === 0}
          >
            <Ionicons name="add" size={18} color={item.stock === 0 ? '#9ca3af' : '#fff'} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search fresh groceries..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9ca3af"
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProducts() }} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🥦</Text>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptyText}>Try a different search</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', margin: 12, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: '#d1fae5', ...SHADOWS.small },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  list: { paddingHorizontal: 12, paddingBottom: 20 },
  row: { justifyContent: 'space-between' },
  productCard: { width: '48%', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: '#d1fae5', ...SHADOWS.small },
  productImage: { width: '100%', height: 140, backgroundColor: '#f0fdf4' },
  categoryBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  categoryBadgeText: { fontSize: 9, fontWeight: '600', color: COLORS.dark },
  outOfStockOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 140, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  outOfStockText: { color: '#fff', fontWeight: '700', fontSize: 12, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  productInfo: { padding: 10 },
  productName: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 3 },
  productDesc: { fontSize: 11, color: '#6b7280', marginBottom: 8, lineHeight: 15 },
  productBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  productPrice: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  originalPrice: { fontSize: 10, color: '#9ca3af', textDecorationLine: 'line-through' },
  addBtn: { backgroundColor: COLORS.primary, width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  addBtnDisabled: { backgroundColor: '#e5e7eb' },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 6 },
  emptyText: { fontSize: 14, color: '#9ca3af' },
})
