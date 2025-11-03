import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// PUT (Update) a Menu item
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  try {
    const { Nama_Menu, Kategori_Menu, Jumlah_Stok, Harga } = await req.json();
    const client = await pool.connect();
    
    const query = `
      UPDATE "Menu"
      SET "Nama_Menu" = $1, "Kategori_Menu" = $2, "Jumlah_Stok" = $3, "Harga" = $4
      WHERE "ID_Menu" = $5
      RETURNING *
    `;
    const values = [Nama_Menu, Kategori_Menu, Jumlah_Stok, Harga, id];
    
    const result = await client.query(query, values);
    client.release();
    
    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Menu not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error updating menu' }, { status: 500 });
  }
}

// DELETE a Menu item
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  try {
    const client = await pool.connect();
    const result = await client.query('DELETE FROM "Menu" WHERE "ID_Menu" = $1 RETURNING *', [id]);
    client.release();
    
    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Menu not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Menu deleted' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error deleting menu' }, { status: 500 });
  }
}
