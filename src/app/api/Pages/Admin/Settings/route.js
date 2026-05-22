import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { verifyAdminFromRequest } from '@/lib/adminAuth';
import { getSiteSettings, getMaintenanceStatus, toMySQLDatetime } from '@/lib/maintenance';
import {
  getCurrentAdminSlug,
  getAdminPortalPath,
} from '@/lib/adminSecurity';

export async function GET(req) {
  const auth = await verifyAdminFromRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  try {
    const settings = await getSiteSettings();
    const maintenance = await getMaintenanceStatus();
    const slug = await getCurrentAdminSlug();
    const origin = req.nextUrl.origin;

    return NextResponse.json({
      success: true,
      maintenance: {
        enabled: Boolean(settings.maintenance_enabled),
        message: settings.maintenance_message || '',
        startsAt: maintenance.startsAt,
        endsAt: maintenance.endsAt,
        active: maintenance.active,
        status: maintenance.active
          ? 'active'
          : settings.maintenance_enabled
            ? 'scheduled_or_inactive'
            : 'inactive',
      },
      adminPortal: {
        slug,
        path: getAdminPortalPath(slug),
        url: `${origin}${getAdminPortalPath(slug)}`,
      },
    });
  } catch (error) {
    console.error('Admin settings GET error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req) {
  const auth = await verifyAdminFromRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const {
      maintenanceEnabled,
      maintenanceMessage,
      maintenanceStartsAt,
      maintenanceEndsAt,
    } = body;

    if (maintenanceEnabled) {
      if (!maintenanceStartsAt || !maintenanceEndsAt) {
        return NextResponse.json(
          { message: 'Start and end date/time are required when maintenance is enabled' },
          { status: 400 }
        );
      }
      if (new Date(maintenanceEndsAt) <= new Date(maintenanceStartsAt)) {
        return NextResponse.json(
          { message: 'End time must be after start time' },
          { status: 400 }
        );
      }
    }

    const conn = await getConnection();
    await conn.execute(
      `UPDATE site_settings SET
        maintenance_enabled = ?,
        maintenance_message = ?,
        maintenance_starts_at = ?,
        maintenance_ends_at = ?
      WHERE id = 1`,
      [
        Boolean(maintenanceEnabled),
        maintenanceMessage || null,
        maintenanceEnabled ? toMySQLDatetime(maintenanceStartsAt) : null,
        maintenanceEnabled ? toMySQLDatetime(maintenanceEndsAt) : null,
      ]
    );

    const settings = await getSiteSettings();
    const maintenance = await getMaintenanceStatus();

    return NextResponse.json({
      success: true,
      message: 'Settings saved',
      maintenance: {
        enabled: Boolean(settings.maintenance_enabled),
        message: settings.maintenance_message || '',
        startsAt: maintenance.startsAt,
        endsAt: maintenance.endsAt,
        active: maintenance.active,
        status: maintenance.active ? 'active' : 'inactive',
      },
    });
  } catch (error) {
    console.error('Admin settings PUT error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
