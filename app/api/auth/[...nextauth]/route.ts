import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectDB } from '@/lib/mongoose'
import { User, Vendor, DeliveryAgent } from '@/lib/models'

export const dynamic = 'force-dynamic'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        await connectDB()

        const user = await User.findOne({ email: credentials.email.toLowerCase() })

        if (!user) {
          throw new Error('No account found with this email')
        }

        // Check account lock
        if (user.lockUntil && user.lockUntil > new Date()) {
          const minutesLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000)
          throw new Error(`Account locked. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}`)
        }

        const isValid = await user.comparePassword(credentials.password)

        if (!isValid) {
          user.loginAttempts = (user.loginAttempts || 0) + 1

          if (user.loginAttempts >= 5) {
            user.lockUntil = new Date(Date.now() + 15 * 60 * 1000)
            user.loginAttempts = 0
            await user.save()
            throw new Error('Too many failed attempts. Account locked for 15 minutes')
          }

          await user.save()
          const remaining = 5 - user.loginAttempts
          throw new Error(`Incorrect password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining`)
        }

        // Reset on success
        user.loginAttempts = 0
        user.lockUntil = undefined
        await user.save()

        if ((user.role === 'vendor' || user.role === 'agent') && !user.approved) {
          throw new Error('Account pending admin approval. Please wait for approval.')
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
