import { NuxtAuthHandler } from '#auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { initializeDatabase } from '../users/users-db'
import bcrypt from 'bcrypt'

// Define a local interface that includes password and is_admin, which are present in the DB but not in the exported User type
interface DBUser {
  id: number;
  username: string;
  password?: string;
  is_admin?: number | boolean;
  is_approved?: number | boolean;
}

export default NuxtAuthHandler({
  secret: process.env.AUTH_SECRET,
  pages: {
    login: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.isAdmin = user.isAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as number
        session.user.username = token.username as string
        session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    }
  },
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR.
    CredentialsProvider.default({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: '(hint: admin)' },
        password: { label: 'Password', type: 'password', placeholder: '(hint: admin)' }
      },
      async authorize(credentials: any) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          const db = await initializeDatabase()
          const user = await db.get('SELECT * FROM users WHERE username = ?', credentials.username) as DBUser

          if (!user) {
             return null
          }

          if (!user.is_approved) {
            // Or handle not approved user
             return null
          }

          // Verify password
          const isValid = await bcrypt.compare(credentials.password, user.password || '')
          if (!isValid) {
             return null
          }

          return {
             id: user.id,
             username: user.username,
             isAdmin: !!user.is_admin
          }
        } catch (error) {
           console.error('Auth error:', error)
           return null
        }
      }
    })
  ]
})
