import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Assuming your auth.ts is here

// GET all Stok items
export async function GET(req: Request) {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM "Stok"');
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching stok' }, { status: 500 });
  }
}

// POST a new Stok item
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { Nama_Stok, Kategori_Stok, Jumlah, Satuan, Harga_Beli } = await req.json();
    const newId = `S${Math.floor(10000 + Math.random() * 90000)}`; // Dummy ID
    const client = await pool.connect();
    
    const query = `
      INSERT INTO "Stok" ("ID_Stok", "Nama_Stok", "Kategori_Stok", "Jumlah", "Satuan", "Harga_Beli", "Tanggal_Masuk", "Tanggal_Update", "userId")
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), $7)
      RETURNING *
    `;
    const values = [newId, Nama_Stok, Kategori_Stok, Jumlah, Satuan, Harga_Beli, session.user.id];
    
    const result = await client.query(query, values);
    client.release();
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error creating stok' }, { status: 500 });
  }
}
