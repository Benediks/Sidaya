import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET all Menu items with calculated stock quantities
export async function GET(req: Request) {
  try {
    const client = await pool.connect();
    
    // Get all menus with their ingredients and calculate available quantity
    const query = `
      SELECT 
        m.*,
        COALESCE(
          (
            SELECT MIN(FLOOR(s."Jumlah" / dm."Jumlah_Dibutuhkan"))
            FROM "Detail_Menu" dm
            JOIN "Stok" s ON dm."ID_Stok" = s."ID_Stok"
            WHERE dm."ID_Menu" = m."ID_Menu"
            AND dm."Jumlah_Dibutuhkan" > 0
          ),
          0
        ) as "Calculated_Stock"
      FROM "Menu" m
      ORDER BY m."ID_Menu"
    `;
    
    const result = await client.query(query);
    client.release();
    
    // Update Jumlah_Stok with calculated values
    const menus = result.rows.map(row => ({
      ...row,
      Jumlah_Stok: row.Calculated_Stock || 0
    }));
    
    return NextResponse.json(menus);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching menu' }, { status: 500 });
  }
}

// POST a new Menu item with ingredients
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { Nama_Menu, Kategori_Menu, Harga, ingredients } = await req.json();
    const newId = `M${Math.floor(1000 + Math.random() * 9000)}`;
    
    const client = await pool.connect();
    
    try {
      // Start transaction
      await client.query('BEGIN');
      
      // Insert menu (Jumlah_Stok will be calculated automatically)
      const menuQuery = `
        INSERT INTO "Menu" ("ID_Menu", "Nama_Menu", "Kategori_Menu", "Jumlah_Stok", "Harga")
        VALUES ($1, $2, $3, 0, $4)
        RETURNING *
      `;
      const menuValues = [newId, Nama_Menu, Kategori_Menu, Harga];
      const menuResult = await client.query(menuQuery, menuValues);
      
      // Insert ingredients into Detail_Menu
      if (ingredients && ingredients.length > 0) {
        for (const ingredient of ingredients) {
          const detailId = `D${Math.floor(10000 + Math.random() * 90000)}`;
          const detailQuery = `
            INSERT INTO "Detail_Menu" ("ID_Detail", "ID_Menu", "ID_Stok", "Jumlah_Dibutuhkan")
            VALUES ($1, $2, $3, $4)
          `;
          await client.query(detailQuery, [
            detailId,
            newId,
            ingredient.ID_Stok,
            ingredient.jumlah
          ]);
        }
      }
      
      // Calculate and update the stock quantity
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
      const finalResult = await client.query(updateQuery, [newId]);
      
      await client.query('COMMIT');
      
      return NextResponse.json(finalResult.rows[0], { status: 201 });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error creating menu' }, { status: 500 });
  }
}