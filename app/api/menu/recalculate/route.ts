import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * POST endpoint to recalculate all menu stock quantities
 * This should be called after stock (Stok) is updated
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await pool.connect();
    
    // Update all menus with calculated stock
    const query = `
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
    
    await client.query(query);
    client.release();
    
    return NextResponse.json({ 
      message: 'All menu stock quantities recalculated successfully' 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Error recalculating menu stock' }, 
      { status: 500 }
    );
  }
}