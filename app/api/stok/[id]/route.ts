import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// PUT (Update) a Stok item
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { Nama_Stok, Kategori_Stok, Jumlah, Satuan, Harga_Beli } = await req.json();
    const client = await pool.connect();
    
    const query = `
      UPDATE "Stok"
      SET "Nama_Stok" = $1, "Kategori_Stok" = $2, "Jumlah" = $3, "Satuan" = $4, "Harga_Beli" = $5, "Tanggal_Update" = NOW()
      WHERE "ID_Stok" = $6
      RETURNING *
    `;
    const values = [Nama_Stok, Kategori_Stok, Jumlah, Satuan, Harga_Beli, id];
    
    const result = await client.query(query, values);
    client.release();
    
    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Stok not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error updating stok' }, { status: 500 });
  }
}

// DELETE a Stok item
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const client = await pool.connect();
    const result = await client.query('DELETE FROM "Stok" WHERE "ID_Stok" = $1 RETURNING *', [id]);
    client.release();
    
    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Stok not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Stok deleted' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error deleting stok' }, { status: 500 });
  }
}
