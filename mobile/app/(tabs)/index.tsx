import React, { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Image, FlatList, ActivityIndicator, RefreshControl,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { api, COLORS, formatPrice, SHADOWS } from '@/utils/api'

const CATEGORY_ICONS: Record<string, string> = {
  Fruits: '🍎', Vegetables: '🥦', Dairy: '🥛', Bakery: '🍞',
  Beverages: '🧃', Snacks: '🍪', Meat: '🥩',
}

export default function HomeScreen() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    try {
      const [cats, prods] = await Promise.all([
        api.get('/api/categories'),
        api.get('/api/products?limit=10'),
      ])
      setCategories(cats.data)
      setProducts(prods.data.products || [])
    } catch (e) {
      console.log('Error fetching data:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const onRefresh = () => { setRefreshing(true); fetchData() }

  const handleSearch = () => {
    if (search.trim()) router.push(`/products?search=${encodeURIComponent(search)}`)
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* Hero Banner */}
      <View style={styles.hero}>
        <View style={styles.heroContent}>
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Delivering in 30 minutes!</Text>
          </View>
          <Text style={styles.heroTitle}>Fresh Groceries{'\n'}Delivered Fast 🛒</Text>
          <Text style={styles.heroSubtitle}>Quality products at great prices</Text>

          {/* Search */}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color="#9ca3af" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search groceries..."
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={handleSearch}
                placeholderTextColor="#9ca3af"
                returnKeyType="search"
              />
            </View>
            <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Decorative circles */}
        <View style={[styles.circle, { top: -20, right: -20, width: 120, height: 120, opacity: 0.15 }]} />
        <View style={[styles.circle, { bottom: -30, left: -30, width: 100, height: 100, opacity: 0.1 }]} />
      </View>

      {/* Trust badges */}
      <View style={styles.trustRow}>
        {[
          { icon: 'bicycle', text: 'Free above ₹499' },
          { icon: 'shield-checkmark', text: '100% Fresh' },
          { icon: 'time', text: '30 min delivery' },
        ].map((item) => (
          <View key={item.text} style={styles.trustBadge}>
            <Ionicons name={item.icon as any} size={16} color={COLORS.primary} />
            <Text style={styles.trustText}>{item.text}</Text>
          </View>
        ))}
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <TouchableOpacity onPress={() => router.push('/products')}>
            <Text style={styles.sectionLink}>See All →</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <View style={styles.loadingRow}>
            {[1,2,3,4].map(i => <View key={i} style={styles.catSkeleton} />)}
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat._id}
                style={styles.categoryCard}
                onPress={() => router.push(`/products?category=${cat._id}`)}
              >
                <View style={styles.categoryIcon}>
                  <Text style={styles.categoryEmoji}>{CATEGORY_ICONS[cat.name] || '🛒'}</Text>
                </View>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Featured Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Fresh Picks 🌿</Text>
          <TouchableOpacity onPress={() => router.push('/products')}>
            <Text style={styles.sectionLink}>See All →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} size="large" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.productGrid}>
            {products.map((product) => (
              <TouchableOpacity
                key={product._id}
                style={styles.productCard}
                onPress={() => router.push(`/products/${product._id}`)}
              >
                <Image
                  source={{ uri: product.imageUrl || `https://source.unsplash.com/300x300/?${encodeURIComponent(product.name)},food` }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                  <Text style={styles.productDesc} numberOfLines={2}>{product.description}</Text>
                  <View style={styles.productBottom}>
                    <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
                    <TouchableOpacity style={styles.addBtn}>
                      <Ionicons name="add" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Download Banner */}
      <View style={styles.downloadBanner}>
        <Text style={styles.downloadTitle}>🎉 You're using the VIT Grocery App!</Text>
        <Text style={styles.downloadSubtitle}>Get the best grocery experience on mobile</Text>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  hero: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 30,
    paddingBottom: 35,
    overflow: 'hidden',
    position: 'relative',
  },
  heroContent: { position: 'relative', zIndex: 1 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 12 },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  heroTitle: { fontSize: 28, fontWeight: '900', color: '#fff', lineHeight: 36, marginBottom: 6 },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 20 },
  searchRow: { flexDirection: 'row', gap: 8 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  searchBtn: { backgroundColor: '#15803d', width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  circle: { position: 'absolute', backgroundColor: '#fff', borderRadius: 999 },
  trustRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#d1fae5' },
  trustBadge: { alignItems: 'center', gap: 3 },
  trustText: { fontSize: 10, color: COLORS.dark, fontWeight: '500', textAlign: 'center' },
  section: { padding: 16, paddingBottom: 0 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.dark },
  sectionLink: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  loadingRow: { flexDirection: 'row', gap: 12 },
  catSkeleton: { width: 80, height: 90, backgroundColor: '#d1fae5', borderRadius: 16 },
  categoryCard: { alignItems: 'center', marginRight: 14, width: 76 },
  categoryIcon: { width: 60, height: 60, backgroundColor: '#f0fdf4', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 6, borderWidth: 1, borderColor: '#d1fae5' },
  categoryEmoji: { fontSize: 28 },
  categoryName: { fontSize: 11, fontWeight: '600', color: '#374151', textAlign: 'center' },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  productCard: { width: '47%', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#d1fae5', ...SHADOWS.small },
  productImage: { width: '100%', height: 130, backgroundColor: '#f0fdf4' },
  productInfo: { padding: 10 },
  productName: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 3 },
  productDesc: { fontSize: 11, color: '#6b7280', marginBottom: 8, lineHeight: 15 },
  productBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  addBtn: { backgroundColor: COLORS.primary, width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  downloadBanner: { margin: 16, backgroundColor: COLORS.secondary, padding: 20, borderRadius: 20, alignItems: 'center' },
  downloadTitle: { color: '#fff', fontWeight: '800', fontSize: 16, marginBottom: 4 },
  downloadSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
})
