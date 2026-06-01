import { NextResponse } from 'next/server';

const STATIC_EXT = /\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|woff2?|ttf|map)$/i;

function isStaticAsset(pathname) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    STATIC_EXT.test(pathname)
  );
}

function isMaintenanceExempt(pathname) {
  if (isStaticAsset(pathname)) return true;
  if (pathname === '/maintenance') return true;
  if (pathname.startsWith('/api/maintenance')) return true;
  if (pathname.startsWith('/api/admin-portal')) return true;
  if (pathname.startsWith('/portal/')) return true;
  if (pathname.startsWith('/api/Admin')) return true;
  if (pathname === '/api/Pages/Profile') return true; // Allow logout
  return false;
}

function isStorefrontPath(pathname) {
  if (pathname === '/') return true;
  if (pathname.startsWith('/Pages')) return true;
  if (pathname.startsWith('/auth')) return true;
  if (pathname.startsWith('/portal')) return false;
  if (pathname.startsWith('/api/')) {
    if (pathname.startsWith('/api/auth/login')) return false;
    if (pathname.startsWith('/api/Admin')) return false;
    if (pathname.startsWith('/api/maintenance')) return false;
    if (pathname.startsWith('/api/admin-portal')) return false;
    return true;
  }
  return false;
}

async function fetchMaintenanceActive(request) {
  try {
    const url = new URL('/api/maintenance/status', request.url);
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.active);
  } catch {
    return false;
  }
}

async function isValidPortalSlug(request, slug) {
  if (!slug) return false;
  try {
    const url = new URL(`/api/admin-portal/validate?slug=${encodeURIComponent(slug)}`, request.url);
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.valid);
  } catch {
    return false;
  }
}

function hasAdminSession(request) {
  return Boolean(request.cookies.get('zulu_jewels_admin')?.value);
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  // Legacy static admin route — always 404
  if (pathname.startsWith('/Pages/Admin')) {
    return NextResponse.rewrite(new URL('/not-found', request.url));
  }

  // Admin panel: /portal/{slug}/panel/...
  const panelMatch = pathname.match(/^\/portal\/([^/]+)\/panel(\/.*)?$/);
  if (panelMatch) {
    const slug = panelMatch[1];
    const valid = await isValidPortalSlug(request, slug);
    if (!valid) {
      return NextResponse.rewrite(new URL('/not-found', request.url));
    }
    if (!hasAdminSession(request)) {
      return NextResponse.redirect(new URL(`/portal/${slug}`, request.url));
    }
    return NextResponse.next();
  }

  // Portal login: /portal/{slug}
  const loginMatch = pathname.match(/^\/portal\/([^/]+)\/?$/);
  if (loginMatch) {
    const slug = loginMatch[1];
    const valid = await isValidPortalSlug(request, slug);
    if (!valid) {
      return NextResponse.rewrite(new URL('/not-found', request.url));
    }
    if (hasAdminSession(request)) {
      return NextResponse.redirect(new URL(`/portal/${slug}/panel`, request.url));
    }
    return NextResponse.next();
  }

  // Maintenance gate for storefront
  if (!isMaintenanceExempt(pathname) && isStorefrontPath(pathname)) {
    const cachedMaintenance = request.cookies.get('site_maintenance')?.value;
    let active = false;
    let checkPerformed = false;

    if (cachedMaintenance !== undefined) {
      active = cachedMaintenance === '1';
    } else {
      active = await fetchMaintenanceActive(request);
      checkPerformed = true;
    }

    if (active) {
      if (pathname.startsWith('/api/Pages')) {
        const res = NextResponse.json(
          { success: false, message: 'Site is under maintenance', maintenance: true },
          { status: 503 }
        );
        if (checkPerformed) {
          res.cookies.set('site_maintenance', '1', { maxAge: 60, path: '/' });
        }
        return res;
      }
      const res = NextResponse.redirect(new URL('/maintenance', request.url));
      if (checkPerformed) {
        res.cookies.set('site_maintenance', '1', { maxAge: 60, path: '/' });
      }
      return res;
    } else if (checkPerformed) {
      // Set cookie to avoid fetching database on subsequent requests for 1 minute
      const res = NextResponse.next();
      res.cookies.set('site_maintenance', '0', { maxAge: 60, path: '/' });
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
