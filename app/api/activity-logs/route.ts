// app/api/activity-logs/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET all activity logs (with optional filters)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const activityType = searchParams.get('type'); // 'EXPORT' or 'UPLOAD'
    const status = searchParams.get('status'); // 'SUCCESS' or 'FAILED'
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const client = await pool.connect();
    
    try {
      // Build dynamic query based on filters
      let query = `
        SELECT 
          al.*,
          u.name as "User_Name",
          u.email as "User_Email"
        FROM "Activity_Log" al
        LEFT JOIN "User" u ON al."userId" = u.id
        WHERE 1=1
      `;
      const values: any[] = [];
      let paramIndex = 1;

      if (activityType) {
        query += ` AND al."Activity_Type" = $${paramIndex}`;
        values.push(activityType);
        paramIndex++;
      }

      if (status) {
        query += ` AND al."Status" = $${paramIndex}`;
        values.push(status);
        paramIndex++;
      }

      query += ` ORDER BY al."Timestamp" DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      values.push(limit, offset);

      const result = await client.query(query, values);

      // Get total count for pagination
      let countQuery = `SELECT COUNT(*) FROM "Activity_Log" WHERE 1=1`;
      const countValues: any[] = [];
      let countParamIndex = 1;

      if (activityType) {
        countQuery += ` AND "Activity_Type" = $${countParamIndex}`;
        countValues.push(activityType);
        countParamIndex++;
      }

      if (status) {
        countQuery += ` AND "Status" = $${countParamIndex}`;
        countValues.push(status);
      }

      const countResult = await client.query(countQuery, countValues);
      const total = parseInt(countResult.rows[0].count);

      return NextResponse.json({
        logs: result.rows,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { message: 'Error fetching activity logs', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new activity log
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const {
      Activity_Type,
      Action_Details,
      Status,
      File_Name,
      Records_Processed,
      Records_Success,
      Records_Failed,
      Error_Message
    } = await req.json();

    // Get IP address and user agent from headers
    const forwarded = req.headers.get('x-forwarded-for');
    const IP_Address = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip');
    const User_Agent = req.headers.get('user-agent');

    const logId = `LOG${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const client = await pool.connect();
    
    try {
      const query = `
        INSERT INTO "Activity_Log" (
          "ID_Log",
          "userId",
          "Activity_Type",
          "Action_Details",
          "Status",
          "File_Name",
          "Records_Processed",
          "Records_Success",
          "Records_Failed",
          "Error_Message",
          "IP_Address",
          "User_Agent"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      const values = [
        logId,
        session.user.id,
        Activity_Type,
        Action_Details ? JSON.stringify(Action_Details) : null,
        Status,
        File_Name || null,
        Records_Processed || 0,
        Records_Success || 0,
        Records_Failed || 0,
        Error_Message || null,
        IP_Address || null,
        User_Agent || null
      ];

      const result = await client.query(query, values);
      return NextResponse.json(result.rows[0], { status: 201 });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error creating activity log:', error);
    return NextResponse.json(
      { message: 'Error creating activity log', error: error.message },
      { status: 500 }
    );
  }
}