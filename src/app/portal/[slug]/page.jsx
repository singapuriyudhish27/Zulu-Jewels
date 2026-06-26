import { validateAdminSlug } from '@/lib/adminSecurity';
import { notFound } from 'next/navigation';
import AdminPortalLoginForm from './AdminPortalLoginForm';

export default async function AdminPortalLoginPage({ params }) {
  const { slug } = await params;
  const isValid = await validateAdminSlug(slug);
  
  if (!isValid) {
    notFound();
  }

  return <AdminPortalLoginForm slug={slug} />;
}
