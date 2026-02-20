"use client";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    PhoneCall,
    Star,
    Megaphone,
    Truck,
} from "lucide-react";

export default function AdminLayoutContent({ children }) {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        if (!confirm('Are you sure you want to logout?')) return;

        try {
            const res = await fetch('/api/Pages/Profile', {
                method: 'POST',
                credentials: 'include',
            });

            if (res.ok) {
                router.replace('/auth/login');
            } else {
                toast.error('Logout failed. Please try again.');
            }
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Something went wrong while logging out.');
        }
    };

    const handleProfile = () => {
        router.push("/Pages/Admin/Profile");
    };

    const menuItems = [
        { name: "Dashboard", path: "/Pages/Admin", icon: <LayoutDashboard size={18} /> },
        { name: "Product Management", path: "/Pages/Admin/Product-Management", icon: <Package size={18} /> },
        { name: "Orders", path: "/Pages/Admin/Order-Management", icon: <ShoppingCart size={18} /> },
        { name: "Customers", path: "/Pages/Admin/Customer-Management", icon: <Users size={18} /> },
        { name: "Contact & Inquiry", path: "/Pages/Admin/Contact-Management", icon: <PhoneCall size={18} /> },
        { name: "Reviews & Ratings", path: "/Pages/Admin/Reviews-Management", icon: <Star size={18} /> },
        { name: "Marketing", path: "/Pages/Admin/Marketing", icon: <Megaphone size={18} /> },
        { name: "Shipping & Payment", path: "/Pages/Admin/Shipping-Management", icon: <Truck size={18} /> },
    ];

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <div className="admin-sidebar">
                <div className="admin-logo">
                    <Image
                        src="/logo_admin.png"
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
                            className={`admin-menu-item ${pathname === item.path ? "active" : ""}`}
                            onClick={() => router.push(item.path)}
                        >
                            {item.icon} {item.name}
                        </div>
                    ))}
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </div>

            {/* Main Area */}
            <div className="admin-main">
                <div className="admin-header">
                    <input className="admin-search" placeholder="Search products, orders, customers..." />
                    <div className="admin-user">
                        <div className="admin-avatar" onClick={handleProfile} style={{ cursor: "pointer" }}>ZJ</div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="admin-content">
                    {children}
                </div>
            </div>
        </div>
    );
}
