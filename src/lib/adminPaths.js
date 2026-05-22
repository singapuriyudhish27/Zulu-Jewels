/** Base path for admin panel routes: /portal/{slug}/panel */
export function getAdminPanelBase(slug) {
  return `/portal/${slug}/panel`;
}

export function getAdminPanelPath(slug, segment = '') {
  const base = getAdminPanelBase(slug);
  if (!segment) return base;
  const clean = segment.replace(/^\//, '');
  return `${base}/${clean}`;
}
