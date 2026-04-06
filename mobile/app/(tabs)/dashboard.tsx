import React, { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { api, COLORS, formatPrice } from '@/utils/api'
import { useAuth } from '@/context/AuthContext'

const STATUS_COLORS: Record<string, string> = {
  pending: '#fbbf24', confirmed: '#3b82f6', ready: '#8b5cf6',
  picked_up: '#f97316', on_the_way: '#6366f1', delivered: '#16a34a', cancelled: '#ef4444',
}

export default function DashboardScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const role = user?.role
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Vendor state
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

  // Agent state
  const [agentData, setAgentData] = useState<any>({ orders: [], agent: null })
  const [available, setAvailable] = useState<any[]>([])
  const [accepting, setAccepting] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      if (role === 'vendor') {
        const [o, p] = await Promise.all([
          api.get('/api/vendor/orders'),
          api.get('/api/vendor/products'),
        ])
        setOrders(o.data)
        setProducts(p.data)
      } else if (role === 'agent') {
        const [assigned, avail] = await Promise.all([
          api.get('/api/agent/deliveries?type=assigned'),
          api.get('/api/agent/deliveries?type=available'),
        ])
        setAgentData(assigned.data)
        setAvailable(avail.data.orders || [])
      }
    } catch (e) {
      console.log('Dashboard error:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { if (role) fetchData() }, [role])

  const acceptDelivery = async (orderId: string) => {
    setAccepting(orderId)
    try {
      await api.put('/api/agent/deliveries', { orderId, action: 'accept' })
      Alert.alert('✅ Accepted!', 'Delivery assigned to you.')
      fetchData()
    } catch {
      Alert.alert('Error', 'Failed to accept delivery')
    } finally {
      setAccepting(null)
    }
  }

  if (loading) return <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 80 }} />

  // VENDOR DASHBOARD
  if (role === 'vendor') {
    const totalRevenue = orders.filter((o: any) => o.paymentStatus === 'paid').reduce((s: number, o: any) => s + o.total, 0)
    const pendingOrders = orders.filter((o: any) => ['pending', 'confirmed'].includes(o.status)).length
    const completedOrders = orders.filter((o: any) => o.status === 'delivered').length

    const stats = [
      { label: 'Products', value: products.length, icon: 'cube', color: '#3b82f6' },
      { label: 'Pending', value: pendingOrders, icon: 'time', color: '#fbbf24' },
      { label: 'Completed', value: completedOrders, icon: 'checkmark-circle', color: COLORS.primary },
      { label: 'Revenue', value: formatPrice(totalRevenue), icon: 'cash', color: '#8b5cf6' },
    ]

    return (
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData() }} tintColor={COLORS.primary} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Vendor Dashboard</Text>
            <Text style={styles.headerSub}>Welcome, {user?.name}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.color + '20' }]}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/orders' as any)}>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          {orders.length === 0 ? (
            <Text style={styles.emptyText}>No orders yet</Text>
          ) : (
            orders.slice(0, 5).map((order: any) => (
              <View key={order._id} style={styles.orderRow}>
                <View>
                  <Text style={styles.orderId}>#{order._id.slice(-6).toUpperCase()}</Text>
                  <Text style={styles.orderCustomer}>{order.customerId?.name}</Text>
                </View>
                <View style={styles.orderRight}>
                  <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status] + '20' }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLORS[order.status] }]}>{order.status}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Products ({products.length})</Text>
          </View>
          {products.slice(0, 5).map((p: any) => (
            <View key={p._id} style={styles.orderRow}>
              <View>
                <Text style={styles.orderId}>{p.name}</Text>
                <Text style={styles.orderCustomer}>Stock: {p.stock}</Text>
              </View>
              <Text style={styles.orderTotal}>{formatPrice(p.price)}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    )
  }

  // AGENT DASHBOARD
  if (role === 'agent') {
    const agent = agentData.agent
    const activeDeliveries = agentData.orders.filter((o: any) => ['picked_up', 'on_the_way'].includes(o.status))
    const completed = agentData.orders.filter((o: any) => o.status === 'delivered').length

    const stats = [
      { label: 'Total', value: agent?.totalDeliveries || 0, icon: 'bicycle', color: '#3b82f6' },
      { label: 'Active', value: activeDeliveries.length, icon: 'navigate', color: '#fbbf24' },
      { label: 'Done', value: completed, icon: 'checkmark-circle', color: COLORS.primary },
      { label: 'Earnings', value: formatPrice(agent?.earnings || 0), icon: 'cash', color: '#8b5cf6' },
    ]

    return (
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData() }} tintColor={COLORS.primary} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Agent Dashboard</Text>
            <Text style={styles.headerSub}>Welcome, {user?.name}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.color + '20' }]}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Available Pickups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Pickups ({available.length})</Text>
          {available.length === 0 ? (
            <Text style={styles.emptyText}>No available pickups right now</Text>
          ) : (
            available.map((order: any) => (
              <View key={order._id} style={[styles.orderRow, { backgroundColor: '#fef3c7', borderColor: '#fde68a' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderId}>#{order._id.slice(-6).toUpperCase()}</Text>
                  <Text style={styles.orderCustomer}>{order.vendorId?.shopName}</Text>
                  <Text style={styles.orderCustomer}>{order.items?.length} items · {formatPrice(order.total)}</Text>
                  <Text style={styles.orderCustomer} numberOfLines={1}>📍 {order.deliveryAddress}</Text>
                </View>
                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => acceptDelivery(order._id)}
                  disabled={accepting === order._id}
                >
                  {accepting === order._id
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.acceptBtnText}>Accept</Text>
                  }
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* My Active Deliveries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Deliveries</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/orders' as any)}>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          {agentData.orders.length === 0 ? (
            <Text style={styles.emptyText}>No deliveries yet</Text>
          ) : (
            agentData.orders.slice(0, 5).map((order: any) => (
              <View key={order._id} style={styles.orderRow}>
                <View>
                  <Text style={styles.orderId}>#{order._id.slice(-6).toUpperCase()}</Text>
                  <Text style={styles.orderCustomer}>{order.customerId?.name}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status] + '20' }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLORS[order.status] }]}>{order.status.replace('_', ' ')}</Text>
                </View>
              </View>
            ))
          )}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    )
  }

  return null
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 24, paddingBottom: 28 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10 },
  statCard: { width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#d1fae5' },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '900', color: '#111827', marginBottom: 2 },
  statLabel: { fontSize: 12, color: '#6b7280' },
  section: { backgroundColor: '#fff', margin: 12, marginTop: 0, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#d1fae5' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.dark, marginBottom: 12 },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0fdf4', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#d1fae5' },
  orderId: { fontSize: 13, fontWeight: '700', color: '#111827' },
  orderCustomer: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  orderRight: { alignItems: 'flex-end', gap: 4 },
  orderTotal: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: '700' },
  emptyText: { color: '#9ca3af', textAlign: 'center', paddingVertical: 16, fontSize: 13 },
  acceptBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  acceptBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
})
