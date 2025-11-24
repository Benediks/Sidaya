// app/api/stok/export/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function createActivityLog(
  userId: string,
  status: 'SUCCESS' | 'FAILED',
  fileName: string,
  recordsProcessed: number,
  errorMessage?: string,
  req?: Request
) {
  try {
    const forwarded = req?.headers.get('x-forwarded-for');
    const IP_Address = forwarded ? forwarded.split(',')[0] : req?.headers.get('x-real-ip');
    const User_Agent = req?.headers.get('user-agent');

    const logId = `LOG${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    const client = await pool.connect();
    try {
      await client.query(`
        INSERT INTO "Activity_Log" (
          "ID_Log", "userId", "Activity_Type", "Status", 
          "File_Name", "Records_Processed", "Records_Success", 
          "Error_Message", "IP_Address", "User_Agent"
        )
        VALUES ($1, $2, 'EXPORT', $3, $4, $5, $6, $7, $8, $9)
      `, [
        logId, userId, status, fileName, recordsProcessed,
        status === 'SUCCESS' ? recordsProcessed : 0,
        errorMessage || null, IP_Address || null, User_Agent || null
      ]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating activity log:', error);
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const fileName = `Sidaya_DataStok_${new Date().toISOString().split('T')[0]}.xlsx`;

  try {
    const client = await pool.connect();
    
    try {
      // Import XLSX only when needed (server-side)
      const XLSX = await import('xlsx');
      
      // Fetch Kelola Stok data
      const stokQuery = `
        SELECT 
          "ID_Stok",
          "Nama_Stok",
          "Kategori_Stok",
          "Jumlah",
          "Satuan",
          "Harga_Beli",
          TO_CHAR("Tanggal_Masuk", 'YYYY-MM-DD') as "Tanggal_Masuk",
          TO_CHAR("Tanggal_Update", 'YYYY-MM-DD') as "Tanggal_Update"
        FROM "Stok"
        ORDER BY "ID_Stok"
      `;
      const stokResult = await client.query(stokQuery);
      
      // Fetch Stok Menu data
      const menuQuery = `
        SELECT 
          m."ID_Menu",
          m."Nama_Menu",
          m."Kategori_Menu",
          m."Jumlah_Stok",
          m."Harga"
        FROM "Menu" m
        ORDER BY m."ID_Menu"
      `;
      const menuResult = await client.query(menuQuery);
      
      // Get ingredients for each menu
      const menusWithIngredients = await Promise.all(
        menuResult.rows.map(async (menu) => {
          const ingredientsQuery = `
            SELECT 
              s."Nama_Stok",
              dm."Jumlah_Dibutuhkan",
              s."Satuan"
            FROM "Detail_Menu" dm
            JOIN "Stok" s ON dm."ID_Stok" = s."ID_Stok"
            WHERE dm."ID_Menu" = $1
            ORDER BY s."Nama_Stok"
          `;
          const ingredientsResult = await client.query(ingredientsQuery, [menu.ID_Menu]);
          
          // Format ingredients as string
          const ingredientsStr = ingredientsResult.rows
            .map(ing => `${ing.Nama_Stok} (${ing.Jumlah_Dibutuhkan} ${ing.Satuan})`)
            .join(', ');
          
          return {
            ID_Menu: menu.ID_Menu,
            Nama_Menu: menu.Nama_Menu,
            Kategori_Menu: menu.Kategori_Menu,
            Jumlah_Stok: menu.Jumlah_Stok,
            Harga: menu.Harga,
            Bahan_Dibutuhkan: ingredientsStr || '-'
          };
        })
      );
      
      const totalRecords = stokResult.rows.length + menusWithIngredients.length;

      // Create workbook with 2 sheets
      const workbook = XLSX.utils.book_new();
      
      // Sheet 1: Data Stok
      const stokWorksheet = XLSX.utils.json_to_sheet(stokResult.rows);
      XLSX.utils.book_append_sheet(workbook, stokWorksheet, 'Data Stok');
      
      // Sheet 2: Data Menu
      const menuWorksheet = XLSX.utils.json_to_sheet(menusWithIngredients);
      XLSX.utils.book_append_sheet(workbook, menuWorksheet, 'Data Menu');
      
      // Generate buffer
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      // Log the successful export
      await createActivityLog(
        session.user.id,
        'SUCCESS',
        fileName,
        totalRecords,
        undefined,
        req
      );
      
      // Return file
      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${fileName}"`
        }
      });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Export error:', error);
    
    // Log the failed export
    await createActivityLog(
      session.user.id,
      'FAILED',
      fileName,
      0,
      error.message,
      req
    );
    
    return NextResponse.json(
      { message: 'Error exporting data', error: error.message },
      { status: 500 }
    );
  }
}