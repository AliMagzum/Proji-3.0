import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export type UserRole = 'admin' | 'employee';

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
      allowedDomains: string[];
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: UserRole;
    allowedDomains?: string[];
  }
}

const googleConfigured =
  Boolean(process.env.GOOGLE_CLIENT_ID) && Boolean(process.env.GOOGLE_CLIENT_SECRET);

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? 'proji-dev-secret-change-in-prod',
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/login' },

  providers: googleConfigured
    ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          // Default openid-client timeout is 3.5s — too short on slow/VPN networks
          httpOptions: { timeout: 20000 },
          authorization: {
            params: {
              prompt: 'consent',
              access_type: 'offline',
              response_type: 'code',
            },
          },
        }),
      ]
    : [],

  callbacks: {
    jwt({ token, user, account }) {
      if (user || account) {
        token.role = 'employee';
        token.allowedDomains = ['Общий'];
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as UserRole) ?? 'employee';
        session.user.allowedDomains = (token.allowedDomains as string[]) ?? ['Общий'];
      }
      return session;
    },
  },
};

export const isGoogleAuthConfigured = googleConfigured;

export default NextAuth(authOptions);
