import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET a single Promo with its details (for edit/detail modal)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const client = await pool.connect();
    
    // 1. Get Promo info
    const promoRes = await client.query('SELECT * FROM "Promo" WHERE "ID_Promo" = $1', [id]);
    if (promoRes.rowCount === 0) {
      return NextResponse.json({ message: 'Promo not found' }, { status: 404 });
    }
    const promo = promoRes.rows[0];

    // 2. Get linked menu items and their discounts
    const menuQuery = `
      SELECT 
        m."ID_Menu", 
        m."Nama_Menu", 
        m."Harga", 
        dpm."diskon_persen"
      FROM "Detail_Promo_Menu" dpm
      JOIN "Menu" m ON dpm."ID_Menu" = m."ID_Menu"
      WHERE dpm."ID_Promo" = $1
    `;
    const menuRes = await client.query(menuQuery, [id]);
    
    client.release();
    
    // Combine and return
    const response = {
      ...promo,
      menuItems: menuRes.rows,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching promo details:', error);
    return NextResponse.json({ message: 'Error fetching promo details' }, { status: 500 });
  }
}

// PUT (Update) a Promo
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const client = await pool.connect();

  try {
    const { Nama_Promo, Deskripsi, Tanggal_Mulai, Tanggal_Selesai, menuItems } = await req.json();

    await client.query('BEGIN');

    // 1. Update the Promo table
    const promoQuery = `
      UPDATE "Promo"
      SET "Nama_Promo" = $1, "Deskripsi" = $2, "Tanggal_Mulai" = $3, "Tanggal_Selesai" = $4
      WHERE "ID_Promo" = $5
      RETURNING *
    `;
    const promoValues = [Nama_Promo, Deskripsi, Tanggal_Mulai, Tanggal_Selesai, id];
    const promoResult = await client.query(promoQuery, promoValues);

    if (promoResult.rowCount === 0) {
      return NextResponse.json({ message: 'Promo not found' }, { status: 404 });
    }

    // 2. Delete old menu details for this promo
    await client.query('DELETE FROM "Detail_Promo_Menu" WHERE "ID_Promo" = $1', [id]);

    // 3. Insert new menu details
    if (menuItems && menuItems.length > 0) {
      const detailValues: (string | number)[] = [];
      let queryIndex = 1;
      const detailQueryParts = menuItems.map((item: any) => {
        detailValues.push(id, item.ID_Menu, item.diskon_persen);
        const part = `($${queryIndex++}, $${queryIndex++}, $${queryIndex++})`;
        return part;
      });
      
      const detailQuery = `
        INSERT INTO "Detail_Promo_Menu" ("ID_Promo", "ID_Menu", "diskon_persen")
        VALUES ${detailQueryParts.join(', ')}
      `;
      await client.query(detailQuery, detailValues);
    }

    await client.query('COMMIT');
    
    return NextResponse.json(promoResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating promo:', error);
    return NextResponse.json({ message: 'Error updating promo' }, { status: 500 });
  } finally {
    client.release();
  }
}

// DELETE a Promo
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = params;
  try {
    const client = await pool.connect();
    // Thanks to "ON DELETE CASCADE" in the schema,
    // deleting from "Promo" will automatically delete
    // all corresponding rows in "Detail_Promo_Menu".
    const result = await client.query('DELETE FROM "Promo" WHERE "ID_Promo" = $1 RETURNING *', [id]);
    client.release();
    
    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Promo not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Promo deleted' });
  } catch (error) {
    console.error('Error deleting promo:', error);
    return NextResponse.json({ message: 'Error deleting promo' }, { status: 500 });
  }
}
