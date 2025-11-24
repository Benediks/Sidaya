// app/api/transactions/upload/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type TransactionRow = {
  ID_Transaksi?: string;
  Tanggal: string;
  Nama_Menu: string;
  Jumlah: number;
  Harga_Satuan?: number;
  Total?: number;
  Catatan?: string;
};

type ProcessedTransaction = {
  id: string;
  success: boolean;
  menu?: string;
  message: string;
};

async function createActivityLog(
  userId: string,
  status: 'SUCCESS' | 'FAILED',
  fileName: string,
  recordsProcessed: number,
  recordsSuccess: number,
  recordsFailed: number,
  actionDetails?: any,
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
          "ID_Log", "userId", "Activity_Type", "Action_Details",
          "Status", "File_Name", "Records_Processed", 
          "Records_Success", "Records_Failed", "Error_Message",
          "IP_Address", "User_Agent"
        )
        VALUES ($1, $2, 'UPLOAD', $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        logId, userId, JSON.stringify(actionDetails), status, fileName,
        recordsProcessed, recordsSuccess, recordsFailed,
        errorMessage || null, IP_Address || null, User_Agent || null
      ]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating activity log:', error);
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let fileName = 'unknown.xlsx';

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { message: 'No file uploaded' },
        { status: 400 }
      );
    }

    fileName = file.name;

    // Read file content
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Parse Excel file using SheetJS (xlsx)
    const XLSX = require('xlsx');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data: TransactionRow[] = XLSX.utils.sheet_to_json(worksheet);
    
    if (data.length === 0) {
      await createActivityLog(
        session.user.id,
        'FAILED',
        fileName,
        0,
        0,
        0,
        { error: 'Empty file' },
        'File is empty or invalid format',
        req
      );

      return NextResponse.json(
        { message: 'File is empty or invalid format' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    const results: ProcessedTransaction[] = [];
    let successCount = 0;
    let errorCount = 0;

    try {
      await client.query('BEGIN');

      for (const row of data) {
        try {
          // Validate required fields
          if (!row.Nama_Menu || !row.Jumlah || !row.Tanggal) {
            results.push({
              id: row.ID_Transaksi || 'N/A',
              success: false,
              menu: row.Nama_Menu,
              message: 'Missing required fields (Tanggal, Nama_Menu, or Jumlah)'
            });
            errorCount++;
            continue;
          }

          // Find menu by name
          const menuQuery = `
            SELECT m.*, 
              COALESCE(
                (
                  SELECT MIN(FLOOR(s."Jumlah" / dm."Jumlah_Dibutuhkan"))
                  FROM "Detail_Menu" dm
                  JOIN "Stok" s ON dm."ID_Stok" = s."ID_Stok"
                  WHERE dm."ID_Menu" = m."ID_Menu"
                  AND dm."Jumlah_Dibutuhkan" > 0
                ),
                0
              ) as "Available_Stock"
            FROM "Menu" m
            WHERE LOWER(m."Nama_Menu") = LOWER($1)
          `;
          const menuResult = await client.query(menuQuery, [row.Nama_Menu]);

          if (menuResult.rowCount === 0) {
            results.push({
              id: row.ID_Transaksi || 'N/A',
              success: false,
              menu: row.Nama_Menu,
              message: `Menu '${row.Nama_Menu}' not found in database`
            });
            errorCount++;
            continue;
          }

          const menu = menuResult.rows[0];
          const availableStock = menu.Available_Stock;

          // Check if enough stock available
          if (availableStock < row.Jumlah) {
            results.push({
              id: row.ID_Transaksi || 'N/A',
              success: false,
              menu: row.Nama_Menu,
              message: `Insufficient stock. Available: ${availableStock}, Required: ${row.Jumlah}`
            });
            errorCount++;
            continue;
          }

          // Generate transaction ID if not provided
          const transactionId = row.ID_Transaksi || 
            `TRX${Date.now()}${Math.floor(Math.random() * 1000)}`;

          // Use provided price or menu price
          const hargaSatuan = row.Harga_Satuan || menu.Harga;
          const total = row.Total || (hargaSatuan * row.Jumlah);

          // Insert transaction
          const insertTransactionQuery = `
            INSERT INTO "Transaksi" 
            ("ID_Transaksi", "ID_Menu", "Tanggal", "Jumlah", "Harga_Satuan", "Total", "Catatan", "userId")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
          `;
          await client.query(insertTransactionQuery, [
            transactionId,
            menu.ID_Menu,
            row.Tanggal,
            row.Jumlah,
            hargaSatuan,
            total,
            row.Catatan || null,
            session.user.id
          ]);

          // Get all ingredients for this menu
          const ingredientsQuery = `
            SELECT dm."ID_Stok", dm."Jumlah_Dibutuhkan"
            FROM "Detail_Menu" dm
            WHERE dm."ID_Menu" = $1
          `;
          const ingredientsResult = await client.query(ingredientsQuery, [menu.ID_Menu]);

          // Deduct stock for each ingredient
          for (const ingredient of ingredientsResult.rows) {
            const deductAmount = ingredient.Jumlah_Dibutuhkan * row.Jumlah;
            
            const updateStockQuery = `
              UPDATE "Stok"
              SET "Jumlah" = "Jumlah" - $1,
                  "Tanggal_Update" = NOW()
              WHERE "ID_Stok" = $2
            `;
            await client.query(updateStockQuery, [deductAmount, ingredient.ID_Stok]);
          }

          // Recalculate menu stock
          const recalcQuery = `
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
          `;
          await client.query(recalcQuery, [menu.ID_Menu]);

          results.push({
            id: transactionId,
            success: true,
            menu: row.Nama_Menu,
            message: `Successfully processed. Stock deducted: ${row.Jumlah} units`
          });
          successCount++;

        } catch (rowError: any) {
          console.error('Error processing row:', rowError);
          results.push({
            id: row.ID_Transaksi || 'N/A',
            success: false,
            menu: row.Nama_Menu,
            message: `Error: ${rowError.message}`
          });
          errorCount++;
        }
      }

      await client.query('COMMIT');

      // Log the upload activity
      await createActivityLog(
        session.user.id,
        successCount > 0 ? 'SUCCESS' : 'FAILED',
        fileName,
        data.length,
        successCount,
        errorCount,
        {
          summary: { total: data.length, success: successCount, failed: errorCount },
          fileName: fileName
        },
        errorCount > 0 ? `${errorCount} transactions failed` : undefined,
        req
      );

      return NextResponse.json({
        message: 'Transaction upload completed',
        summary: {
          total: data.length,
          success: successCount,
          failed: errorCount
        },
        results
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('Upload error:', error);
    
    // Log the failed upload
    await createActivityLog(
      session.user.id,
      'FAILED',
      fileName,
      0,
      0,
      0,
      { error: error.message },
      error.message,
      req
    );
    
    return NextResponse.json(
      { message: 'Error processing file', error: error.message },
      { status: 500 }
    );
  }
}