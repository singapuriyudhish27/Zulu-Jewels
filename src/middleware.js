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

// In-memory TTL cache for maintenance status across requests
let cachedMaintenance = {
  active: false,
  expiresAt: 0,
  inFlight: null,
};

const MAINTENANCE_CACHE_TTL_MS = 30000; // 30 seconds

async function getMaintenanceActive(request) {
  const now = Date.now();
  if (now < cachedMaintenance.expiresAt) {
    return cachedMaintenance.active;
  }

  // Deduplicate concurrent in-flight fetches
  if (cachedMaintenance.inFlight) {
    return cachedMaintenance.inFlight;
  }

  cachedMaintenance.inFlight = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

      const url = new URL('/api/maintenance/status', request.url);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        cachedMaintenance.active = false;
        cachedMaintenance.expiresAt = now + 10000;
        return false;
      }
      const data = await res.json();
      const active = Boolean(data.active);
      cachedMaintenance.active = active;
      cachedMaintenance.expiresAt = now + MAINTENANCE_CACHE_TTL_MS;
      return active;
    } catch {
      // On timeout or network error: fail open (maintenance = inactive) and cache briefly
      cachedMaintenance.active = false;
      cachedMaintenance.expiresAt = now + 10000;
      return false;
    } finally {
      cachedMaintenance.inFlight = null;
    }
  })();

  return cachedMaintenance.inFlight;
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
    if (!hasAdminSession(request)) {
      return NextResponse.redirect(new URL(`/portal/${slug}`, request.url));
    }
    return NextResponse.next();
  }

  // Portal login: /portal/{slug}
  const loginMatch = pathname.match(/^\/portal\/([^/]+)\/?$/);
  if (loginMatch) {
    const slug = loginMatch[1];
    if (hasAdminSession(request)) {
      return NextResponse.redirect(new URL(`/portal/${slug}/panel`, request.url));
    }
    return NextResponse.next();
  }

  // Maintenance gate for storefront
  if (!isMaintenanceExempt(pathname) && isStorefrontPath(pathname)) {
    const active = await getMaintenanceActive(request);

    if (active) {
      if (pathname.startsWith('/api/Pages')) {
        return NextResponse.json(
          { success: false, message: 'Site is under maintenance', maintenance: true },
          { status: 503 }
        );
      }
      return NextResponse.redirect(new URL('/maintenance', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
