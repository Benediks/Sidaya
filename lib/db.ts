import { Pool, neon } from '@neondatabase/serverless';
import { z } from 'zod';

// Use this for routing API queries (e.g., in /app/api)
// It's the standard way to connect from Vercel Functions
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Use this for direct queries (e.g., in Server Actions)
// It's a more modern, lightweight way to connect
export const sql = neon(process.env.DATABASE_URL!);

// We'll also define validation schemas here based on your db
// This ensures data is clean before hitting the database

export const StokSchema = z.object({
  Nama_Stok: z.string().min(1, "Nama Stok is required"),
  Kategori_Stok: z.string().min(1, "Kategori is required"),
  Jumlah: z.coerce.number().int().positive("Jumlah must be a positive number"),
  Satuan: z.string().min(1, "Satuan is required"),
  Harga_Beli: z.coerce.number().int().positive("Harga must be a positive number"),
  // Dates will be handled as strings from the form
});

export const MenuSchema = z.object({
  Nama_Menu: z.string().min(1, "Nama Menu is required"),
  Kategori_Menu: z.string().min(1, "Kategori is required"),
  Jumlah_Stok: z.coerce.number().int().positive("Jumlah must be a positive number"),
  Harga: z.coerce.number().int().positive("Harga must be a positive number"),
});

export const PromoSchema = z.object({
  Nama_Promo: z.string().min(1, "Nama Promo is required"),
  Deskripsi: z.string().optional(),
  Tanggal_Mulai: z.string().min(1, "Tanggal Mulai is required"),
  Tanggal_Selesai: z.string().min(1, "Tanggal Selesai is required"),
  // We'd also need to handle the menu items link (Detail_Promo_Menu)
  // For simplicity, we'll handle that in the API
});
