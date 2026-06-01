import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function verifyAdminFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get('zulu_jewels_admin')?.value;

  if (!token) {
    return { ok: false, status: 401, message: 'Unauthorized' };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.email !== process.env.ADMIN_EMAIL || decoded.role !== 'admin') {
      return { ok: false, status: 403, message: 'Forbidden' };
    }
    return { ok: true, decoded };
  } catch {
    return { ok: false, status: 401, message: 'Invalid session' };
  }
}

export async function verifyAdminFromRequest(req) {
  const token = req.cookies.get('zulu_jewels_admin')?.value;

  if (!token) {
    return { ok: false, status: 401, message: 'Unauthorized' };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.email !== process.env.ADMIN_EMAIL || decoded.role !== 'admin') {
      return { ok: false, status: 403, message: 'Forbidden' };
    }
    return { ok: true, decoded };
  } catch {
    return { ok: false, status: 401, message: 'Invalid session' };
  }
}
