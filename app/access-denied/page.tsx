import Link from 'next/link'
import { ShieldX, ArrowLeft } from 'lucide-react'

export default function AccessDeniedPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 page-transition">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Access Denied</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          You don&apos;t have permission to access this page. Please make sure you&apos;re logged in with the correct account type.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 border border-green-300 text-green-700 hover:bg-green-50 px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Switch Account
          </Link>
        </div>
      </div>
    </div>
  )
}
