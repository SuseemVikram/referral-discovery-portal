import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

// Type extensions for NextAuth
declare module "next-auth" {
  interface User {
    token?: string;
  }
  interface Session {
    token?: string;
  }
}

// Get API URL from environment (server-side)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Validate required environment variables
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
if (!AUTH_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('AUTH_SECRET or NEXTAUTH_SECRET must be set in production');
}

const authConfig = {
  trustHost: true,
  secret: AUTH_SECRET || "development-secret-change-in-production" as string,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  callbacks: {
    /**
     * Google OAuth should NEVER be blocked.
     * Backend failures must not deny login.
     */
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // Skip backend call only if API URL is not configured
          if (!API_BASE_URL) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('API_BASE_URL not configured, skipping backend auth');
            }
            return true;
          }

          const response = await fetch(`${API_BASE_URL}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              google_id: account.providerAccountId,
              email: user.email,
              name: user.name,
              image: user.image,
            }),
          });

          if (response.ok) {
            const data = await response.json();

            // Attach backend token if available
            if (data?.token) {
              user.token = data.token;
              if (process.env.NODE_ENV === 'development') {
                console.log('✅ Backend token received and attached to user');
              }
            } else {
              if (process.env.NODE_ENV === 'development') {
                console.warn('⚠️ Backend response OK but no token in response:', data);
              }
            }
          } else {
            // Log error in development for debugging
            const errorText = await response.text();
            if (process.env.NODE_ENV === 'development') {
              console.error(
                "❌ Backend Google auth failed:",
                response.status,
                response.statusText,
                errorText
              );
            }
          }
        } catch (error) {
          // Log error in development for debugging
          if (process.env.NODE_ENV === 'development') {
            console.error("Backend unreachable:", error);
          }
        }
      }

      // 🔥 ALWAYS allow OAuth login
      return true;
    },

    /**
     * Persist backend token in JWT
     * This callback is called on initial sign-in and on every request
     */
    async jwt({ token, user, trigger }) {
      // On initial sign-in, user object contains the token
      if (user?.token) {
        (token as any).accessToken = user.token;
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Token stored in JWT on initial sign-in');
        }
      }
      // On subsequent calls, user is undefined, so we preserve the existing token
      // The token.accessToken should already be set from the first call
      return token;
    },

    /**
     * Expose token to client session
     */
    async session({ session, token }) {
      if ((token as any).accessToken) {
        (session as any).token = (token as any).accessToken;
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Token exposed to session');
        }
      } else if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ No accessToken in JWT token object. Token:', token);
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;

const { handlers } = NextAuth(authConfig);

export const { GET, POST } = handlers;
