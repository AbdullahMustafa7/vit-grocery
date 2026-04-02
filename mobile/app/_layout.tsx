import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from '@/context/AuthContext'

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor="#16a34a" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#16a34a' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#f9fafb' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Sign In', headerBackTitle: 'Back' }} />
        <Stack.Screen name="signup" options={{ title: 'Create Account', headerBackTitle: 'Back' }} />
        <Stack.Screen name="products/[id]" options={{ title: 'Product Details' }} />
        <Stack.Screen name="checkout" options={{ title: 'Checkout', headerBackTitle: 'Cart' }} />
        <Stack.Screen name="orders/[id]" options={{ title: 'Order Details', headerBackTitle: 'Orders' }} />
      </Stack>
    </AuthProvider>
  )
}
