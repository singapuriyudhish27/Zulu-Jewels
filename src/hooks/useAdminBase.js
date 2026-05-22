'use client';

import { useParams } from 'next/navigation';
import { getAdminPanelBase, getAdminPanelPath } from '@/lib/adminPaths';

export function useAdminBase() {
  const params = useParams();
  const slug = params?.slug;
  const base = slug ? getAdminPanelBase(slug) : '';

  return {
    slug,
    base,
    path: (segment = '') => (slug ? getAdminPanelPath(slug, segment) : ''),
  };
}
