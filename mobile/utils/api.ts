import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Production URL — update this after deploying to Vercel
// For local testing on a physical device, use your machine's local IP e.g. 'http://192.168.1.100:3000'
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://vit-grocery.vercel.app'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('vitgrocery_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)

export const COLORS = {
  primary: '#16a34a',
  secondary: '#15803d',
  light: '#f0fdf4',
  accent: '#86efac',
  dark: '#14532d',
  white: '#ffffff',
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  border: '#d1fae5',
  error: '#ef4444',
}

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
}
