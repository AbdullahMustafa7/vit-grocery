import React, { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { api, COLORS, formatPrice } from '@/utils/api'

export default function CheckoutScreen() {
  const router = useRouter()
  const [cart, setCart] = useState<any>(null)
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [addressError, setAddressError] = useState('')

  useEffect(() => {
    api.get('/api/cart').then(({ data }) => setCart(data)).finally(() => setLoading(false))
  }, [])

  const items = cart?.items || []
  const subtotal = items.reduce((s: number, i: any) => s + (i.productId?.price || 0) * i.quantity, 0)
  const deliveryCharge = subtotal > 499 ? 0 : 40
  const total = subtotal + deliveryCharge

  const handlePlaceOrder = async () => {
    if (!address.trim() || address.trim().length < 10) {
      setAddressError('Please enter a complete delivery address')
      return
    }

    Alert.alert(
      'Note: Stripe Payment',
      'For full Stripe payment integration in mobile, please use the web app at localhost:3000/checkout.\n\nThis demo will create a test order directly.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Place Test Order', onPress: async () => {
            setPlacing(true)
            try {
              const orderItems = items.map((item: any) => ({
                productId: item.productId._id,
                quantity: item.quantity,
                price: item.productId.price,
              }))
              const { data: order } = await api.post('/api/orders', {
                items: orderItems,
                deliveryAddress: address,
                total,
                stripePaymentIntentId: 'mobile_test_' + Date.now(),
              })
              await api.delete('/api/cart?clearAll=true')
              Alert.alert('Order Placed!', `Order #${order._id.slice(-6)} placed successfully!`, [
                { text: 'Track Order', onPress: () => router.replace('/orders' as any) },
              ])
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.error || 'Failed to place order')
            } finally {
              setPlacing(false)
            }
          },
        },
      ]
    )
  }

  if (loading) return <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 80 }} />

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <Ionicons name="location" size={16} color={COLORS.primary} /> Delivery Address
          </Text>
          <TextInput
            style={[styles.addressInput, addressError && styles.inputError]}
            value={address}
            onChangeText={(t) => { setAddress(t); setAddressError('') }}
            placeholder="Enter your complete delivery address including flat no., area, city, pincode..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#9ca3af"
          />
          {addressError ? <Text style={styles.errorText}>{addressError}</Text> : null}
        </View>

        {/* Stripe Notice */}
        <View style={styles.noticeCard}>
          <Ionicons name="information-circle" size={18} color="#d97706" />
          <Text style={styles.noticeText}>
            <Text style={{ fontWeight: '700' }}>Payment: </Text>
            For full Stripe card payment, use the web app. Mobile supports test orders.
          </Text>
        </View>

        {/* Test Card Info */}
        <View style={styles.testCard}>
          <Text style={styles.testCardTitle}>Stripe Test Cards (Web):</Text>
          <Text style={styles.testCardText}>✅ Success: 4242 4242 4242 4242</Text>
          <Text style={styles.testCardText}>❌ Decline: 4000 0000 0000 0002</Text>
          <Text style={styles.testCardText}>Exp: any future date | CVV: any 3 digits</Text>
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary ({items.length} items)</Text>

          {items.slice(0, 3).map((item: any) => {
            const p = item.productId
            if (!p) return null
            return (
              <View key={p._id} style={styles.summaryItem}>
                <Text style={styles.summaryItemName} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.summaryItemQty}>x{item.quantity}</Text>
                <Text style={styles.summaryItemPrice}>{formatPrice(p.price * item.quantity)}</Text>
              </View>
            )
          })}
          {items.length > 3 && (
            <Text style={styles.moreItems}>+{items.length - 3} more items</Text>
          )}

          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={[styles.summaryValue, deliveryCharge === 0 && { color: COLORS.primary, fontWeight: '700' }]}>
              {deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </View>

        {/* Secure badges */}
        <View style={styles.secureBadges}>
          {['🔒 SSL Secured', '💳 Stripe Powered', '✅ 100% Safe'].map(b => (
            <Text key={b} style={styles.secureBadge}>{b}</Text>
          ))}
        </View>

        <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder} disabled={placing}>
          {placing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={styles.placeOrderText}>Place Order · {formatPrice(total)}</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 14 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#d1fae5' },
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.dark, marginBottom: 12 },
  addressInput: { borderWidth: 1.5, borderColor: '#d1fae5', borderRadius: 14, padding: 14, fontSize: 14, color: '#111827', minHeight: 100, lineHeight: 22 },
  inputError: { borderColor: '#fca5a5' },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 6 },
  noticeCard: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: '#fffbeb', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#fde68a' },
  noticeText: { flex: 1, fontSize: 13, color: '#92400e', lineHeight: 20 },
  testCard: { backgroundColor: '#f0fdf4', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#d1fae5' },
  testCardTitle: { fontSize: 12, fontWeight: '700', color: COLORS.dark, marginBottom: 6 },
  testCardText: { fontSize: 12, color: '#374151', marginBottom: 2 },
  summaryItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  summaryItemName: { flex: 1, fontSize: 13, color: '#374151' },
  summaryItemQty: { fontSize: 12, color: '#9ca3af', marginRight: 12 },
  summaryItemPrice: { fontSize: 13, fontWeight: '600', color: '#374151' },
  moreItems: { fontSize: 12, color: '#9ca3af', marginBottom: 4 },
  divider: { height: 1, backgroundColor: '#d1fae5', marginVertical: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#6b7280' },
  summaryValue: { fontSize: 14, color: '#374151' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#d1fae5', paddingTop: 12, marginTop: 4, marginBottom: 0 },
  totalLabel: { fontSize: 17, fontWeight: '800', color: COLORS.dark },
  totalValue: { fontSize: 20, fontWeight: '900', color: COLORS.primary },
  secureBadges: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' },
  secureBadge: { fontSize: 12, color: '#6b7280' },
  placeOrderBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: 18, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  placeOrderText: { color: '#fff', fontWeight: '900', fontSize: 17 },
})
