import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiRequest } from "@/services/http/api-client";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        mobile: { label: "Mobile", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.mobile || !credentials?.password) {
            throw new Error("Mobile and Password are required");
          }

          // Call API Gateway
          const response = await apiRequest<any>({
            url: "/users/auth/login",
            method: "POST",
            data: {
              mobile: credentials.mobile,
              password: credentials.password,
              userType: "CUSTOMER",
            },
          });

          //  backend returns { message: "success", data: { id, token, ... } }
          // We must extract the inner 'data' object.
          const userPayload = response.data;

          if (userPayload && userPayload.token) {
            return {
              id: userPayload.id,
              name: userPayload.name,
              email: userPayload.email,
              image: userPayload.image,
              mobile: userPayload.mobile,
              role: userPayload.role,
              accessToken: userPayload.token,
            };
          }

          return null;
        } catch (error: any) {
          throw new Error(
            error.response?.data?.message || error.message || "Login failed",
          );
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 1. Initial Sign In
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.mobile = (user as any).mobile;
        token.accessToken = (user as any).accessToken;
        token.image = user.image;
        token.name = user.name;
      }

      // 2. Handle Session Updates (e.g., name/image change)
      if (trigger === "update" && session) {
        // If the update call contained a name, update the token
        if (session.name) {
          token.name = session.name;
        }
        // If the update call contained an image, update the token
        if (session.image) {
          token.image = session.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.image = token.image as string | null | undefined;
        session.user.name = token.name;
        session.user.email = token.email;
        (session.user as any).role = token.role;
        (session.user as any).mobile = token.mobile;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
