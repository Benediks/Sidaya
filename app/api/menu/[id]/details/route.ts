import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const client = await pool.connect();
    
    // Get menu details with ingredients
    const query = `
      SELECT 
        dm.*, 
        s."Nama_Stok",
        s."Satuan",
        s."Jumlah" as "Jumlah_Tersedia"
      FROM "Detail_Menu" dm
      LEFT JOIN "Stok" s ON dm."ID_Stok" = s."ID_Stok"
      WHERE dm."ID_Menu" = $1
    `;
    
    const result = await client.query(query, [id]);
    client.release();
    
    const ingredients = result.rows.map(row => ({
      ID_Stok: row.ID_Stok,
      Nama_Stok: row.Nama_Stok,
      Satuan: row.Satuan,
      Jumlah_Tersedia: row.Jumlah_Tersedia,
      Jumlah_Dibutuhkan: row.Jumlah_Dibutuhkan,
    }));
    
    return NextResponse.json({ ingredients });
  } catch (error) {
    console.error('Error fetching menu details:', error);
    return NextResponse.json(
      { message: 'Error fetching menu details' },
      { status: 500 }
    );
  }
}