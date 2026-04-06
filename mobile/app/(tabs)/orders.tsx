import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { api, COLORS, formatPrice } from '@/utils/api'
import { useAuth } from '@/context/AuthContext'

const STATUS_COLORS: Record<string, string> = {
  pending: '#fbbf24', confirmed: '#3b82f6', ready: '#8b5cf6',
  picked_up: '#f97316', on_the_way: '#6366f1', delivered: '#16a34a', cancelled: '#ef4444',
}
const STATUS_LABELS: Record<string, string> = {
  pending: 'Order Placed', confirmed: 'Confirmed', ready: 'Ready',
  picked_up: 'Picked Up', on_the_way: 'On the Way', delivered: 'Delivered', cancelled: 'Cancelled',
}

const VENDOR_NEXT: Record<string, string> = { pending: 'confirmed', confirmed: 'ready' }
const AGENT_NEXT: Record<string, string> = { ready: 'picked_up', picked_up: 'on_the_way', on_the_way: 'delivered' }

export default function OrdersScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const role = user?.role
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      const endpoint = role === 'vendor' ? '/api/vendor/orders' : role === 'agent' ? '/api/agent/orders' : '/api/orders'
      const { data } = await api.get(endpoint)
      setOrders(Array.isArray(data) ? data : data.orders || [])
    } catch { setOrders([]) }
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { fetchOrders() }, [role])

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId)
    try {
      await api.patch(`/api/orders/${orderId}`, { status })
      fetchOrders()
    } catch {
      Alert.alert('Error', 'Failed to update order status')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 80 }} />

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>{role === 'agent' ? '🚚' : '📦'}</Text>
        <Text style={styles.emptyTitle}>{role === 'agent' ? 'No deliveries' : 'No orders yet'}</Text>
        <Text style={styles.emptyText}>{role === 'customer' ? 'Place your first order today!' : 'Check back soon'}</Text>
        {role === 'customer' && (
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/products')}>
            <Text style={styles.shopBtnText}>Shop Now</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders() }} tintColor={COLORS.primary} />}
        renderItem={({ item: order }) => {
          const nextVendor = VENDOR_NEXT[order.status]
          const nextAgent = AGENT_NEXT[order.status]

          return (
            <TouchableOpacity style={styles.orderCard} onPress={() => router.push(`/orders/${order._id}` as any)}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status] + '20' }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLORS[order.status] }]}>
                    {STATUS_LABELS[order.status]}
                  </Text>
                </View>
              </View>

              {order.customerId?.name && (
                <Text style={styles.customerName}>👤 {order.customerId.name}</Text>
              )}
              <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
              <Text style={styles.orderItems}>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</Text>

              {role === 'vendor' && nextVendor && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => updateStatus(order._id, nextVendor)}
                  disabled={updating === order._id}
                >
                  {updating === order._id
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.actionBtnText}>
                        Mark as {nextVendor === 'confirmed' ? 'Confirmed' : 'Ready'}
                      </Text>
                  }
                </TouchableOpacity>
              )}

              {role === 'agent' && nextAgent && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#6366f1' }]}
                  onPress={() => updateStatus(order._id, nextAgent)}
                  disabled={updating === order._id}
                >
                  {updating === order._id
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.actionBtnText}>
                        {nextAgent === 'picked_up' ? 'Mark Picked Up' : nextAgent === 'on_the_way' ? 'Mark On the Way' : 'Mark Delivered'}
                      </Text>
                  }
                </TouchableOpacity>
              )}

              <View style={styles.orderFooter}>
                <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</Text>
                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          )
        }}
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
  emptyText: { fontSize: 14, color: '#6b7280', marginBottom: 24 },
  shopBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16 },
  shopBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  orderCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#d1fae5' },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontWeight: '700', color: '#111827', fontSize: 14 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700' },
  customerName: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  orderTotal: { fontSize: 20, fontWeight: '900', color: COLORS.primary, marginBottom: 2 },
  orderItems: { fontSize: 13, color: '#6b7280', marginBottom: 10 },
  actionBtn: { backgroundColor: COLORS.primary, paddingVertical: 10, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderDate: { fontSize: 12, color: '#9ca3af' },
})
