import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Mendefinisikan tipe untuk object User
   */
  interface User extends DefaultUser {
    id: string;
    role: string;
    initial?: string;
  }

  /**
   * Mendefinisikan tipe untuk object Session
   */
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      initial?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  /**
   * Mendefinisikan tipe untuk token JWT
   */
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
    initial?: string;
  }
}
