import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getAdminPortalPath } from '@/lib/adminSecurity';
import './admin.css';
import AdminLayoutContent from './AdminLayoutContent';

export default async function AdminPanelLayout({ children, params }) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('zulu_jewels')?.value;

  if (!token) {
    redirect(getAdminPortalPath(slug));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    redirect(getAdminPortalPath(slug));
  }

  if (decoded.email !== process.env.ADMIN_EMAIL) {
    redirect('/Pages');
  }

  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
