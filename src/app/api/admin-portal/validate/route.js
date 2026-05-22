import { NextResponse } from 'next/server';
import { validateAdminSlug } from '@/lib/adminSecurity';

export async function GET(req) {
  try {
    const slug = req.nextUrl.searchParams.get('slug');
    const valid = await validateAdminSlug(slug);
    return NextResponse.json({ success: true, valid });
  } catch (error) {
    console.error('Admin portal validate error:', error);
    return NextResponse.json({ success: false, valid: false }, { status: 500 });
  }
}
