import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from "bcryptjs";
import crypto from "crypto";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },

        verificationLoginToken: {
          label: "Verification Login Token",
          type: "text",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        await connectDB();

        const email = credentials.email.trim().toLowerCase();

        const user = await User.findOne({
          email,
        }).select(
          "+password +emailVerificationLoginToken +emailVerificationLoginTokenExpires",
        );

        if (!user) {
          return null;
        }

        // =====================================================
        // Automatic login after email verification
        // =====================================================

        if (credentials.verificationLoginToken) {
          const hashedToken = crypto
            .createHash("sha256")
            .update(credentials.verificationLoginToken)
            .digest("hex");

          if (
            !user.emailVerificationLoginToken ||
            !user.emailVerificationLoginTokenExpires
          ) {
            return null;
          }

          if (user.emailVerificationLoginTokenExpires < new Date()) {
            return null;
          }

          if (user.emailVerificationLoginToken !== hashedToken) {
            return null;
          }

          if (!user.emailVerified) {
            return null;
          }

          // Token is one-time use
          user.emailVerificationLoginToken = undefined;

          user.emailVerificationLoginTokenExpires = undefined;

          await user.save();

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }

        // =====================================================
        // Normal email + password login
        // =====================================================

        if (!credentials.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          return null;
        }

        // User must verify email before logging in
        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }

      if (trigger === "update" && session) {
        if (session.name) {
          token.name = session.name;
        }

        if (session.email) {
          token.email = session.email;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;

        session.user.role = token.role as "user" | "admin";
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
