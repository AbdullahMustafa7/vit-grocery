import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    const role = (token as any)?.role

    if (path.startsWith('/vendor') && role !== 'vendor' && role !== 'admin') {
      return NextResponse.redirect(new URL('/access-denied', req.url))
    }
    if (path.startsWith('/agent') && role !== 'agent' && role !== 'admin') {
      return NextResponse.redirect(new URL('/access-denied', req.url))
    }
    if (path.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/access-denied', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        const protectedPaths = ['/cart', '/checkout', '/orders', '/vendor', '/agent', '/admin']
        if (protectedPaths.some((p) => path.startsWith(p))) return !!token
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/cart/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/vendor/:path*',
    '/agent/:path*',
    '/admin/:path*',
  ],
}
