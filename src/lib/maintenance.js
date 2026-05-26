import { connectDB } from '@/lib/db';
import SiteSetting from '@/lib/models/SiteSetting';

function toIso(value) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
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
  await connectDB();
  let settings = await SiteSetting.findOne();

  if (!settings) {
    settings = await SiteSetting.create({
      maintenance_enabled: false,
      maintenance_message: null,
      maintenance_starts_at: null,
      maintenance_ends_at: null,
    });
  }

  return settings;
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
