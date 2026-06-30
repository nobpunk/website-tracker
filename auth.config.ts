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
      // Allow all routes to be public (guests can view the dashboard and watchlist)
      return true;
    },
  },
} satisfies NextAuthConfig;
