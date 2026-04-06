import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { verify } from 'jsonwebtoken'

export async function getUser(req: Request) {
  // Try NextAuth session first (web)
  const session = await getServerSession(authOptions)
  if (session?.user) return session.user

  // Try Bearer token (mobile)
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    try {
      const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as any
      return { id: decoded.id, email: decoded.email, role: decoded.role, name: decoded.name }
    } catch {}
  }
  return null
}
