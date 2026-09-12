import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getMaintenanceStatus } from '@/lib/maintenance';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    const dbState = mongoose.connection.readyState;
    const dbHealthy = dbState === 1; // 1 = connected

    const status = await getMaintenanceStatus();
    return NextResponse.json({
      success: true,
      status: dbHealthy ? 'healthy' : 'degraded',
      database: dbHealthy ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      ...status
    }, { status: dbHealthy ? 200 : 503 });
  } catch (error) {
    console.error('Maintenance & health status error:', error.message);
    return NextResponse.json(
      { 
        success: false, 
        status: 'unhealthy',
        active: false, 
        message: 'Unable to verify system health or load maintenance status' 
      },
      { status: 503 }
    );
  }
}
