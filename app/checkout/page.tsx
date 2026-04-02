'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import { MapPin, CreditCard, CheckCircle, Lock, Truck, ArrowRight, Banknote } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { data: session } = useSession()

  const [step, setStep] = useState<'address' | 'payment' | 'confirm'>('address')
  const [address, setAddress] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [orderSummary, setOrderSummary] = useState<any>(null)
  const [cart, setCart] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [cardReady, setCardReady] = useState(false)
  const [addressError, setAddressError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cod'>('stripe')

  useEffect(() => {
    axios.get('/api/cart').then(({ data }) => setCart(data))
  }, [])

  const proceedToPayment = async () => {
    if (!address.trim()) {
      setAddressError('Please enter your delivery address')
      return
    }
    if (address.trim().length < 10) {
      setAddressError('Please enter a more detailed address')
      return
    }

    setLoading(true)
    try {
      if (paymentMethod === 'cod') {
        // Skip Stripe, go straight to payment step for COD confirmation
        const cartItems = cart?.items || []
        const sub = cartItems.reduce((s: number, i: any) => s + (i.productId?.price || 0) * i.quantity, 0)
        const delivery = sub > 499 ? 0 : 40
        setOrderSummary({ subtotal: sub, deliveryCharge: delivery, total: sub + delivery })
        setStep('payment')
      } else {
        const { data } = await axios.post('/api/checkout', { deliveryAddress: address })
        setClientSecret(data.clientSecret)
        setOrderSummary(data)
        setStep('payment')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to setup payment')
    } finally {
      setLoading(false)
    }
  }

  const handleCODOrder = async () => {
    setLoading(true)
    try {
      const items = cart.items.map((item: any) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price,
      }))
      const { data: order } = await axios.post('/api/orders', {
        items,
        deliveryAddress: address,
        total: orderSummary.total,
        paymentMethod: 'cod',
      })
      await axios.delete('/api/cart?clearAll=true')
      router.push(`/orders/${order._id}?success=true`)
    } catch {
      toast.error('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements || !clientSecret) return

    setLoading(true)
    const card = elements.getElement(CardElement)
    if (!card) return

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card, billing_details: { name: session?.user?.name, email: session?.user?.email } },
    })

    if (error) {
      toast.error(error.message || 'Payment failed')
      setLoading(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      // Create order
      try {
        const items = cart.items.map((item: any) => ({
          productId: item.productId._id,
          quantity: item.quantity,
          price: item.productId.price,
        }))

        const { data: order } = await axios.post('/api/orders', {
          items,
          deliveryAddress: address,
          stripePaymentIntentId: paymentIntent.id,
          total: orderSummary.total,
        })

        // Clear cart
        await axios.delete('/api/cart?clearAll=true')
        setStep('confirm')
        router.push(`/orders/${order._id}?success=true`)
      } catch {
        toast.error('Order creation failed but payment succeeded. Contact support.')
      }
    }
    setLoading(false)
  }

  const steps = [
    { key: 'address', label: 'Address', icon: MapPin },
    { key: 'payment', label: 'Payment', icon: CreditCard },
    { key: 'confirm', label: 'Confirm', icon: CheckCircle },
  ]

  const cartItems = cart?.items || []
  const subtotal = cartItems.reduce((s: number, i: any) => s + (i.productId?.price || 0) * i.quantity, 0)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
      <h1 className="text-2xl font-bold text-green-900 mb-8">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center justify-center mb-10">
        {steps.map((s, i) => {
          const Icon = s.icon
          const isDone = steps.findIndex((st) => st.key === step) > i
          const isCurrent = s.key === step
          return (
            <div key={s.key} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isCurrent ? 'bg-green-600 text-white shadow-lg' : isDone ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-medium ${isCurrent ? 'text-green-700' : isDone ? 'text-green-500' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 w-16 sm:w-24 mx-2 mb-5 ${isDone ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main form */}
        <div className="lg:col-span-2">
          {/* Step 1: Address */}
          {step === 'address' && (
            <div className="bg-white rounded-2xl border border-green-100 p-6 animate-slide-up">
              <h2 className="font-bold text-green-900 text-lg mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Delivery Address
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Delivery Address
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => { setAddress(e.target.value); setAddressError('') }}
                    placeholder="Enter your complete delivery address including flat no., street, area, city, pincode..."
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-green-400/20 resize-none ${addressError ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-green-400'}`}
                  />
                  {addressError && <p className="text-red-500 text-xs mt-1">{addressError}</p>}
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'stripe' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}
                  >
                    <CreditCard className={`w-5 h-5 ${paymentMethod === 'stripe' ? 'text-green-600' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <p className={`text-sm font-semibold ${paymentMethod === 'stripe' ? 'text-green-800' : 'text-gray-700'}`}>Card / Online</p>
                      <p className="text-xs text-gray-500">Pay now securely</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'cod' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}
                  >
                    <Banknote className={`w-5 h-5 ${paymentMethod === 'cod' ? 'text-green-600' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <p className={`text-sm font-semibold ${paymentMethod === 'cod' ? 'text-green-800' : 'text-gray-700'}`}>Pay on Delivery</p>
                      <p className="text-xs text-gray-500">Cash at doorstep</p>
                    </div>
                  </button>
                </div>
              </div>

              <button
                onClick={proceedToPayment}
                disabled={loading}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-semibold transition-colors disabled:opacity-60"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>{paymentMethod === 'cod' ? 'Review Order' : 'Continue to Payment'} <ArrowRight className="w-5 h-5" /></>}
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 'payment' && paymentMethod === 'cod' && (
            <div className="bg-white rounded-2xl border border-green-100 p-6 animate-slide-up">
              <h2 className="font-bold text-green-900 text-lg mb-5 flex items-center gap-2">
                <Banknote className="w-5 h-5 text-green-600" />
                Pay on Delivery
              </h2>

              <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-200 text-sm text-green-700 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Delivering to: <span className="font-medium line-clamp-1">{address}</span>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 mb-6">
                <div className="flex items-start gap-3">
                  <Banknote className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800 text-sm">Cash on Delivery</p>
                    <p className="text-xs text-amber-700 mt-1">Please keep exact change ready. Our delivery agent will collect <strong>{orderSummary && formatPrice(orderSummary.total)}</strong> at your doorstep.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCODOrder}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold text-lg transition-colors disabled:opacity-60 shadow-md"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Place Order · {orderSummary && formatPrice(orderSummary.total)}
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'payment' && paymentMethod === 'stripe' && (
            <div className="bg-white rounded-2xl border border-green-100 p-6 animate-slide-up">
              <h2 className="font-bold text-green-900 text-lg mb-5 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                Payment Details
              </h2>

              <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-200 text-sm text-green-700 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Delivering to: <span className="font-medium line-clamp-1">{address}</span>
              </div>

              <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-700">
                <strong>Test Card:</strong> 4242 4242 4242 4242 | Exp: any future date | CVV: any 3 digits
              </div>

              <form onSubmit={handlePayment}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Card Information</label>
                  <div className="p-4 border border-gray-200 rounded-xl focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-400/20 transition-colors">
                    <CardElement
                      options={{
                        style: {
                          base: { fontSize: '16px', color: '#111827', '::placeholder': { color: '#9ca3af' } },
                          invalid: { color: '#ef4444' },
                        },
                      }}
                      onChange={(e) => setCardReady(e.complete)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
                  <Lock className="w-3.5 h-3.5" />
                  Your payment is secured with 256-bit SSL encryption powered by Stripe
                </div>

                <button
                  type="submit"
                  disabled={!stripe || !cardReady || loading}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold text-lg transition-colors disabled:opacity-60 shadow-md"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Pay {orderSummary && formatPrice(orderSummary.total)}
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-2xl border border-green-100 p-6 sticky top-20">
            <h3 className="font-bold text-green-900 text-lg mb-4">Order Summary</h3>

            {cartItems.slice(0, 3).map((item: any) => {
              const p = item.productId
              if (!p) return null
              return (
                <div key={p._id} className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex-shrink-0 relative overflow-hidden">
                    <Image
                      src={p.imageUrl || `https://source.unsplash.com/50x50/?${encodeURIComponent(p.name)}`}
                      alt={p.name} fill className="object-cover" unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 line-clamp-1">{p.name}</p>
                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-green-700">{formatPrice(p.price * item.quantity)}</span>
                </div>
              )
            })}
            {cartItems.length > 3 && (
              <p className="text-xs text-gray-400 mb-3">+{cartItems.length - 3} more items</p>
            )}

            <div className="border-t border-green-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(orderSummary?.subtotal || subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className={orderSummary?.deliveryCharge === 0 ? 'text-green-600 font-medium' : ''}>
                  {orderSummary ? (orderSummary.deliveryCharge === 0 ? 'FREE' : formatPrice(orderSummary.deliveryCharge)) : (subtotal > 499 ? 'FREE' : formatPrice(40))}
                </span>
              </div>
              <div className="flex justify-between font-bold text-green-900 text-lg pt-2 border-t border-green-100">
                <span>Total</span>
                <span>{formatPrice(orderSummary?.total || subtotal + (subtotal > 499 ? 0 : 40))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  )
}
