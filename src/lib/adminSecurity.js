import crypto from 'crypto';
import { getConnection } from '@/lib/db';

export function generateAdminSlug() {
  return crypto.randomBytes(16).toString('base64url');
}

export async function getCurrentAdminSlug() {
  const conn = await getConnection();
  const [rows] = await conn.execute(
    'SELECT route_slug FROM admin_security WHERE id = 1'
  );

  if (rows.length === 0) {
    const slug = generateAdminSlug();
    await conn.execute(
      'INSERT INTO admin_security (id, route_slug) VALUES (1, ?)',
      [slug]
    );
    return slug;
  }

  return rows[0].route_slug;
}

export async function validateAdminSlug(slug) {
  if (!slug || typeof slug !== 'string') return false;
  const current = await getCurrentAdminSlug();
  return slug === current;
}

export async function rotateAdminSlug() {
  const conn = await getConnection();
  const newSlug = generateAdminSlug();
  const [existing] = await conn.execute('SELECT id FROM admin_security WHERE id = 1');

  if (existing.length === 0) {
    await conn.execute(
      'INSERT INTO admin_security (id, route_slug) VALUES (1, ?)',
      [newSlug]
    );
  } else {
    await conn.execute(
      'UPDATE admin_security SET route_slug = ?, rotated_at = CURRENT_TIMESTAMP WHERE id = 1',
      [newSlug]
    );
  }

  return newSlug;
}

export function getAdminPortalPath(slug) {
  return `/portal/${slug}`;
}
