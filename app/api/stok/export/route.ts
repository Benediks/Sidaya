// app/api/stok/export/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const fileName = `Sidaya_DataStok_${new Date().toISOString().split('T')[0]}.pdf`;

  try {
    const client = await pool.connect();
    
    try {
      // Fetch Dashboard Statistics
      const menuCountQuery = `SELECT COUNT(*) as total FROM "Menu"`;
      const menuCountResult = await client.query(menuCountQuery);
      const totalMenu = parseInt(menuCountResult.rows[0].total);

      const stokCountQuery = `SELECT COUNT(*) as total FROM "Stok"`;
      const stokCountResult = await client.query(stokCountQuery);
      const totalStok = parseInt(stokCountResult.rows[0].total);

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
      const bestSellingMenu = bestSellingResult.rows[0]?.Nama_Menu || 'Tidak ada data';
      const bestSellingCount = bestSellingResult.rows[0]?.total_sold || 0;

      // Fetch total transactions
      const totalTransactionsQuery = `SELECT COUNT(*) as total FROM "Transaksi"`;
      const totalTransactionsResult = await client.query(totalTransactionsQuery);
      const totalTransactions = parseInt(totalTransactionsResult.rows[0].total);

      // Fetch total revenue
      const totalRevenueQuery = `SELECT COALESCE(SUM("Total"), 0) as revenue FROM "Transaksi"`;
      const totalRevenueResult = await client.query(totalRevenueQuery);
      const totalRevenue = parseInt(totalRevenueResult.rows[0].revenue);

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
      
      // Fetch Stok Menu data with ingredients
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
          
          const ingredientsStr = ingredientsResult.rows
            .map(ing => `${ing.Nama_Stok} (${ing.Jumlah_Dibutuhkan} ${ing.Satuan})`)
            .join(', ');
          
          return {
            ...menu,
            Bahan_Dibutuhkan: ingredientsStr || '-'
          };
        })
      );
      
      const totalRecords = stokResult.rows.length + menusWithIngredients.length;

      // Create PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('SIDAYA', pageWidth / 2, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Laporan Data Stok', pageWidth / 2, 22, { align: 'center' });
      doc.text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, pageWidth / 2, 28, { align: 'center' });

      // Add Dashboard Information Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Informasi Dashboard', 14, 40);
      
      const dashboardData = [
        ['Total Stok Menu', totalMenu.toString()],
        ['Total Stok Bahan', totalStok.toString()],
        ['Menu Terlaris', `${bestSellingMenu} (${bestSellingCount} porsi terjual)`],
        ['Total Transaksi', totalTransactions.toString()],
        ['Total Pendapatan', `Rp ${new Intl.NumberFormat('id-ID').format(totalRevenue)}`],
      ];

      autoTable(doc, {
        startY: 45,
        head: [['Keterangan', 'Nilai']],
        body: dashboardData,
        theme: 'grid',
        headStyles: { 
          fillColor: [20, 184, 166],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: { 
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 80 },
          1: { cellWidth: 'auto' }
        }
      });

      // Get final Y position after table
      let finalY = (doc as any).lastAutoTable.finalY + 10;

      // Data Stok Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Data Stok Bahan', 14, finalY);
      finalY += 5;

      const stokTableData = stokResult.rows.map(row => [
        row.ID_Stok,
        row.Nama_Stok,
        row.Kategori_Stok,
        row.Jumlah.toString(),
        row.Satuan,
        `Rp ${new Intl.NumberFormat('id-ID').format(row.Harga_Beli)}`,
        row.Tanggal_Masuk
      ]);

      autoTable(doc, {
        startY: finalY,
        head: [['ID', 'Nama', 'Kategori', 'Jumlah', 'Satuan', 'Harga Beli', 'Tgl Masuk']],
        body: stokTableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [20, 184, 166],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: { 
          fontSize: 8,
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 35 },
          2: { cellWidth: 25 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20 },
          5: { cellWidth: 30 },
          6: { cellWidth: 25 }
        }
      });

      finalY = (doc as any).lastAutoTable.finalY + 10;

      // Check if need new page
      if (finalY > 250) {
        doc.addPage();
        finalY = 20;
      }

      // Data Menu Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Data Stok Menu', 14, finalY);
      finalY += 5;

      const menuTableData = menusWithIngredients.map(row => [
        row.ID_Menu,
        row.Nama_Menu,
        row.Kategori_Menu,
        row.Jumlah_Stok.toString(),
        `Rp ${new Intl.NumberFormat('id-ID').format(row.Harga)}`,
        row.Bahan_Dibutuhkan
      ]);

      autoTable(doc, {
        startY: finalY,
        head: [['ID', 'Nama Menu', 'Kategori', 'Stok', 'Harga', 'Bahan Dibutuhkan']],
        body: menuTableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [20, 184, 166],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: { 
          fontSize: 8,
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 35 },
          2: { cellWidth: 25 },
          3: { cellWidth: 15 },
          4: { cellWidth: 25 },
          5: { cellWidth: 55 }
        }
      });

      // Add footer with page numbers
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Halaman ${i} dari ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Generate PDF buffer
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      
      // Log the successful export
      await createActivityLog(
        session.user.id,
        'SUCCESS',
        fileName,
        totalRecords,
        undefined,
        req
      );
      
      // Return PDF file
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
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