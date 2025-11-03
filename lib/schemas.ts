import { z } from 'zod';

// This file contains ONLY Zod schemas.
// It is 100% SAFE to import this file in Client Components.

export const StokSchema = z.object({
  Nama_Stok: z.string().min(1, 'Nama Stok is required'),
  Kategori_Stok: z.string().min(1, 'Kategori is required'),
  Jumlah: z.coerce.number().int().min(0, 'Jumlah must be non-negative'),
  Satuan: z.string().min(1, 'Satuan is required'),
  Harga_Beli: z.coerce.number().int().min(0, 'Harga must be non-negative'),
});

export const MenuSchema = z.object({
  Nama_Menu: z.string().min(1, 'Nama Menu is required'),
  Kategori_Menu: z.string().min(1, 'Kategori is required'),
  Jumlah_Stok: z.coerce.number().int().min(0, 'Jumlah must be non-negative'),
  Harga: z.coerce.number().int().min(0, 'Harga must be non-negative'),
});

// This is the full schema for the Promo form, including the menu items.
// This will fix the type error by defining the full shape.
export const PromoSchema = z.object({
  Nama_Promo: z.string().min(1, 'Nama Promo is required'),
  Deskripsi: z.string().optional(),
  Tanggal_Mulai: z.string().min(1, 'Tanggal Mulai is required'),
  Tanggal_Selesai: z.string().min(1, 'Tanggal Selesai is required'),
  menuItems: z
    .array(
      z.object({
        ID_Menu: z.string(),
        Nama_Menu: z.string().optional(), // Not validated, just part of the data
        Harga: z.number().optional(), // Not validated, just part of the data
        diskon_persen: z.coerce // This is the fix!
          .number()
          .int()
          .min(0, 'Diskon min 0%')
          .max(100, 'Diskon max 100%'),
      })
    )
    .optional(),
});

