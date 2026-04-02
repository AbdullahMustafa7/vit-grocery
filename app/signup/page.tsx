'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Leaf, Mail, Lock, User, Phone, CheckCircle, XCircle } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const passwordRules = [
  { regex: /.{8,}/, label: 'At least 8 characters' },
  { regex: /[A-Z]/, label: 'One uppercase letter' },
  { regex: /\d/, label: 'One number' },
  { regex: /[@$!%*?&]/, label: 'One special character (@$!%*?&)' },
]

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'customer' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validate = (field?: string): Record<string, string> => {
    const e: Record<string, string> = {}
    const f = form

    if (!field || field === 'name') {
      if (!f.name.trim()) e.name = 'Name is required'
      else if (f.name.trim().length < 2) e.name = 'Name must be at least 2 characters'
    }
    if (!field || field === 'email') {
      if (!f.email.trim()) e.email = 'Email is required'
      else if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email address'
    }
    if (!field || field === 'password') {
      if (!f.password) e.password = 'Password is required'
      else if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(f.password)) {
        e.password = 'Password does not meet requirements'
      }
    }
    if (!field || field === 'phone') {
      if (f.phone && !/^[6-9]\d{9}$/.test(f.phone)) {
        e.phone = 'Enter a valid 10-digit Indian phone number'
      }
    }
    return e
  }

  const handleChange = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    if (touched[field]) {
      const e = validate(field)
      setErrors((prev) => ({ ...prev, [field]: e[field] || '' }))
    }
  }

  const handleBlur = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }))
    const e = validate(field)
    setErrors((prev) => ({ ...prev, [field]: e[field] || '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const allErrors = validate()
    setErrors(allErrors)
    setTouched({ name: true, email: true, password: true, phone: true })
    if (Object.values(allErrors).some(Boolean)) return

    setLoading(true)
    try {
      const { data } = await axios.post('/api/auth/signup', form)
      toast.success(data.message)
      router.push('/login')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (field: string) =>
    `w-full py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-400/20 ${
      errors[field] && touched[field]
        ? 'border-red-300 bg-red-50 focus:border-red-400'
        : 'border-gray-200 focus:border-green-400'
    }`

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-green-900">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">Join VIT Grocery today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder="John Doe"
                  className={`${inputClass('name')} pl-10 pr-4`}
                />
              </div>
              {errors.name && touched.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="you@example.com"
                  className={`${inputClass('email')} pl-10 pr-4`}
                />
              </div>
              {errors.email && touched.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="Min 8 chars, uppercase, number, special"
                  className={`${inputClass('password')} pl-10 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength */}
              {form.password && (
                <div className="mt-2 space-y-1">
                  {passwordRules.map((rule) => {
                    const ok = rule.regex.test(form.password)
                    return (
                      <div key={rule.label} className="flex items-center gap-1.5 text-xs">
                        {ok ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-gray-300" />
                        )}
                        <span className={ok ? 'text-green-600' : 'text-gray-400'}>{rule.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <span className="absolute left-9 top-1/2 -translate-y-1/2 text-gray-500 text-sm">+91</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  onBlur={() => handleBlur('phone')}
                  placeholder="9876543210"
                  className={`${inputClass('phone')} pl-16 pr-4`}
                />
              </div>
              {errors.phone && touched.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Type</label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 bg-white"
              >
                <option value="customer">🛒 Customer – Buy groceries</option>
                <option value="vendor">🏪 Vendor – Sell products</option>
                <option value="agent">🚚 Delivery Agent – Deliver orders</option>
              </select>
              {(form.role === 'vendor' || form.role === 'agent') && (
                <p className="text-amber-600 text-xs mt-1.5 flex items-center gap-1">
                  ⚠️ Your account will require admin approval before login.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 shadow-sm hover:shadow-md flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-green-600 font-medium hover:text-green-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
