import type { NextAuthConfig } from "next-auth";
import Twitter from "next-auth/providers/twitter";

export const authConfig = {
  providers: [
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID || "mock_twitter_client_id",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "mock_twitter_client_secret",
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      // Allow public routes
      if (pathname === "/login" || pathname.startsWith("/api/auth")) {
        return true;
      }

      // Redirect to login if not logged in
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
