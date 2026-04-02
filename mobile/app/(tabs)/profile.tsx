import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { COLORS } from '@/utils/api'

export default function ProfileScreen() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    AsyncStorage.getItem('vitgrocery_user').then((data) => {
      if (data) setUser(JSON.parse(data))
    })
  }, [])

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive', onPress: async () => {
          await AsyncStorage.multiRemove(['vitgrocery_token', 'vitgrocery_user'])
          setUser(null)
          router.replace('/login' as any)
        },
      },
    ])
  }

  const menuItems = [
    { icon: 'receipt-outline', label: 'My Orders', onPress: () => router.push('/orders') },
    { icon: 'cart-outline', label: 'Cart', onPress: () => router.push('/cart') },
    { icon: 'storefront-outline', label: 'Browse Products', onPress: () => router.push('/products') },
    { icon: 'information-circle-outline', label: 'About VIT Grocery', onPress: () => {} },
  ]

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        </View>
        {user ? (
          <>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user.role || 'Customer'}</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.userName}>Welcome!</Text>
            <Text style={styles.userEmail}>Sign in to access your account</Text>
            <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/login' as any)}>
              <Text style={styles.loginBtnText}>Sign In</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.onPress}>
            <View style={styles.menuIconContainer}>
              <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </View>

      {user && (
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      )}

      {!user && (
        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/signup' as any)}>
            <Text style={styles.signupLink}>Create Account</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* App info */}
      <View style={styles.appInfo}>
        <Text style={styles.appName}>🌿 VIT Grocery</Text>
        <Text style={styles.appVersion}>Version 1.0.0</Text>
        <Text style={styles.appTagline}>Fresh groceries delivered in 30 minutes</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: COLORS.primary, paddingTop: 30, paddingBottom: 40, alignItems: 'center' },
  avatarContainer: { marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#fff' },
  userName: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  roleText: { color: '#fff', fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  loginBtn: { backgroundColor: '#fff', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 16, marginTop: 8 },
  loginBtnText: { color: COLORS.primary, fontWeight: '800', fontSize: 15 },
  menu: { backgroundColor: '#fff', margin: 16, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#d1fae5' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0fdf4', gap: 14 },
  menuIconContainer: { width: 36, height: 36, backgroundColor: '#f0fdf4', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#374151' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', margin: 16, marginTop: 0, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#fecaca', justifyContent: 'center' },
  logoutText: { color: '#ef4444', fontWeight: '700', fontSize: 15 },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: 16 },
  signupText: { color: '#6b7280', fontSize: 14 },
  signupLink: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  appInfo: { alignItems: 'center', padding: 24, paddingBottom: 40 },
  appName: { fontSize: 18, fontWeight: '800', color: COLORS.dark, marginBottom: 4 },
  appVersion: { fontSize: 12, color: '#9ca3af', marginBottom: 4 },
  appTagline: { fontSize: 12, color: '#9ca3af', textAlign: 'center' },
})
