import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import AdminSecurity from '@/lib/models/AdminSecurity';

export function generateAdminSlug() {
  return crypto.randomBytes(16).toString('base64url');
}

export async function getCurrentAdminSlug() {
  await connectDB();
  let record = await AdminSecurity.findOne();

  if (!record) {
    const slug = generateAdminSlug();
    record = await AdminSecurity.create({ route_slug: slug });
    return slug;
  }

  return record.route_slug;
}

export async function validateAdminSlug(slug) {
  if (!slug || typeof slug !== 'string') return false;
  const current = await getCurrentAdminSlug();
  return slug === current;
}

export async function rotateAdminSlug() {
  await connectDB();
  const newSlug = generateAdminSlug();

  const existing = await AdminSecurity.findOne();

  if (!existing) {
    await AdminSecurity.create({ route_slug: newSlug });
  } else {
    await AdminSecurity.findOneAndUpdate({}, {
      route_slug: newSlug,
      rotated_at: new Date()
    });
  }

  return newSlug;
}

export function getAdminPortalPath(slug) {
  return `/portal/${slug}`;
}
