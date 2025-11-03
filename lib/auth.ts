import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// --- INI ADALAH DATA DUMMY ---
// Ganti ini dengan koneksi database Anda (misal: Prisma, Drizzle, dll.)
const dummyUsers = [
  {
    id: "1",
    username: "owner",
    password: "123",
    role: "owner",
    name: "Owner 1",
    initial: "O1"
  },
  {
    id: "2",
    username: "karyawan",
    password: "123",
    role: "karyawan",
    name: "Karyawan 1",
    initial: "K1"
  },
];
// ------------------------------

export const authOptions: AuthOptions = {
  // Gunakan session strategy 'jwt' (JSON Web Token)
  session: {
    strategy: "jwt",
  },
  // Konfigurasi provider login
  providers: [
    CredentialsProvider({
      name: "Credentials",
      // Kolom yang akan muncul di form login default (kita tidak pakai ini, tapi wajib ada)
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // Fungsi 'authorize' adalah inti dari logika login
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null; // Tidak ada username atau password
        }

        // --- GANTI INI DENGAN LOGIKA DATABASE ANDA ---
        const user = dummyUsers.find(
          (u) => u.username === credentials.username
        );
        // ----------------------------------------------

        if (!user) {
          return null; // User tidak ditemukan
        }

        // Cek password menggunakan bcrypt
        const isPasswordValid = credentials.password === user.password;

        if (!isPasswordValid) {
          return null; // Password salah
        }

        // Jika berhasil, return object user
        // Data ini akan diteruskan ke callback 'jwt'
        return {
          id: user.id,
          name: user.name,
          role: user.role,
          initial: user.initial
        };
      },
    }),
  ],
  // 'callbacks' dipanggil setelah aksi tertentu (login, update session)
  callbacks: {
    // 'jwt' callback dipanggil saat JWT dibuat (setelah login)
    async jwt({ token, user }) {
      // 'user' object berasal dari 'authorize' function
      // Saat pertama kali login, 'user' object akan ada.
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.initial = user.initial;
      }
      // 'token' ini akan disimpan di cookie
      return token;
    },
    // 'session' callback dipanggil saat session dicek di client
    async session({ session, token }) {
      // 'token' object berasal dari 'jwt' callback
      // Kita tambahkan data dari token (role, id, initial) ke session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.initial = token.initial as string;
      }
      // 'session' object ini yang akan bisa diakses di client (useSession)
      return session;
    },
  },
  // Tentukan halaman kustom
  pages: {
    signIn: "/login", // Halaman login kustom
    // signOut: '/auth/signout',
    // error: '/auth/error', // Halaman error
  },
};
