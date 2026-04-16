import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import db from "@/lib/db";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock_secret",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || "mock_id",
      clientSecret: process.env.GITHUB_SECRET || "mock_secret",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db("users").where({ email: credentials.email }).first();
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return { 
          id: String(user.id), 
          name: user.name, 
          email: user.email, 
          image: user.image 
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;

      // Upsert para provedores sociais
      const existingUser = await db("users").where({ email: user.email }).first();

      if (!existingUser) {
        await db("users").insert({
          name: user.name,
          email: user.email,
          image: user.image,
        });
      } else {
        // Atualiza imagem ou nome se mudou no provedor social
        await db("users").where({ email: user.email }).update({
          name: user.name,
          image: user.image,
          updated_at: db.fn.now(),
        });
      }
      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const user = await db("users").where({ email: session.user.email }).first();
        if (user) {
          (session.user as any).id = user.id;
        }
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
