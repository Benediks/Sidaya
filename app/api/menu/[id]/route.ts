import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// PUT (Update) a Menu item
export async function PUT(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { Nama_Menu, Kategori_Menu, Harga, ingredients } = await req.json();
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update menu basic info
      const menuQuery = `
        UPDATE "Menu"
        SET "Nama_Menu" = $1, "Kategori_Menu" = $2, "Harga" = $3
        WHERE "ID_Menu" = $4
        RETURNING *
      `;
      const menuValues = [Nama_Menu, Kategori_Menu, Harga, id];
      const menuResult = await client.query(menuQuery, menuValues);
      
      if (menuResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ message: 'Menu not found' }, { status: 404 });
      }
      
      // If ingredients provided, update them
      if (ingredients !== undefined) {
        // Delete existing ingredients
        await client.query('DELETE FROM "Detail_Menu" WHERE "ID_Menu" = $1', [id]);
        
        // Insert new ingredients
        if (ingredients.length > 0) {
          for (const ingredient of ingredients) {
            const detailId = `D${Math.floor(10000 + Math.random() * 90000)}`;
            const detailQuery = `
              INSERT INTO "Detail_Menu" ("ID_Detail", "ID_Menu", "ID_Stok", "Jumlah_Dibutuhkan")
              VALUES ($1, $2, $3, $4)
            `;
            await client.query(detailQuery, [
              detailId,
              id,
              ingredient.ID_Stok,
              ingredient.jumlah
            ]);
          }
        }
      }
      
      // Recalculate stock quantity
      const updateQuery = `
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
        WHERE m."ID_Menu" = $1
        RETURNING *
      `;
      const finalResult = await client.query(updateQuery, [id]);
      
      await client.query('COMMIT');
      
      return NextResponse.json(finalResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error updating menu' }, { status: 500 });
  }
}

// DELETE a Menu item
export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const client = await pool.connect();
    
    // Detail_Menu will be automatically deleted due to ON DELETE CASCADE
    const result = await client.query(
      'DELETE FROM "Menu" WHERE "ID_Menu" = $1 RETURNING *', 
      [id]
    );
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