// app/api/activity-logs/stats/route.ts
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
      // Get total activities
      const totalQuery = `SELECT COUNT(*) as total FROM "Activity_Log"`;
      const totalResult = await client.query(totalQuery);
      const totalActivities = parseInt(totalResult.rows[0].total);

      // Get total exports
      const exportsQuery = `SELECT COUNT(*) as total FROM "Activity_Log" WHERE "Activity_Type" = 'EXPORT'`;
      const exportsResult = await client.query(exportsQuery);
      const totalExports = parseInt(exportsResult.rows[0].total);

      // Get total uploads
      const uploadsQuery = `SELECT COUNT(*) as total FROM "Activity_Log" WHERE "Activity_Type" = 'UPLOAD'`;
      const uploadsResult = await client.query(uploadsQuery);
      const totalUploads = parseInt(uploadsResult.rows[0].total);

      // Get success rate
      const successQuery = `
        SELECT 
          COUNT(CASE WHEN "Status" = 'SUCCESS' THEN 1 END) as success,
          COUNT(*) as total
        FROM "Activity_Log"
      `;
      const successResult = await client.query(successQuery);
      const successCount = parseInt(successResult.rows[0].success);
      const total = parseInt(successResult.rows[0].total);
      const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0;

      // Get most recent activity
      const recentQuery = `
        SELECT "Timestamp" 
        FROM "Activity_Log" 
        ORDER BY "Timestamp" DESC 
        LIMIT 1
      `;
      const recentResult = await client.query(recentQuery);
      const recentActivity = recentResult.rows[0]?.Timestamp || null;

      return NextResponse.json({
        totalActivities,
        totalExports,
        totalUploads,
        successRate,
        recentActivity
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error fetching activity stats:', error);
    return NextResponse.json(
      { message: 'Error fetching activity stats', error: error.message },
      { status: 500 }
    );
  }
}