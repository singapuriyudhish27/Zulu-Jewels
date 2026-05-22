import { NextResponse } from 'next/server';
import { verifyAdminFromRequest } from '@/lib/adminAuth';
import { rotateAdminSlug, getAdminPortalPath } from '@/lib/adminSecurity';

export async function POST(req) {
  const auth = await verifyAdminFromRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  try {
    const newSlug = await rotateAdminSlug();
    const origin = req.nextUrl.origin;
    const path = getAdminPortalPath(newSlug);

    return NextResponse.json({
      success: true,
      message: 'Admin portal route rotated. Old links no longer work.',
      adminPortal: {
        slug: newSlug,
        path,
        url: `${origin}${path}`,
      },
    });
  } catch (error) {
    console.error('Rotate admin route error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
