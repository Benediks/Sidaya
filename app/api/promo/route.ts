import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Assuming your auth.ts is here

// GET all Promos
export async function GET(req: Request) {
  try {
    const client = await pool.connect();
    // Query to get promos and also count how many menu items are linked
    const query = `
      SELECT 
        p.*, 
        COUNT(dpm."ID_Menu") as menu_count
      FROM "Promo" p
      LEFT JOIN "Detail_Promo_Menu" dpm ON p."ID_Promo" = dpm."ID_Promo"
      GROUP BY p."ID_Promo"
      ORDER BY p."Tanggal_Mulai" DESC
    `;
    const result = await client.query(query);
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching promos:', error);
    return NextResponse.json({ message: 'Error fetching promos' }, { status: 500 });
  }
}

// POST a new Promo
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const client = await pool.connect();
  try {
    // menuItems should be an array like: [{ ID_Menu: 'M123', diskon_persen: 20 }]
    const { Nama_Promo, Deskripsi, Tanggal_Mulai, Tanggal_Selesai, menuItems } = await req.json();

    // Generate a new promo ID
    const newId = `P${Math.floor(10000 + Math.random() * 90000)}`;

    // Start transaction
    await client.query('BEGIN');

    // 1. Insert into Promo table
    const promoQuery = `
      INSERT INTO "Promo" ("ID_Promo", "Nama_Promo", "Deskripsi", "Tanggal_Mulai", "Tanggal_Selesai", "userId")
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const promoValues = [newId, Nama_Promo, Deskripsi, Tanggal_Mulai, Tanggal_Selesai, session.user.id];
    const promoResult = await client.query(promoQuery, promoValues);
    const newPromo = promoResult.rows[0];

    // 2. Insert into Detail_Promo_Menu table
    if (menuItems && menuItems.length > 0) {
      const detailValues: (string | number)[] = [];
      let queryIndex = 1;
      const detailQueryParts = menuItems.map((item: any) => {
        detailValues.push(newId, item.ID_Menu, item.diskon_persen);
        const part = `($${queryIndex++}, $${queryIndex++}, $${queryIndex++})`;
        return part;
      });
      
      const detailQuery = `
        INSERT INTO "Detail_Promo_Menu" ("ID_Promo", "ID_Menu", "diskon_persen")
        VALUES ${detailQueryParts.join(', ')}
      `;
      await client.query(detailQuery, detailValues);
    }

    // Commit transaction
    await client.query('COMMIT');
    
    return NextResponse.json(newPromo, { status: 201 });
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error creating promo:', error);
    return NextResponse.json({ message: 'Error creating promo' }, { status: 500 });
  } finally {
    client.release();
  }
}
