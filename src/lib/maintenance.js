import { getConnection } from '@/lib/db';

function toIso(value) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

/** MySQL DATETIME expects 'YYYY-MM-DD HH:MM:SS', not ISO with Z */
export function toMySQLDatetime(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function computeMaintenanceActive(settings) {
  if (!settings?.maintenance_enabled) return false;
  if (!settings.maintenance_starts_at || !settings.maintenance_ends_at) return false;

  const now = Date.now();
  const start = new Date(settings.maintenance_starts_at).getTime();
  const end = new Date(settings.maintenance_ends_at).getTime();

  return now >= start && now <= end;
}

export async function getSiteSettings() {
  const conn = await getConnection();
  const [rows] = await conn.execute(
    `SELECT maintenance_enabled, maintenance_message, maintenance_starts_at, maintenance_ends_at, updated_at
     FROM site_settings WHERE id = 1`
  );

  if (rows.length === 0) {
    await conn.execute('INSERT INTO site_settings (id) VALUES (1)');
    return {
      maintenance_enabled: false,
      maintenance_message: null,
      maintenance_starts_at: null,
      maintenance_ends_at: null,
    };
  }

  return rows[0];
}

export async function getMaintenanceStatus() {
  const settings = await getSiteSettings();
  const active = computeMaintenanceActive(settings);

  return {
    active,
    message: settings.maintenance_message || 'We are currently performing scheduled maintenance. Please check back soon.',
    startsAt: toIso(settings.maintenance_starts_at),
    endsAt: toIso(settings.maintenance_ends_at),
    enabled: Boolean(settings.maintenance_enabled),
  };
}
