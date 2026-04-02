import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { api, COLORS } from '@/utils/api'

export default function SignupScreen() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'customer' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password) {
      Alert.alert('Error', 'Please fill all required fields')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/signup', form)
      Alert.alert('Success!', data.message, [{ text: 'Sign In', onPress: () => router.replace('/login' as any) }])
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logo}><Ionicons name="leaf" size={28} color="#fff" /></View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join VIT Grocery today</Text>
        </View>

        <View style={styles.form}>
          {[
            { key: 'name', label: 'Full Name *', placeholder: 'John Doe', icon: 'person-outline' },
            { key: 'email', label: 'Email *', placeholder: 'you@example.com', icon: 'mail-outline', keyboard: 'email-address' },
            { key: 'phone', label: 'Phone (optional)', placeholder: '9876543210', icon: 'call-outline', keyboard: 'phone-pad' },
          ].map(({ key, label, placeholder, icon, keyboard }) => (
            <View key={key} style={styles.inputGroup}>
              <Text style={styles.label}>{label}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name={icon as any} size={18} color="#9ca3af" />
                <TextInput
                  style={styles.input}
                  value={(form as any)[key]}
                  onChangeText={(t) => setForm(f => ({ ...f, [key]: t }))}
                  placeholder={placeholder}
                  keyboardType={(keyboard as any) || 'default'}
                  autoCapitalize={key === 'email' ? 'none' : 'words'}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          ))}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" />
              <TextInput
                style={styles.input}
                value={form.password}
                onChangeText={(t) => setForm(f => ({ ...f, password: t }))}
                placeholder="Min 8 chars, uppercase, number, special"
                secureTextEntry={!showPass}
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Type</Text>
            <View style={styles.roleContainer}>
              {[
                { value: 'customer', label: '🛒 Customer', desc: 'Buy groceries' },
                { value: 'vendor', label: '🏪 Vendor', desc: 'Sell products' },
                { value: 'agent', label: '🚚 Agent', desc: 'Deliver orders' },
              ].map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[styles.roleOption, form.role === role.value && styles.roleSelected]}
                  onPress={() => setForm(f => ({ ...f, role: role.value }))}
                >
                  <Text style={[styles.roleLabel, form.role === role.value && { color: COLORS.primary }]}>{role.label}</Text>
                  <Text style={styles.roleDesc}>{role.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {(form.role === 'vendor' || form.role === 'agent') && (
              <Text style={styles.approvalNote}>⚠️ Requires admin approval before login</Text>
            )}
          </View>

          <TouchableOpacity style={styles.signupBtn} onPress={handleSignup} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signupBtnText}>Create Account</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/login' as any)}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  content: { padding: 24, paddingTop: 30 },
  header: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 64, height: 64, backgroundColor: COLORS.primary, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '900', color: COLORS.dark },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  form: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#d1fae5' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: '#d1fae5', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
  input: { flex: 1, fontSize: 14, color: '#111827' },
  roleContainer: { flexDirection: 'row', gap: 8 },
  roleOption: { flex: 1, padding: 10, borderRadius: 12, borderWidth: 2, borderColor: '#d1fae5', alignItems: 'center' },
  roleSelected: { borderColor: COLORS.primary, backgroundColor: '#f0fdf4' },
  roleLabel: { fontSize: 12, fontWeight: '700', color: '#374151', textAlign: 'center' },
  roleDesc: { fontSize: 10, color: '#9ca3af', marginTop: 2 },
  approvalNote: { fontSize: 12, color: '#d97706', marginTop: 8 },
  signupBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 8 },
  signupBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  loginText: { color: '#6b7280', fontSize: 14 },
  loginLink: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
})
