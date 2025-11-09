import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET all Stok items
export async function GET(req: Request) {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM "Stok" ORDER BY "ID_Stok"');
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
    const newId = `S${Math.floor(1000 + Math.random() * 9000)}`;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const query = `
        INSERT INTO "Stok" ("ID_Stok", "Nama_Stok", "Kategori_Stok", "Jumlah", "Satuan", "Harga_Beli", "Tanggal_Masuk", "Tanggal_Update", "userId")
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), $7)
        RETURNING *
      `;
      const values = [newId, Nama_Stok, Kategori_Stok, Jumlah, Satuan, Harga_Beli, session.user.id];
      
      const result = await client.query(query, values);
      
      // Recalculate all menu stock (in case this stock is used in existing recipes)
      const recalcQuery = `
        UPDATE "Menu" m
        SET "Jumlah_Stok" = COALESCE(
          (
            SELECT MIN(FLOOR(s."Jumlah" / dm."Jumlah_Dibutuhkan"))
            FROM "Detail_Menu" dm
            JOIN "Stok" s ON dm."ID_Stok" = s."ID_Stok"
            WHERE dm."ID_Menu" = m."ID_Menu"
            AND dm."Jumlah_Dibutuhkan" > 0
          ),
          0
        )
      `;
      await client.query(recalcQuery);
      
      await client.query('COMMIT');
      
      return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error creating stok' }, { status: 500 });
  }
}