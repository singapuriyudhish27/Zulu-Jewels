'use client';

import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  PhoneCall,
  Star,
  Megaphone,
  Truck,
  LogOut,
  Settings,
} from 'lucide-react';
import ConfirmModal from '@/components/common/ConfirmModal';
import { useState, useMemo } from 'react';
import { useAdminBase } from '@/hooks/useAdminBase';

export default function AdminLayoutContent({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { base, path } = useAdminBase();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const menuItems = useMemo(
    () => [
      { name: 'Dashboard', path: base, icon: <LayoutDashboard size={18} /> },
      { name: 'Product Management', path: path('Product-Management'), icon: <Package size={18} /> },
      { name: 'Orders', path: path('Order-Management'), icon: <ShoppingCart size={18} /> },
      { name: 'Customers', path: path('Customer-Management'), icon: <Users size={18} /> },
      { name: 'Contact & Inquiry', path: path('Contact-Management'), icon: <PhoneCall size={18} /> },
      { name: 'Reviews & Ratings', path: path('Reviews-Management'), icon: <Star size={18} /> },
      { name: 'Marketing', path: path('Marketing'), icon: <Megaphone size={18} /> },
      { name: 'Shipping & Payment', path: path('Shipping-Management'), icon: <Truck size={18} /> },
      { name: 'Settings', path: path('Profile'), icon: <Settings size={18} /> },
    ],
    [base, path]
  );

  const isActive = (itemPath) => {
    if (itemPath === base) return pathname === base;
    return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
  };

  const handleLogout = () => setIsLogoutModalOpen(true);

  const confirmLogout = async () => {
    try {
      const res = await fetch('/api/Pages/Profile', {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        const settingsRes = await fetch('/api/Admin/Settings', { credentials: 'include' });
        const settingsData = await settingsRes.json();
        if (settingsRes.ok && settingsData.adminPortal?.path) {
          router.replace(settingsData.adminPortal.path);
        } else {
          router.replace('/auth/login');
        }
      } else {
        toast.error('Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Something went wrong while logging out.');
    }
  };

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <Image
            src="/Vector 1.png"
            alt="Website Logo"
            className="admin-logo-image"
            width={80}
            height={80}
            priority
          />
          <span>ZULU JEWELS</span>
          <br />
          Admin Panel
        </div>
        <div className="admin-menu">
          {menuItems.map((item) => (
            <div
              key={item.path}
              className={`admin-menu-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => router.push(item.path)}
            >
              {item.icon} {item.name}
            </div>
          ))}
          <button className="logout-btn" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="admin-main">
        <div className="admin-content">{children}</div>
      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="Logout Confirmation"
        message="Are you sure you want to log out of the admin panel?"
        confirmText="Logout"
        type="warning"
        icon={<LogOut size={32} />}
      />
    </div>
  );
}
