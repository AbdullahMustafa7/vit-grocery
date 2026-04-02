import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api, COLORS } from '@/utils/api'

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passError, setPassError] = useState('')

  const validate = () => {
    let valid = true
    if (!email.trim()) { setEmailError('Email is required'); valid = false }
    else if (!/^\S+@\S+\.\S+$/.test(email)) { setEmailError('Enter a valid email'); valid = false }
    else setEmailError('')
    if (!password) { setPassError('Password is required'); valid = false }
    else setPassError('')
    return valid
  }

  const handleLogin = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      // For mobile, we call the API directly using credentials
      const { data } = await api.post('/api/auth/mobile-login', { email, password })
      await AsyncStorage.setItem('vitgrocery_token', data.token)
      await AsyncStorage.setItem('vitgrocery_user', JSON.stringify(data.user))
      router.replace('/(tabs)' as any)
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.'
      Alert.alert('Login Failed', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Ionicons name="leaf" size={32} color="#fff" />
          </View>
          <Text style={styles.logoText}>VIT Grocery</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputWrapper, emailError && styles.inputError]}>
              <Ionicons name="mail-outline" size={18} color="#9ca3af" />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(t) => { setEmail(t); setEmailError('') }}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9ca3af"
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputWrapper, passError && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={(t) => { setPassword(t); setPassError('') }}
                placeholder="Your password"
                secureTextEntry={!showPass}
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            {passError ? <Text style={styles.errorText}>{passError}</Text> : null}
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.loginBtnText}>Sign In</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Demo accounts */}
        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>Demo Accounts:</Text>
          {[
            ['🛡️ Admin', 'admin@vitgrocery.com', 'Admin@123'],
            ['🏪 Vendor', 'vendor@vitgrocery.com', 'Vendor@123'],
            ['🚚 Agent', 'agent@vitgrocery.com', 'Agent@123'],
            ['🛒 Customer', 'customer@vitgrocery.com', 'Customer@123'],
          ].map(([role, em, pass]) => (
            <TouchableOpacity key={em} style={styles.demoItem} onPress={() => { setEmail(em); setPassword(pass) }}>
              <Text style={styles.demoText}>{role}: {em}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/signup' as any)}>
            <Text style={styles.signupLink}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  content: { padding: 24, paddingTop: 40 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 72, height: 72, backgroundColor: COLORS.primary, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  logoText: { fontSize: 26, fontWeight: '900', color: COLORS.dark },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  form: { backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#d1fae5' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: '#d1fae5', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13 },
  inputError: { borderColor: '#fca5a5', backgroundColor: '#fff5f5' },
  input: { flex: 1, fontSize: 14, color: '#111827' },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 4 },
  loginBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 16, marginTop: 8 },
  loginBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  demoBox: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#d1fae5', marginBottom: 20 },
  demoTitle: { fontSize: 12, fontWeight: '700', color: COLORS.dark, marginBottom: 8 },
  demoItem: { paddingVertical: 4 },
  demoText: { fontSize: 12, color: COLORS.primary },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  signupText: { color: '#6b7280', fontSize: 14 },
  signupLink: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
})
