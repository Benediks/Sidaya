import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// GET menu details with ingredients
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const client = await pool.connect();
    
    try {
      // Get menu basic info
      const menuQuery = `
        SELECT * FROM "Menu" WHERE "ID_Menu" = $1
      `;
      const menuResult = await client.query(menuQuery, [id]);
      
      if (menuResult.rowCount === 0) {
        return NextResponse.json(
          { message: 'Menu not found' },
          { status: 404 }
        );
      }
      
      const menu = menuResult.rows[0];
      
      // Get ingredients with stock details
      const ingredientsQuery = `
        SELECT 
          dm."ID_Detail",
          dm."ID_Stok",
          dm."Jumlah_Dibutuhkan",
          s."Nama_Stok",
          s."Satuan",
          s."Jumlah" as "Jumlah_Tersedia",
          s."Harga_Beli"
        FROM "Detail_Menu" dm
        JOIN "Stok" s ON dm."ID_Stok" = s."ID_Stok"
        WHERE dm."ID_Menu" = $1
        ORDER BY s."Nama_Stok"
      `;
      const ingredientsResult = await client.query(ingredientsQuery, [id]);
      
      return NextResponse.json({
        menu,
        ingredients: ingredientsResult.rows,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching menu details:', error);
    return NextResponse.json(
      { message: 'Error fetching menu details' },
      { status: 500 }
    );
  }
}