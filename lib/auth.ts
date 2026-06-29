import NextAuth from "next-auth";
import Twitter from "next-auth/providers/twitter";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

const isMockAuth = 
  !process.env.TWITTER_CLIENT_ID || 
  process.env.TWITTER_CLIENT_ID === "mock_twitter_client_id" || 
  !process.env.TWITTER_CLIENT_SECRET || 
  process.env.TWITTER_CLIENT_SECRET === "mock_twitter_client_secret";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  // NextAuth v5 requires session strategy to be "jwt" if using Credentials provider
  session: { strategy: isMockAuth ? "jwt" : "database" },
  providers: [
    ...(isMockAuth 
      ? [
          Credentials({
            name: "Mock X Account",
            credentials: {
              username: { label: "Twitter Handle", type: "text", placeholder: "guest_trader" },
            },
            async authorize(credentials) {
              const username = (credentials?.username as string) || "guest_trader";
              
              // Find or create mock user
              let user = await db.user.findFirst({
                where: { name: username }
              });

              if (!user) {
                user = await db.user.create({
                  data: {
                    name: username,
                    email: `${username}@mock-x.com`,
                    image: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
                  },
                });
              }

              return {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
              };
            },
          })
        ]
      : [
          Twitter({
            clientId: process.env.TWITTER_CLIENT_ID,
            clientSecret: process.env.TWITTER_CLIENT_SECRET,
          })
        ]
    )
  ],
  callbacks: {
    async session({ session, token, user }) {
      if (session.user) {
        // If JWT strategy is used (Mock mode), get ID from token. Otherwise from database user.
        session.user.id = token?.sub || user?.id;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: "/login",
  },
});
