import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/utils/api'
import { useAuth } from '@/context/AuthContext'

export default function TabsLayout() {
  const { user } = useAuth()
  const role = user?.role

  const tabStyle = {
    tabBarActiveTintColor: COLORS.primary,
    tabBarInactiveTintColor: COLORS.gray,
    tabBarStyle: {
      backgroundColor: '#fff',
      borderTopColor: COLORS.border,
      borderTopWidth: 1,
      paddingBottom: 8,
      paddingTop: 4,
      height: 64,
    },
    tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as const },
    headerStyle: { backgroundColor: COLORS.primary },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: 'bold' as const, fontSize: 18 },
  }

  const isVendorOrAgent = role === 'vendor' || role === 'agent'

  return (
    <Tabs screenOptions={tabStyle}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'VIT Grocery',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />

      {/* Dashboard — only for vendor/agent */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: role === 'agent' ? 'Agent Dashboard' : 'Vendor Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} />,
          href: isVendorOrAgent ? undefined : null,
        }}
      />

      {/* Products — only for customers */}
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color, size }) => <Ionicons name="storefront" size={size} color={color} />,
          href: isVendorOrAgent ? null : undefined,
        }}
      />

      {/* Cart — only for customers */}
      <Tabs.Screen
        name="cart"
        options={{
          title: 'My Cart',
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, size }) => <Ionicons name="cart" size={size} color={color} />,
          href: isVendorOrAgent ? null : undefined,
        }}
      />

      {/* Orders — for all roles */}
      <Tabs.Screen
        name="orders"
        options={{
          title: role === 'vendor' ? 'Manage Orders' : role === 'agent' ? 'My Deliveries' : 'My Orders',
          tabBarLabel: role === 'agent' ? 'Deliveries' : 'Orders',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={role === 'agent' ? 'bicycle' : 'receipt'} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
