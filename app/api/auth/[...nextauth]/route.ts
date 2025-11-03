import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Impor dari file yang baru kita buat

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
