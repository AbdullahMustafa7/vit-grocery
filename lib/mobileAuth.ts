import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { verify } from 'jsonwebtoken'

export async function getUser(req: Request) {
  // Try Bearer token first (mobile) — faster and avoids cookie issues
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    try {
      const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as any
      return { id: decoded.id, email: decoded.email, role: decoded.role, name: decoded.name }
    } catch {}
  }

  // Fall back to NextAuth session (web)
  try {
    const session = await getServerSession(authOptions)
    if (session?.user) return session.user
  } catch {}

  return null
}
