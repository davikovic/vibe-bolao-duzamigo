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
      const isGlobalAdmin = user.email === process.env.ADMIN_EMAIL;

      if (!existingUser) {
        await db("users").insert({
          name: user.name,
          email: user.email,
          image: user.image,
          status: isGlobalAdmin ? 'active' : 'pending',
          role: isGlobalAdmin ? 'admin' : 'user'
        });
      } else {
        // Atualiza imagem ou nome se mudou no provedor social
        await db("users").where({ email: user.email }).update({
          name: user.name,
          image: user.image,
          status: isGlobalAdmin ? 'active' : existingUser.status, // Garante que admin sempre seja ativo
          role: isGlobalAdmin ? 'admin' : existingUser.role, // Garante que admin sempre tenha role correta
          updated_at: db.fn.now(),
        });
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.status = (user as any).status;
        token.role = (user as any).role;
      }
      
      // Busca dados atualizados do banco se necessário (Somente em ambiente Node/Server)
      // O Middleware (Edge Runtime) usará o status persistido no JWT
      if (process.env.NEXT_RUNTIME !== "edge") {
        try {
          const dbUser = await db("users").where({ email: token.email }).first();
          if (dbUser) {
            token.status = dbUser.status;
            token.role = dbUser.role;
            token.id = dbUser.id;
            
            // Busca o ID do primeiro bolão aprovado
            const membership = await db("pool_memberships")
              .where({ user_id: dbUser.id, status: 'approved' })
              .first();
            if (membership) {
              token.poolId = membership.pool_id;
            }
          }
        } catch (error) {
          console.error("Erro ao atualizar token no JWT callback:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).status = token.status;
        (session.user as any).role = token.role;
        (session.user as any).poolId = token.poolId;
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
