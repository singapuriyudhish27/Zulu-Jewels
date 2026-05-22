import { NextResponse } from 'next/server';
import { getMaintenanceStatus } from '@/lib/maintenance';

export async function GET() {
  try {
    const status = await getMaintenanceStatus();
    return NextResponse.json({ success: true, ...status });
  } catch (error) {
    console.error('Maintenance status error:', error);
    return NextResponse.json(
      { success: false, active: false, message: 'Unable to load maintenance status' },
      { status: 500 }
    );
  }
}
