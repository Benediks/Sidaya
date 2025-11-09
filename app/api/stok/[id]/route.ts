import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// Helper function to recalculate menu stock
async function recalculateMenuStock(client: any, stokId?: string) {
  const query = stokId 
    ? `
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
      WHERE m."ID_Menu" IN (
        SELECT DISTINCT "ID_Menu" FROM "Detail_Menu" WHERE "ID_Stok" = $1
      )
    `
    : `
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
  
  const values = stokId ? [stokId] : [];
  await client.query(query, values);
}

// PUT (Update) a Stok item
export async function PUT(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { Nama_Stok, Kategori_Stok, Jumlah, Satuan, Harga_Beli } = await req.json();
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const query = `
        UPDATE "Stok"
        SET "Nama_Stok" = $1, "Kategori_Stok" = $2, "Jumlah" = $3, "Satuan" = $4, "Harga_Beli" = $5, "Tanggal_Update" = NOW()
        WHERE "ID_Stok" = $6
        RETURNING *
      `;
      const values = [Nama_Stok, Kategori_Stok, Jumlah, Satuan, Harga_Beli, id];
      
      const result = await client.query(query, values);
      
      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ message: 'Stok not found' }, { status: 404 });
      }
      
      // Recalculate affected menu stock quantities
      await recalculateMenuStock(client, id);
      
      await client.query('COMMIT');
      
      return NextResponse.json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error updating stok' }, { status: 500 });
  }
}

// DELETE a Stok item
export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Recalculate affected menus before deletion
      await recalculateMenuStock(client, id);
      
      // Delete the stock item (Detail_Menu entries will cascade delete if configured)
      const result = await client.query(
        'DELETE FROM "Stok" WHERE "ID_Stok" = $1 RETURNING *', 
        [id]
      );
      
      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ message: 'Stok not found' }, { status: 404 });
      }
      
      await client.query('COMMIT');
      
      return NextResponse.json({ message: 'Stok deleted' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error deleting stok' }, { status: 500 });
  }
}