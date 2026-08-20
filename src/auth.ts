import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { adminsTable } from "@/lib/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.SESSION_PASSWORD,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    authorized: () => true,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const [admin] = await db
          .select()
          .from(adminsTable)
          .where(eq(adminsTable.email, email))
          .limit(1);

        if (!admin || admin.status !== "active") return null;
        const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
        if (!passwordMatches) return null;

        return {
          id: String(admin.id),
          email: admin.email,
          name: admin.name,
          role: admin.role,
        };
      },
    }),
  ],
});
