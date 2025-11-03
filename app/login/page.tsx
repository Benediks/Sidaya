"use client"; // Jadikan Client Component

import Image from 'next/image';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Panggil 'signIn' dari next-auth
      const result = await signIn('credentials', {
        // Kirim data login ke 'authorize' function
        username: username,
        password: password,
        redirect: false, // Jangan redirect otomatis, kita tangani manual
        // callbackUrl: "/stok" // Pindahkan ini ke router.push
      });

      if (result?.error) {
        // Tampilkan pesan error jika login gagal
        setError('Username atau password salah.');
        setIsLoading(false);
      } else if (result?.ok) {
        // Jika berhasil, redirect ke halaman /stok
        router.push('/stok');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan. Coba lagi nanti.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-8 text-center">
          <Image
            src="/sidaya-logo.png"
            alt="Sidaya Logo"
            width={200}
            height={60}
            className="mx-auto"
            priority
          />
          <h2 className="mt-4 text-2xl font-semibold text-gray-700">Login</h2>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-center text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="username" className="mb-2 block text-sm font-medium text-teal-600">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-3 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
              placeholder="Masukkan username Anda"
              disabled={isLoading}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-teal-600">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-3 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
              placeholder="Masukkan password Anda"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-teal-500 py-3 font-semibold text-white transition duration-200 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
