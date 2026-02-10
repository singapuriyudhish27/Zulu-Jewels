"use client";

import "./marketing.css";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import {
    LayoutDashboard,
    Package,
    Layers,
    ShoppingCart,
    Users,
    Palette,
    Boxes,
    PhoneCall,
    Star,
    Megaphone,
    CreditCard,
    Truck,
    FileText,
    Tag,
    Percent,
    Image,
    Mail,
    Send,
    Calendar,
    Eye,
    MousePointer,
    TrendingUp,
    Gift,
    Clock,
    CheckCircle2,
    AlertCircle,
    PauseCircle,
    Edit,
    Trash2,
    Plus,
    Globe,
    Instagram,
    Facebook,
    Info,
    ImageIcon,
} from "lucide-react";

export default function MarketingPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("promotions");

    const handleProfile = () => {
        router.push("/Pages/Admin/Profile");
    };

    // Live marketing data state
    const [marketingData, setMarketingData] = useState({
        coupons: [],
        banners: [],
        content_pages: []
    });
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
    const [isContentModalOpen, setIsContentModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [editingBanner, setEditingBanner] = useState(null);
    const [editingContent, setEditingContent] = useState(null);
    const [formData, setFormData] = useState({
        coupon_code: "",
        discount: "",
        discount_type: "%",
        min_order_amount: "",
        max_discount: "",
        valid_until: "",
        is_active: true
    });
    const [bannerFormData, setBannerFormData] = useState({
        title: "",
        location: "",
        status: true
    });
    const [contentFormData, setContentFormData] = useState({
        page_name: "",
        url: "",
        content: "",
        status: true
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/Pages/Admin/Marketing', {
                credentials: 'include',
            });
            const result = await response.json();
            if (result.success) {
                setMarketingData(result.data);
            } else {
                console.error("Failed to fetch marketing data:", result.message);
            }
        } catch (error) {
            console.error("Error fetching marketing data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSaveCoupon = async (e) => {
        e.preventDefault();
        try {
            const method = editingCoupon ? 'PUT' : 'POST';
            const body = editingCoupon ? { ...formData, id: editingCoupon.id } : formData;

            const response = await fetch('/api/Pages/Admin/Marketing', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                credentials: 'include',
            });

            const result = await response.json();
            if (result.success) {
                alert(editingCoupon ? "Coupon updated successfully!" : "Coupon added successfully!");
                setIsModalOpen(false);
                fetchData();
            } else {
                alert(result.message || "Failed to save coupon.");
            }
        } catch (error) {
            console.error("Error saving coupon:", error);
        }
    };

    const handleDeleteCoupon = async (id) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        try {
            const response = await fetch(`/api/Pages/Admin/Marketing?id=${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const result = await response.json();
            if (result.success) {
                fetchData();
            } else {
                alert(result.message || "Failed to delete coupon.");
            }
        } catch (error) {
            console.error("Error deleting coupon:", error);
        }
    };

    const handleEditClick = (coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            coupon_code: coupon.coupon_code,
            discount: coupon.discount,
            discount_type: coupon.discount_type,
            min_order_amount: coupon.min_order_amount || "",
            max_discount: coupon.max_discount || "",
            valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : "",
            is_active: !!coupon.is_active
        });
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        setEditingCoupon(null);
        setFormData({
            coupon_code: "",
            discount: "",
            discount_type: "%",
            min_order_amount: "",
            max_discount: "",
            valid_until: "",
            is_active: true
        });
        setIsModalOpen(true);
    };

    // --- Banner Handlers ---
    const handleSaveBanner = async (e) => {
        e.preventDefault();
        try {
            const method = editingBanner ? 'PUT' : 'POST';
            const body = editingBanner ? { ...bannerFormData, id: editingBanner.id } : bannerFormData;

            const response = await fetch('/api/Pages/Admin/Marketing/Banners', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                credentials: 'include',
            });

            const result = await response.json();
            if (result.success) {
                alert(editingBanner ? "Banner updated successfully!" : "Banner added successfully!");
                setIsBannerModalOpen(false);
                fetchData();
            } else {
                alert(result.message || "Failed to save banner.");
            }
        } catch (error) {
            console.error("Error saving banner:", error);
        }
    };

    const handleDeleteBanner = async (id) => {
        if (!confirm("Are you sure you want to delete this banner?")) return;
        try {
            const response = await fetch(`/api/Pages/Admin/Marketing/Banners?id=${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const result = await response.json();
            if (result.success) {
                fetchData();
            } else {
                alert(result.message || "Failed to delete banner.");
            }
        } catch (error) {
            console.error("Error deleting banner:", error);
        }
    };

    const handleEditBannerClick = (banner) => {
        setEditingBanner(banner);
        setBannerFormData({
            title: banner.title,
            location: banner.location || "",
            status: !!banner.status
        });
        setIsBannerModalOpen(true);
    };

    const handleAddBannerClick = () => {
        setEditingBanner(null);
        setBannerFormData({
            title: "",
            location: "",
            status: true
        });
        setIsBannerModalOpen(true);
    };

    // --- Content Page Handlers ---
    const handleSaveContent = async (e) => {
        e.preventDefault();
        try {
            const method = editingContent ? 'PUT' : 'POST';
            const body = editingContent ? { ...contentFormData, id: editingContent.id } : contentFormData;

            const response = await fetch('/api/Pages/Admin/Marketing/Content-Page', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                credentials: 'include',
            });

            const result = await response.json();
            if (result.success) {
                alert(editingContent ? "Page updated successfully!" : "Page added successfully!");
                setIsContentModalOpen(false);
                fetchData();
            } else {
                alert(result.message || "Failed to save page.");
            }
        } catch (error) {
            console.error("Error saving content page:", error);
        }
    };

    const handleDeleteContent = async (id) => {
        if (!confirm("Are you sure you want to delete this page?")) return;
        try {
            const response = await fetch(`/api/Pages/Admin/Marketing/Content-Page?id=${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const result = await response.json();
            if (result.success) {
                fetchData();
            } else {
                alert(result.message || "Failed to delete page.");
            }
        } catch (error) {
            console.error("Error deleting content page:", error);
        }
    };

    const handleEditContentClick = (page) => {
        setEditingContent(page);
        setContentFormData({
            page_name: page.page_name,
            url: page.url,
            content: page.content || "",
            status: !!page.status
        });
        setIsContentModalOpen(true);
    };

    const handleAddContentClick = () => {
        setEditingContent(null);
        setContentFormData({
            page_name: "",
            url: "",
            content: "",
            status: true
        });
        setIsContentModalOpen(true);
    };

    // Social media data
    const socialMedia = [
        { id: 1, platform: "Instagram", handle: "@zulujewellers", followers: "125K", posts: 456, engagement: "4.2%", icon: <Instagram size={24} />, url: "https://www.instagram.com/zulujewellers/" },
        { id: 2, platform: "Facebook", handle: "Zulu Jewels", followers: "85K", posts: 234, engagement: "2.8%", icon: <Facebook size={24} /> },
    ];

    // Email campaigns data (Hardcoded for now as per original design)
    const emailCampaigns = [
        { id: 1, name: "Valentine's Day Promo", subject: "💕 Express Love with Diamonds", recipients: 12500, sent: 12500, opened: 4875, clicked: 1250, openRate: "39%", clickRate: "10%", date: "20 Jan 2024", status: "Sent" },
        { id: 2, name: "New Collection Launch", subject: "✨ Introducing Spring 2024 Collection", recipients: 15000, sent: 0, opened: 0, clicked: 0, openRate: "-", clickRate: "-", date: "25 Jan 2024", status: "Scheduled" },
        { id: 3, name: "Abandoned Cart Reminder", subject: "You left something beautiful behind!", recipients: 856, sent: 856, opened: 428, clicked: 214, openRate: "50%", clickRate: "25%", date: "19 Jan 2024", status: "Sent" },
        { id: 4, name: "VIP Customer Exclusive", subject: "🎁 Exclusive Early Access for VIPs", recipients: 2500, sent: 2500, opened: 1625, clicked: 750, openRate: "65%", clickRate: "30%", date: "15 Jan 2024", status: "Sent" },
    ];


    // 🔹 Logout handler
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
                alert('Logout failed. Please try again.');
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('Something went wrong while logging out.');
        }
    };

    return (
        <>
            {/* Sidebar */}
            <div className="admin-sidebar">
                <div className="admin-logo">
                    <NextImage
                        src="/logo_admin.png"
                        alt="Website Logo"
                        className="admin-logo-image"
                        width={80}
                        height={80}
                        priority
                    /><span>ZULU JEWELS</span><br />Admin Panel</div>
                <div className="admin-menu">
                    <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin")}><LayoutDashboard size={18} /> Dashboard</div>
                    <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin/Product-Management")}><Package size={18} /> Product Management</div>
                    <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin/Order-Management")}><ShoppingCart size={18} /> Orders</div>
                    <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin/Customer-Management")}><Users size={18} /> Customers</div>
                    <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin/Contact-Management")}><PhoneCall size={18} /> Contact & Inquiry</div>
                    <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin/Reviews-Management")}><Star size={18} /> Reviews & Ratings</div>
                    <div className="admin-menu-item active" onClick={() => router.push("/Pages/Admin/Marketing")}><Megaphone size={18} /> Marketing</div>
                    <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin/Shipping-Management")}><Truck size={18} /> Shipping & Payment</div>
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </div>

            {/* Main */}
            <div className="admin-main">
                <div className="admin-header">
                    <input className="admin-search" placeholder="Search products, orders, customers..." />
                    <div className="admin-user">
                        <div className="admin-avatar" onClick={handleProfile} style={{ cursor: "pointer" }}>ZJ</div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="admin-content">
                    <h1 className="page-title">Marketing & Content Management</h1>
                    <p className="page-subtitle">Manage promotions, banners, email campaigns, and website content</p>

                    {/* Tabs */}
                    <div className="tabs-container">
                        <button className={`tab-btn ${activeTab === "promotions" ? "active" : ""}`} onClick={() => setActiveTab("promotions")}><Tag size={18} /> Promotions</button>
                        <button className={`tab-btn ${activeTab === "banners" ? "active" : ""}`} onClick={() => setActiveTab("banners")}><ImageIcon size={18} /> Banners</button>                        <button className={`tab-btn ${activeTab === "emails" ? "active" : ""}`} onClick={() => setActiveTab("emails")}><Mail size={18} /> Email Campaigns</button>
                        <button className={`tab-btn ${activeTab === "content" ? "active" : ""}`} onClick={() => setActiveTab("content")}><FileText size={18} /> Content</button>
                    </div>

                    {/* Promotions Tab */}
                    {activeTab === "promotions" && (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-card-header"><div className="stat-card-icon gold"><Tag size={24} /></div></div>
                                    <div className="stat-card-value">{marketingData.coupons.length}</div>
                                    <div className="stat-card-label">Total Coupons</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-header"><div className="stat-card-icon green"><CheckCircle2 size={24} /></div></div>
                                    <div className="stat-card-value">{marketingData.coupons.filter(c => c.is_active).length}</div>
                                    <div className="stat-card-label">Active Coupons</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-header"><div className="stat-card-icon blue"><TrendingUp size={24} /></div></div>
                                    <div className="stat-card-value">1,036</div>
                                    <div className="stat-card-label">Total Redemptions</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-header"><div className="stat-card-icon orange"><Gift size={24} /></div></div>
                                    <div className="stat-card-value">₹8.5L</div>
                                    <div className="stat-card-label">Discount Given</div>
                                </div>
                            </div>

                            <div className="content-card">
                                <div className="content-card-header">
                                    <h3 className="content-card-title"><Percent size={20} /> Coupon Codes & Promotions</h3>
                                    <button className="action-btn primary" style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        background: 'var(--gold)',
                                        color: 'white',
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }} onClick={handleAddClick}>
                                        <Plus size={18} /> Add Coupon
                                    </button>
                                </div>
                                <div className="content-card-body">
                                    <table className="data-table">
                                        <thead><tr><th>Code</th><th>Discount</th><th>Type</th><th>Min. Order</th><th>Max Discount</th><th>Valid Until</th><th>Status</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Loading coupons...</td></tr>
                                            ) : marketingData.coupons.length > 0 ? (
                                                marketingData.coupons.map((promo) => (
                                                    <tr key={promo.id}>
                                                        <td><span className="coupon-code">{promo.coupon_code}</span></td>
                                                        <td><strong>{promo.discount_type === '$' ? `₹${promo.discount}` : `${promo.discount}%`}</strong></td>
                                                        <td>{promo.discount_type === '%' ? 'Percentage' : 'Fixed'}</td>
                                                        <td>₹{promo.min_order_amount || '0'}</td>
                                                        <td>₹{promo.max_discount || 'N/A'}</td>
                                                        <td>{promo.valid_until ? new Date(promo.valid_until).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Never'}</td>
                                                        <td>
                                                            <span className={`status-badge ${promo.is_active ? 'active' : 'expired'}`}>
                                                                {promo.is_active ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                                                {promo.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button onClick={() => handleEditClick(promo)} style={{ background: 'none', border: 'none', color: 'var(--info)', cursor: 'pointer' }}><Edit size={16} /></button>
                                                                <button onClick={() => handleDeleteCoupon(promo.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No coupons found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Banners Tab */}
                    {activeTab === "banners" && (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-card-header"><div className="stat-card-icon gold"><ImageIcon size={24} /></div></div>
                                    <div className="stat-card-value">4</div>
                                    <div className="stat-card-label">Total Banners</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-header"><div className="stat-card-icon green"><Eye size={24} /></div></div>
                                    <div className="stat-card-value">18.4K</div>
                                    <div className="stat-card-label">Total Views</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-header"><div className="stat-card-icon blue"><MousePointer size={24} /></div></div>
                                    <div className="stat-card-value">2,724</div>
                                    <div className="stat-card-label">Total Clicks</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-header"><div className="stat-card-icon orange"><TrendingUp size={24} /></div></div>
                                    <div className="stat-card-value">14.8%</div>
                                    <div className="stat-card-label">Avg. CTR</div>
                                </div>
                            </div>

                            <div className="content-card">
                                <div className="content-card-header">
                                    <h3 className="content-card-title"><ImageIcon size={20} /> Website Banners</h3>
                                    <button className="action-btn primary" style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        background: 'var(--gold)',
                                        color: 'white',
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }} onClick={handleAddBannerClick}>
                                        <Plus size={18} /> Add Banner
                                    </button>
                                </div>
                                <div className="content-card-body">
                                    <table className="data-table">
                                        <thead><tr><th>Banner Title</th><th>Location</th><th>Views</th><th>Clicks</th><th>CTR</th><th>Status</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Loading banners...</td></tr>
                                            ) : marketingData.banners.length > 0 ? (
                                                marketingData.banners.map((banner) => (
                                                    <tr key={banner.id}>
                                                        <td><strong>{banner.title}</strong></td>
                                                        <td>{banner.location}</td>
                                                        <td>{(banner.views || 0).toLocaleString()}</td>
                                                        <td>{(banner.clicks || 0).toLocaleString()}</td>
                                                        <td><strong>{banner.ctr || '0%'}</strong></td>
                                                        <td>
                                                            <span className={`status-badge ${banner.status ? 'active' : 'expired'}`}>
                                                                {banner.status ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                                                {banner.status ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button onClick={() => handleEditBannerClick(banner)} style={{ background: 'none', border: 'none', color: 'var(--info)', cursor: 'pointer' }}><Edit size={16} /></button>
                                                                <button onClick={() => handleDeleteBanner(banner.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No banners found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Email Campaigns Tab */}
                    {activeTab === "emails" && (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-card-header"><div className="stat-card-icon gold"><Mail size={24} /></div></div>
                                    <div className="stat-card-value">4</div>
                                    <div className="stat-card-label">Campaigns This Month</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-header"><div className="stat-card-icon green"><Send size={24} /></div></div>
                                    <div className="stat-card-value">15.8K</div>
                                    <div className="stat-card-label">Emails Sent</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-header"><div className="stat-card-icon blue"><Eye size={24} /></div></div>
                                    <div className="stat-card-value">43.8%</div>
                                    <div className="stat-card-label">Avg. Open Rate</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-header"><div className="stat-card-icon orange"><MousePointer size={24} /></div></div>
                                    <div className="stat-card-value">18.5%</div>
                                    <div className="stat-card-label">Avg. Click Rate</div>
                                </div>
                            </div>

                            <div className="content-card">
                                <div className="content-card-header"><h3 className="content-card-title"><Mail size={20} /> Email Campaigns</h3></div>
                                <div className="content-card-body">
                                    <table className="data-table">
                                        <thead><tr><th>Campaign</th><th>Subject</th><th>Recipients</th><th>Opened</th><th>Clicked</th><th>Open Rate</th><th>Click Rate</th><th>Status</th></tr></thead>
                                        <tbody>
                                            {emailCampaigns.map((campaign) => (
                                                <tr key={campaign.id}>
                                                    <td><strong>{campaign.name}</strong></td>
                                                    <td>{campaign.subject}</td>
                                                    <td>{campaign.recipients.toLocaleString()}</td>
                                                    <td>{campaign.opened.toLocaleString()}</td>
                                                    <td>{campaign.clicked.toLocaleString()}</td>
                                                    <td><strong>{campaign.openRate}</strong></td>
                                                    <td><strong>{campaign.clickRate}</strong></td>
                                                    <td><span className={`status-badge ${campaign.status.toLowerCase()}`}>{campaign.status === "Sent" ? <CheckCircle2 size={14} /> : <Clock size={14} />}{campaign.status}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="info-box">
                                    <Info size={20} className="info-box-icon" />
                                    <div className="info-box-content">
                                        <strong>Email Marketing Best Practices</strong>
                                        Your VIP Customer campaigns have the highest engagement rates. Consider segmenting your audience more for better results. Abandoned cart emails show 50% open rate - a great opportunity to recover lost sales.
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Content Tab */}
                    {activeTab === "content" && (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-card-header"><div className="stat-card-icon gold"><FileText size={24} /></div></div>
                                    <div className="stat-card-value">7</div>
                                    <div className="stat-card-label">Total Pages</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-header"><div className="stat-card-icon green"><CheckCircle2 size={24} /></div></div>
                                    <div className="stat-card-value">6</div>
                                    <div className="stat-card-label">Published Pages</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-header"><div className="stat-card-icon blue"><Edit size={24} /></div></div>
                                    <div className="stat-card-value">1</div>
                                    <div className="stat-card-label">Draft Pages</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-header"><div className="stat-card-icon orange"><Calendar size={24} /></div></div>
                                    <div className="stat-card-value">18 Jan</div>
                                    <div className="stat-card-label">Last Updated</div>
                                </div>
                            </div>

                            <div className="two-col-grid">
                                <div className="content-card">
                                    <div className="content-card-header">
                                        <h3 className="content-card-title"><FileText size={20} /> Website Pages</h3>
                                        <button className="action-btn primary" style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            background: 'var(--gold)',
                                            color: 'white',
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }} onClick={handleAddContentClick}>
                                            <Plus size={18} /> Add Page
                                        </button>
                                    </div>
                                    <div className="content-card-body">
                                        <table className="data-table">
                                            <thead><tr><th>Page</th><th>URL</th><th>Last Updated</th><th>Status</th><th>Actions</th></tr></thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Loading pages...</td></tr>
                                                ) : marketingData.content_pages.length > 0 ? (
                                                    marketingData.content_pages.map((page) => (
                                                        <tr key={page.id}>
                                                            <td><strong>{page.page_name}</strong></td>
                                                            <td style={{ color: 'var(--gold)' }}>{page.url}</td>
                                                            <td>{new Date(page.updated_at).toLocaleDateString()}</td>
                                                            <td>
                                                                <span className={`status-badge ${page.status ? 'active' : 'draft'}`}>
                                                                    {page.status ? <CheckCircle2 size={14} /> : <Edit size={14} />}
                                                                    {page.status ? 'Published' : 'Draft'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                                    <button onClick={() => handleEditContentClick(page)} style={{ background: 'none', border: 'none', color: 'var(--info)', cursor: 'pointer' }}><Edit size={16} /></button>
                                                                    <button onClick={() => handleDeleteContent(page.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No pages found.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="content-card">
                                    <div className="content-card-header"><h3 className="content-card-title"><Globe size={20} /> Social Media</h3></div>
                                    <div className="content-card-body">
                                        {socialMedia.map((social) => (
                                            <div className="social-card" key={social.id}>
                                                <div className="social-icon">{social.icon}</div>
                                                <div className="social-details">
                                                    <div className="social-name">{social.platform}</div>
                                                    <div className="social-handle">
                                                        {social.url ? (
                                                            <a href={social.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
                                                                {social.handle}
                                                            </a>
                                                        ) : (
                                                            social.handle
                                                        )}
                                                    </div>
                                                    <div className="social-stats">
                                                        <span className="social-stat"><strong>{social.followers}</strong> Followers</span>
                                                        <span className="social-stat"><strong>{social.posts}</strong> Posts</span>
                                                        <span className="social-stat"><strong>{social.engagement}</strong> Engagement</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="info-box">
                                        <Info size={20} className="info-box-icon" />
                                        <div className="info-box-content">
                                            <strong>Social Media Performance</strong>
                                            Instagram has higher engagement. Consider posting more jewelry styling tips and behind-the-scenes content to boost engagement on Facebook.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Coupon Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="coupon-modal">
                        <div className="modal-header">
                            <h3><Percent size={20} /> {editingCoupon ? "Edit Coupon" : "Add New Coupon"}</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSaveCoupon} className="modal-body">
                            <div className="form-group">
                                <label>Coupon Code</label>
                                <input
                                    type="text"
                                    placeholder="e.g. SAVE20"
                                    value={formData.coupon_code}
                                    onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value.toUpperCase() })}
                                    required
                                />
                            </div>
                            <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Discount Amount</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.discount}
                                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ width: '120px' }}>
                                    <label>Type</label>
                                    <select
                                        value={formData.discount_type}
                                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                                        style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}
                                    >
                                        <option value="%">% Percentage</option>
                                        <option value="$">₹ Fixed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Min. Order Amount</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.min_order_amount}
                                        onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Max Discount</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.max_discount}
                                        onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Valid Until</label>
                                <input
                                    type="date"
                                    value={formData.valid_until}
                                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                />
                            </div>
                            <div className="form-group" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px 16px',
                                background: 'var(--gray-light)',
                                borderRadius: '8px',
                                marginTop: '8px'
                            }}>
                                <label htmlFor="is_active" style={{ marginBottom: 0, textTransform: 'none', fontSize: '14px', color: 'var(--charcoal)' }}>Status</label>
                                <div className="toggle-switch-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: formData.is_active ? 'var(--gold)' : 'var(--charcoal-light)' }}>
                                        {formData.is_active ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                    <div
                                        className={`custom-toggle ${formData.is_active ? 'on' : 'off'}`}
                                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                        style={{
                                            width: '44px',
                                            height: '22px',
                                            backgroundColor: formData.is_active ? 'var(--gold)' : '#e0e0e0',
                                            borderRadius: '22px',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <div style={{
                                            width: '18px',
                                            height: '18px',
                                            backgroundColor: 'white',
                                            borderRadius: '50%',
                                            position: 'absolute',
                                            top: '2px',
                                            left: formData.is_active ? '24px' : '2px',
                                            transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }} />
                                    </div>
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="action-btn secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="action-btn primary" style={{
                                    background: 'var(--gold)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}>{editingCoupon ? "Update Coupon" : "Create Coupon"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Banner Modal */}
            {isBannerModalOpen && (
                <div className="modal-overlay">
                    <div className="coupon-modal">
                        <div className="modal-header">
                            <h3><ImageIcon size={20} /> {editingBanner ? "Edit Banner" : "Add New Banner"}</h3>
                            <button className="close-btn" onClick={() => setIsBannerModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSaveBanner} className="modal-body">
                            <div className="form-group">
                                <label>Banner Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Summer Collection Sale"
                                    value={bannerFormData.title}
                                    onChange={(e) => setBannerFormData({...bannerFormData, title: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Page Location</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Homepage Hero"
                                    value={bannerFormData.location}
                                    onChange={(e) => setBannerFormData({...bannerFormData, location: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px 16px',
                                background: 'var(--gray-light)',
                                borderRadius: '8px',
                                marginTop: '8px'
                            }}>
                                <label htmlFor="banner_status" style={{ marginBottom: 0, textTransform: 'none', fontSize: '14px', color: 'var(--charcoal)' }}>Status</label>
                                <div className="toggle-switch-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: bannerFormData.status ? 'var(--gold)' : 'var(--charcoal-light)' }}>
                                        {bannerFormData.status ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                    <div
                                        className={`custom-toggle ${bannerFormData.status ? 'on' : 'off'}`}
                                        onClick={() => setBannerFormData({ ...bannerFormData, status: !bannerFormData.status })}
                                        style={{
                                            width: '44px',
                                            height: '22px',
                                            backgroundColor: bannerFormData.status ? 'var(--gold)' : '#e0e0e0',
                                            borderRadius: '22px',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <div style={{
                                            width: '18px',
                                            height: '18px',
                                            backgroundColor: 'white',
                                            borderRadius: '50%',
                                            position: 'absolute',
                                            top: '2px',
                                            left: bannerFormData.status ? '24px' : '2px',
                                            transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }} />
                                    </div>
                                    <input
                                        type="checkbox"
                                        id="banner_status"
                                        checked={bannerFormData.status}
                                        onChange={(e) => setBannerFormData({...bannerFormData, status: e.target.checked})}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="action-btn secondary" onClick={() => setIsBannerModalOpen(false)}>Cancel</button>
                                <button type="submit" className="action-btn primary" style={{
                                    background: 'var(--gold)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}>{editingBanner ? "Update Banner" : "Create Banner"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Content Page Modal */}
            {isContentModalOpen && (
                <div className="modal-overlay">
                    <div className="coupon-modal">
                        <div className="modal-header">
                            <h3><FileText size={20} /> {editingContent ? "Edit Page" : "Add New Page"}</h3>
                            <button className="close-btn" onClick={() => setIsContentModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSaveContent} className="modal-body">
                            <div className="form-group">
                                <label>Page Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. About Us"
                                    value={contentFormData.page_name}
                                    onChange={(e) => setContentFormData({...contentFormData, page_name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>URL Slug</label>
                                <input
                                    type="text"
                                    placeholder="e.g. /about-us"
                                    value={contentFormData.url}
                                    onChange={(e) => setContentFormData({...contentFormData, url: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Page Content</label>
                                <textarea
                                    placeholder="Enter page content (HTML supported)"
                                    value={contentFormData.content}
                                    onChange={(e) => setContentFormData({...contentFormData, content: e.target.value})}
                                    style={{ width: '100%', minHeight: '120px', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', fontFamily: 'inherit' }}
                                />
                            </div>
                            <div className="form-group" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px 16px',
                                background: 'var(--gray-light)',
                                borderRadius: '8px',
                                marginTop: '8px'
                            }}>
                                <label htmlFor="content_status" style={{ marginBottom: 0, textTransform: 'none', fontSize: '14px', color: 'var(--charcoal)' }}>Status</label>
                                <div className="toggle-switch-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: contentFormData.status ? 'var(--gold)' : 'var(--charcoal-light)' }}>
                                        {contentFormData.status ? 'PUBLISHED' : 'DRAFT'}
                                    </span>
                                    <div
                                        className={`custom-toggle ${contentFormData.status ? 'on' : 'off'}`}
                                        onClick={() => setContentFormData({ ...contentFormData, status: !contentFormData.status })}
                                        style={{
                                            width: '44px',
                                            height: '22px',
                                            backgroundColor: contentFormData.status ? 'var(--gold)' : '#e0e0e0',
                                            borderRadius: '22px',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <div style={{
                                            width: '18px',
                                            height: '18px',
                                            backgroundColor: 'white',
                                            borderRadius: '50%',
                                            position: 'absolute',
                                            top: '2px',
                                            left: contentFormData.status ? '24px' : '2px',
                                            transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }} />
                                    </div>
                                    <input
                                        type="checkbox"
                                        id="content_status"
                                        checked={contentFormData.status}
                                        onChange={(e) => setContentFormData({...contentFormData, status: e.target.checked})}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="action-btn secondary" onClick={() => setIsContentModalOpen(false)}>Cancel</button>
                                <button type="submit" className="action-btn primary" style={{
                                    background: 'var(--gold)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}>{editingContent ? "Update Page" : "Create Page"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}