import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: number;
      username: string;
      isAdmin: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    id: number;
    username: string;
    isAdmin: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: number;
    username: string;
    isAdmin: boolean;
  }
}
