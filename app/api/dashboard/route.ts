// app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await pool.connect();
    
    try {
      // 1. Count total menu items
      const menuCountQuery = `SELECT COUNT(*) as total FROM "Menu"`;
      const menuCountResult = await client.query(menuCountQuery);
      const totalMenu = parseInt(menuCountResult.rows[0].total);

      // 2. Count total stock items
      const stokCountQuery = `SELECT COUNT(*) as total FROM "Stok"`;
      const stokCountResult = await client.query(stokCountQuery);
      const totalStok = parseInt(stokCountResult.rows[0].total);

      // 3. Get best-selling menu (most sold)
      const bestSellingQuery = `
        SELECT 
          m."Nama_Menu",
          SUM(t."Jumlah") as total_sold
        FROM "Transaksi" t
        JOIN "Menu" m ON t."ID_Menu" = m."ID_Menu"
        GROUP BY m."ID_Menu", m."Nama_Menu"
        ORDER BY total_sold DESC
        LIMIT 1
      `;
      const bestSellingResult = await client.query(bestSellingQuery);
      const bestSellingMenu = bestSellingResult.rows[0]?.Nama_Menu || 'N/A';

      // 4. Get monthly revenue (last 6 months)
      const revenueQuery = `
        SELECT 
          TO_CHAR(DATE_TRUNC('month', "Tanggal"::date), 'Mon') as month,
          EXTRACT(MONTH FROM "Tanggal"::date) as month_num,
          SUM("Total") as revenue
        FROM "Transaksi"
        WHERE "Tanggal"::date >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', "Tanggal"::date), EXTRACT(MONTH FROM "Tanggal"::date)
        ORDER BY DATE_TRUNC('month', "Tanggal"::date)
      `;
      const revenueResult = await client.query(revenueQuery);
      const monthlyRevenue = revenueResult.rows.map(row => ({
        month: row.month,
        revenue: parseInt(row.revenue)
      }));

      // 5. Get top 6 best-selling menus
      const topMenusQuery = `
        SELECT 
          m."Nama_Menu",
          SUM(t."Jumlah") as total_sold
        FROM "Transaksi" t
        JOIN "Menu" m ON t."ID_Menu" = m."ID_Menu"
        GROUP BY m."ID_Menu", m."Nama_Menu"
        ORDER BY total_sold DESC
        LIMIT 6
      `;
      const topMenusResult = await client.query(topMenusQuery);
      const topMenus = topMenusResult.rows.map(row => ({
        name: row.Nama_Menu,
        sold: parseInt(row.total_sold)
      }));

      return NextResponse.json({
        cards: {
          totalMenu,
          totalStok,
          bestSellingMenu
        },
        charts: {
          monthlyRevenue,
          topMenus
        }
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { message: 'Error fetching dashboard data', error: error.message },
      { status: 500 }
    );
  }
}