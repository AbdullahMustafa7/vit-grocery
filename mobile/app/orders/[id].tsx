import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Image,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { api, COLORS, formatPrice } from '@/utils/api'

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: 'time-outline', desc: 'Your order has been placed' },
  { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle-outline', desc: 'Vendor confirmed your order' },
  { key: 'ready', label: 'Ready for Pickup', icon: 'cube-outline', desc: 'Order is packed and ready' },
  { key: 'picked_up', label: 'Picked Up', icon: 'bicycle-outline', desc: 'Agent picked up your order' },
  { key: 'on_the_way', label: 'On the Way', icon: 'navigate-outline', desc: 'Your order is on the way' },
  { key: 'delivered', label: 'Delivered', icon: 'home-outline', desc: 'Delivered successfully! 🎉' },
]

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/api/orders/${id}`).then(({ data }) => setOrder(data)).finally(() => setLoading(false))
    // Poll every 30 seconds
    const interval = setInterval(() => {
      api.get(`/api/orders/${id}`).then(({ data }) => setOrder(data))
    }, 30000)
    return () => clearInterval(interval)
  }, [id])

  if (loading) return <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 80 }} />
  if (!order) return <View style={styles.center}><Text>Order not found</Text></View>

  const currentIdx = STATUS_STEPS.findIndex(s => s.key === order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</Text>
            <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
          </View>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalAmount}>{formatPrice(order.total)}</Text>
          </View>
        </View>
      </View>

      {/* Order Timeline */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Order Status</Text>

        {isCancelled ? (
          <View style={styles.cancelledBox}>
            <Ionicons name="close-circle" size={36} color="#ef4444" />
            <Text style={styles.cancelledText}>Order Cancelled</Text>
          </View>
        ) : (
          STATUS_STEPS.map((step, idx) => {
            const isDone = idx <= currentIdx
            const isCurrent = idx === currentIdx
            const isLast = idx === STATUS_STEPS.length - 1
            return (
              <View key={step.key} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineIcon, isDone && styles.timelineIconDone]}>
                    <Ionicons
                      name={step.icon as any}
                      size={16}
                      color={isDone ? '#fff' : '#9ca3af'}
                    />
                  </View>
                  {!isLast && <View style={[styles.timelineLine, idx < currentIdx && styles.timelineLineDone]} />}
                </View>
                <View style={[styles.timelineContent, isLast && { paddingBottom: 0 }]}>
                  <View style={styles.timelineRow}>
                    <Text style={[styles.timelineLabel, isDone && { color: COLORS.primary }]}>{step.label}</Text>
                    {isCurrent && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>Now</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.timelineDesc, !isDone && { color: '#d1d5db' }]}>{step.desc}</Text>
                </View>
              </View>
            )
          })
        )}
      </View>

      {/* Delivery Address */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Delivery Address</Text>
        <View style={styles.addressRow}>
          <Ionicons name="location" size={18} color={COLORS.primary} />
          <Text style={styles.addressText}>{order.deliveryAddress}</Text>
        </View>
      </View>

      {/* Delivery Agent */}
      {order.agentId && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Agent</Text>
          <View style={styles.agentRow}>
            <View style={styles.agentAvatar}>
              <Text style={styles.agentAvatarText}>
                {order.agentId?.userId?.name?.[0]?.toUpperCase() || 'A'}
              </Text>
            </View>
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{order.agentId?.userId?.name || 'Agent'}</Text>
              <Text style={styles.agentPhone}>{order.agentId?.userId?.phone || 'N/A'}</Text>
            </View>
            <View style={styles.callBtn}>
              <Ionicons name="call" size={18} color={COLORS.primary} />
            </View>
          </View>
        </View>
      )}

      {/* Order Items */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Order Items ({order.items?.length})</Text>
        {order.items?.map((item: any) => {
          const p = item.productId
          const imgSrc = p?.imageUrl || `https://source.unsplash.com/100x100/?${encodeURIComponent(p?.name || 'grocery')},food`
          return (
            <View key={item._id} style={styles.itemRow}>
              <Image source={{ uri: imgSrc }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{p?.name}</Text>
                <Text style={styles.itemQty}>x{item.quantity} × {formatPrice(item.price)}</Text>
              </View>
              <Text style={styles.itemTotal}>{formatPrice(item.price * item.quantity)}</Text>
            </View>
          )
        })}

        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Payment Status</Text>
          <Text style={[styles.summaryValue, { color: order.paymentStatus === 'paid' ? COLORS.primary : '#d97706' }]}>
            {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.totalSummaryLabel}>Total Paid</Text>
          <Text style={styles.totalSummaryValue}>{formatPrice(order.total)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={18} color={COLORS.primary} />
        <Text style={styles.backBtnText}>Back to Orders</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { backgroundColor: COLORS.primary, padding: 20, paddingBottom: 28 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: 18, fontWeight: '800', color: '#fff' },
  orderDate: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 3 },
  totalContainer: { alignItems: 'flex-end' },
  totalLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  totalAmount: { fontSize: 22, fontWeight: '900', color: '#fff' },
  card: { backgroundColor: '#fff', margin: 12, marginBottom: 0, marginTop: 12, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#d1fae5' },
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.dark, marginBottom: 16 },
  timelineItem: { flexDirection: 'row', gap: 12 },
  timelineLeft: { alignItems: 'center' },
  timelineIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#d1fae5' },
  timelineIconDone: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#e5e7eb', marginVertical: 4, minHeight: 20 },
  timelineLineDone: { backgroundColor: COLORS.accent },
  timelineContent: { flex: 1, paddingBottom: 16 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timelineLabel: { fontSize: 14, fontWeight: '700', color: '#9ca3af' },
  currentBadge: { backgroundColor: '#d1fae5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  currentBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.primary },
  timelineDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  cancelledBox: { alignItems: 'center', paddingVertical: 16, gap: 8 },
  cancelledText: { fontSize: 16, fontWeight: '700', color: '#ef4444' },
  addressRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  addressText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 22 },
  agentRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  agentAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  agentAvatarText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  agentInfo: { flex: 1 },
  agentName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  agentPhone: { fontSize: 13, color: '#6b7280' },
  callBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  itemImage: { width: 52, height: 52, borderRadius: 12, backgroundColor: '#f0fdf4' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  itemQty: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  itemTotal: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  summaryDivider: { height: 1, backgroundColor: '#d1fae5', marginVertical: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { fontSize: 14, color: '#6b7280' },
  summaryValue: { fontSize: 14, fontWeight: '600' },
  totalSummaryLabel: { fontSize: 16, fontWeight: '800', color: COLORS.dark },
  totalSummaryValue: { fontSize: 18, fontWeight: '900', color: COLORS.primary },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', margin: 16, padding: 14, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#d1fae5' },
  backBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
})
