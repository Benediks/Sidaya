import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET all Menu items
export async function GET(req: Request) {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM "Menu"');
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching menu' }, { status: 500 });
  }
}

// POST a new Menu item
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { Nama_Menu, Kategori_Menu, Jumlah_Stok, Harga } = await req.json();
    const newId = `M${Math.floor(10000 + Math.random() * 90000)}`; // Dummy ID
    const client = await pool.connect();
    
    const query = `
      INSERT INTO "Menu" ("ID_Menu", "Nama_Menu", "Kategori_Menu", "Jumlah_Stok", "Harga")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [newId, Nama_Menu, Kategori_Menu, Jumlah_Stok, Harga];
    
    const result = await client.query(query, values);
    client.release();
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error creating menu' }, { status: 500 });
  }
}
