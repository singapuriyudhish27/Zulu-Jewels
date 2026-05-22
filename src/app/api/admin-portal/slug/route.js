import { NextResponse } from 'next/server';
import { getCurrentAdminSlug } from '@/lib/adminSecurity';

function isInternalRequest(req) {
  const secret = process.env.ADMIN_INTERNAL_SECRET || process.env.JWT_SECRET;
  const header = req.headers.get('x-admin-internal');
  return secret && header === secret;
}

export async function GET(req) {
  if (!isInternalRequest(req)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const slug = await getCurrentAdminSlug();
    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error('Admin portal slug error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
