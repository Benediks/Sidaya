// lib/types.ts
// These types match your PostgreSQL database schema

export type Role = {
  ID_Role: string;
  Nama_Role: string;
};

export type Menu = {
  ID_Menu: string;
  Nama_Menu: string;
  Kategori_Menu: string;
  Jumlah_Stok: number;
  Harga: number;
};

export type User = {
  id: string; // From NextAuth
  name?: string | null;
  email?: string | null;
  image?: string | null;
  ID_Role?: string | null;
  Role?: Role; // Optional: if you join the tables
};

export type Promo = {
  ID_Promo: string;
  Nama_Promo: string;
  Deskripsi?: string | null;
  Tanggal_Mulai: string; // Dates are often handled as strings (ISO 8601)
  Tanggal_Selesai: string;
  userId?: string | null;
};

export type Stok = {
  ID_Stok: string;
  Nama_Stok: string;
  Kategori_Stok: string;
  Jumlah: number;
  Satuan: string;
  Harga_Beli: number;
  Tanggal_Masuk: string;
  Tanggal_Update: string;
  userId?: string | null;
  ID_Menu?: string | null;
};

// Junction table type for menu ingredients
export type DetailMenu = {
  ID_Detail: string;
  ID_Menu: string;
  ID_Stok: string;
  Jumlah_Dibutuhkan: number;
  created_at?: string;
};

// Extended menu type with ingredients
export type MenuWithIngredients = Menu & {
  ingredients: (DetailMenu & { Stok?: Stok })[];
};

// NEW: Transaction type
export type Transaksi = {
  ID_Transaksi: string;
  ID_Menu: string;
  Tanggal: string;
  Jumlah: number;
  Harga_Satuan: number;
  Total: number;
  Catatan?: string | null;
  userId?: string | null;
  created_at?: string;
};

// Extended transaction with menu details
export type TransaksiWithMenu = Transaksi & {
  Menu?: Menu;
};