import { NuxtAuthHandler } from '#auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getDb } from '../users/users-db';
import bcrypt from 'bcrypt';

// Define a local interface that includes password and is_admin, which are present in the DB but not in the exported User type
interface DBUser {
  id: number;
  username: string;
  password?: string;
  is_admin?: number | boolean;
  is_approved?: number | boolean;
}

console.log('Auth handler loading, environment variables:', {
  hasAuthSecret: !!process.env.AUTH_SECRET,
  hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
  hasAuthOrigin: !!process.env.AUTH_ORIGIN,
  nextAuthUrl: process.env.NEXTAUTH_URL,
  authOrigin: process.env.AUTH_ORIGIN,
});

export default NuxtAuthHandler({
  secret: process.env.AUTH_SECRET,
  pages: {
    login: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as number;
        session.user.username = token.username as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle redirect after login
      // If baseUrl is undefined, use a default
      const redirectUrl = baseUrl || 'https://expenses.tehj.io';
      console.log('Redirect callback called:', { url, baseUrl, redirectUrl });
      return redirectUrl;
    },
  },
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR.
    CredentialsProvider.default({
      name: 'Credentials',
      credentials: {
        username: {
          label: 'Username',
          type: 'text',
          placeholder: '(hint: admin)',
        },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: '(hint: admin)',
        },
      },
      async authorize(credentials: any) {
        console.log('Auth authorize called with credentials:', {
          username: credentials?.username,
          hasPassword: !!credentials?.password
        });

        if (!credentials?.username || !credentials?.password) {
          console.log('Auth failed: missing username or password');
          return null;
        }

        try {
          const db = getDb();
          console.log('Database connection obtained, querying for user:', credentials.username);

          const user = db
            .prepare('SELECT * FROM users WHERE username = ?')
            .get(credentials.username) as DBUser;

          console.log('User query result:', user ? {
            id: user.id,
            username: user.username,
            is_approved: user.is_approved,
            has_password: !!user.password
          } : 'User not found');

          if (!user) {
            console.log('Auth failed: user not found');
            return null;
          }

          if (!user.is_approved) {
            console.log('Auth failed: user not approved');
            return null;
          }

          // Verify password
          console.log('Verifying password...');
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password || ''
          );
          console.log('Password verification result:', isValid);

          if (!isValid) {
            console.log('Auth failed: invalid password');
            return null;
          }

          console.log('Auth successful for user:', user.username);
          return {
            id: user.id,
            username: user.username,
            isAdmin: !!user.is_admin,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
});
