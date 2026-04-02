import Link from 'next/link'
import { Leaf, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-green-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-green-300" />
              </div>
              <span className="text-xl font-bold">VIT Grocery</span>
            </div>
            <p className="text-green-300 text-sm leading-relaxed max-w-xs">
              Fresh groceries delivered to your doorstep in 30 minutes. Quality products, unbeatable prices, lightning-fast delivery.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-green-300 text-sm">
                <Mail className="w-4 h-4" />
                <span>support@vitgrocery.com</span>
              </div>
              <div className="flex items-center gap-2 text-green-300 text-sm">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-green-300 text-sm">
                <MapPin className="w-4 h-4" />
                <span>VIT Campus, Vellore, Tamil Nadu</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/products', label: 'Products' },
                { href: '/orders', label: 'My Orders' },
                { href: '/cart', label: 'Cart' },
                { href: '/login', label: 'Login' },
                { href: '/signup', label: 'Register' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-green-300 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white mb-4">Categories</h4>
            <ul className="space-y-2">
              {['Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Beverages', 'Snacks', 'Meat'].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/products?search=${cat}`}
                    className="text-green-300 hover:text-white text-sm transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-green-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-green-400 text-sm">
            © 2024 VIT Grocery. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-green-400 text-xs">Made with ❤️ for VIT students</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
