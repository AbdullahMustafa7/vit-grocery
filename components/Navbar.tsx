'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, Menu, X, Leaf, User, LogOut, Package, Store, Truck, Shield, ChevronDown } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import SearchBar from '@/components/SearchBar'

export default function Navbar() {
  const { data: session } = useSession()
  const { itemCount } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  const role = session?.user?.role
  const roleLinks: Record<string, { href: string; label: string; icon: any }[]> = {
    vendor: [
      { href: '/vendor/dashboard', label: 'Dashboard', icon: Store },
      { href: '/vendor/products', label: 'Products', icon: Package },
      { href: '/vendor/orders', label: 'Orders', icon: ShoppingCart },
    ],
    agent: [
      { href: '/agent/dashboard', label: 'Dashboard', icon: Truck },
      { href: '/agent/deliveries', label: 'Deliveries', icon: Package },
    ],
    admin: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: Shield },
      { href: '/admin/users', label: 'Users', icon: User },
      { href: '/admin/orders', label: 'Orders', icon: Package },
      { href: '/admin/products', label: 'Products', icon: Store },
    ],
  }

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-green-100'
          : 'bg-white border-b border-green-100'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-green-700 hidden sm:block">
              VIT <span className="text-green-500">Grocery</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: '/', label: 'Home' },
              { href: '/products', label: 'Products' },
              ...(session?.user?.role === 'customer' ? [{ href: '/orders', label: 'My Orders' }] : []),
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-green-700 bg-green-50'
                    : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
                )}
              >
                {link.label}
              </Link>
            ))}
            {role && roleLinks[role]?.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname.startsWith(link.href)
                    ? 'text-green-700 bg-green-50'
                    : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xs mx-4">
            <SearchBar />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            {(session?.user?.role === 'customer' || !session) && (
              <Link
                href="/cart"
                className="relative p-2 rounded-xl text-gray-600 hover:text-green-700 hover:bg-green-50 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce-light">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* User menu */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {session.user.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-green-800 max-w-[100px] truncate">
                    {session.user.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-green-600 hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-green-100 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-green-50">
                      <p className="text-sm font-semibold text-green-800">{session.user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                      <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full capitalize">
                        {session.user.role}
                      </span>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="hidden sm:block text-sm font-medium text-green-700 hover:text-green-800 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-green-50 transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-green-100 px-4 py-3 space-y-1 animate-fade-in">
          <div className="pb-2">
            <SearchBar />
          </div>
          {[
            { href: '/', label: 'Home' },
            { href: '/products', label: 'Products' },
            ...(session?.user?.role === 'customer' ? [{ href: '/orders', label: 'My Orders' }] : []),
            ...(session?.user?.role === 'customer' || !session ? [{ href: '/cart', label: 'Cart' }] : []),
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {role && roleLinks[role]?.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {!session && (
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1 text-center py-2.5 border border-green-300 text-green-700 rounded-xl text-sm font-medium">Login</Link>
              <Link href="/signup" className="flex-1 text-center py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium">Sign Up</Link>
            </div>
          )}
          {session && (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          )}
        </div>
      )}
    </nav>
  )
}
