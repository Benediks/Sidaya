import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// GET a single Promo with menu items (for detail view only)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const client = await pool.connect();
    
    // Get promo basic info
    const promoQuery = 'SELECT * FROM "Promo" WHERE "ID_Promo" = $1';
    const promoResult = await client.query(promoQuery, [id]);
    
    if (promoResult.rowCount === 0) {
      client.release();
      return NextResponse.json({ message: 'Promo not found' }, { status: 404 });
    }
    
    const promo = promoResult.rows[0];
    
    // Get menu items with details
    const menuQuery = `
      SELECT 
        m."ID_Menu",
        m."Nama_Menu",
        m."Harga",
        dpm."diskon_persen"
      FROM "Detail_Promo_Menu" dpm
      JOIN "Menu" m ON dpm."ID_Menu" = m."ID_Menu"
      WHERE dpm."ID_Promo" = $1
      ORDER BY m."Nama_Menu"
    `;
    const menuResult = await client.query(menuQuery, [id]);
    
    client.release();
    
    return NextResponse.json({
      ...promo,
      menuItems: menuResult.rows
    });
  } catch (error) {
    console.error('Error fetching promo details:', error);
    return NextResponse.json({ message: 'Error fetching promo details' }, { status: 500 });
  }
}