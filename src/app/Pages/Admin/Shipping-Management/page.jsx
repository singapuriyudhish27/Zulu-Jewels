"use client";

import "./shipping.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
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
    MapPin,
    IndianRupee,
    Building2,
    CheckCircle2,
    Clock,
    AlertCircle,
    Wallet,
    Banknote,
    Globe,
    Settings,
    Info,
    Plus,
    Pencil,
    Trash2,
    X
} from "lucide-react";

export default function ShippingPaymentPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("shipping");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        shipping_zones: [],
        shipping_partners: [],
        payment_options: [],
        transactions: []
    });

    // ── Shipping Zone Modal State ──
    const [showZoneModal, setShowZoneModal] = useState(false);
    const [editingZone, setEditingZone] = useState(null);
    const [saving, setSaving] = useState(false);
    const [zoneForm, setZoneForm] = useState({
        zone_name: '',
        areas: '',
        location: '',
        shipping_rate: '',
        delivery_time: '',
        status: true
    });

    const defaultZoneForm = { zone_name: '', areas: '', location: '', shipping_rate: '', delivery_time: '', status: true };

    // ── Shipping Partner Modal State ──
    const [showPartnerModal, setShowPartnerModal] = useState(false);
    const [editingPartner, setEditingPartner] = useState(null);
    const [savingPartner, setSavingPartner] = useState(false);
    const [partnerForm, setPartnerForm] = useState({
        partner_name: '',
        type: '',
        tracking_url: '',
        status: true
    });
    const defaultPartnerForm = { partner_name: '', type: '', tracking_url: '', status: true };

    const fetchShippingData = async () => {
        try {
            const response = await fetch('/api/Pages/Admin/Shipping-Management', {
                credentials: 'include',
            });
            const result = await response.json();
            if (result.success) {
                setData(result.data);
            } else {
                console.error("Failed to fetch shipping data:", result.message);
            }
        } catch (error) {
            console.error("Error fetching shipping data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShippingData();
    }, []);

    // ── Open Add Modal ──
    const handleOpenAddModal = () => {
        setEditingZone(null);
        setZoneForm({ ...defaultZoneForm });
        setShowZoneModal(true);
    };

    // ── Open Edit Modal ──
    const handleOpenEditModal = (zone) => {
        setEditingZone(zone);
        setZoneForm({
            zone_name: zone.zone_name || '',
            areas: zone.areas || '',
            location: zone.location || '',
            shipping_rate: zone.shipping_rate ?? '',
            delivery_time: zone.delivery_time || '',
            status: zone.status !== undefined ? Boolean(zone.status) : true
        });
        setShowZoneModal(true);
    };

    // ── Close Modal ──
    const handleCloseModal = () => {
        setShowZoneModal(false);
        setEditingZone(null);
        setZoneForm({ ...defaultZoneForm });
    };

    // ── Save Zone (Add / Edit) ──
    const handleSaveZone = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const isEdit = editingZone !== null;
            const url = '/api/Pages/Admin/Shipping-Management/Shipping-Zones';
            const method = isEdit ? 'PUT' : 'POST';
            const body = isEdit ? { id: editingZone.id, ...zoneForm } : { ...zoneForm };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body),
            });
            const result = await res.json();
            if (result.success) {
                handleCloseModal();
                await fetchShippingData();
            } else {
                alert(result.message || 'Failed to save shipping zone');
            }
        } catch (error) {
            console.error('Error saving zone:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // ── Delete Zone ──
    const handleDeleteZone = async (zoneId) => {
        if (!confirm('Are you sure you want to delete this shipping zone?')) return;
        try {
            const res = await fetch(`/api/Pages/Admin/Shipping-Management/Shipping-Zones?id=${zoneId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const result = await res.json();
            if (result.success) {
                await fetchShippingData();
            } else {
                alert(result.message || 'Failed to delete shipping zone');
            }
        } catch (error) {
            console.error('Error deleting zone:', error);
            alert('Something went wrong. Please try again.');
        }
    };

    // ── Partner: Open Add Modal ──
    const handleOpenAddPartnerModal = () => {
        setEditingPartner(null);
        setPartnerForm({ ...defaultPartnerForm });
        setShowPartnerModal(true);
    };

    // ── Partner: Open Edit Modal ──
    const handleOpenEditPartnerModal = (partner) => {
        setEditingPartner(partner);
        setPartnerForm({
            partner_name: partner.partner_name || '',
            type: partner.type || '',
            tracking_url: partner.tracking_url || '',
            status: partner.status !== undefined ? Boolean(partner.status) : true
        });
        setShowPartnerModal(true);
    };

    // ── Partner: Close Modal ──
    const handleClosePartnerModal = () => {
        setShowPartnerModal(false);
        setEditingPartner(null);
        setPartnerForm({ ...defaultPartnerForm });
    };

    // ── Partner: Save (Add / Edit) ──
    const handleSavePartner = async (e) => {
        e.preventDefault();
        setSavingPartner(true);
        try {
            const isEdit = editingPartner !== null;
            const url = '/api/Pages/Admin/Shipping-Management/Shipping-Partner';
            const method = isEdit ? 'PUT' : 'POST';
            const body = isEdit ? { id: editingPartner.id, ...partnerForm } : { ...partnerForm };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body),
            });
            const result = await res.json();
            if (result.success) {
                handleClosePartnerModal();
                await fetchShippingData();
            } else {
                alert(result.message || 'Failed to save shipping partner');
            }
        } catch (error) {
            console.error('Error saving partner:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setSavingPartner(false);
        }
    };

    // ── Partner: Delete ──
    const handleDeletePartner = async (partnerId) => {
        if (!confirm('Are you sure you want to delete this shipping partner?')) return;
        try {
            const res = await fetch(`/api/Pages/Admin/Shipping-Management/Shipping-Partner?id=${partnerId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const result = await res.json();
            if (result.success) {
                await fetchShippingData();
            } else {
                alert(result.message || 'Failed to delete shipping partner');
            }
        } catch (error) {
            console.error('Error deleting partner:', error);
            alert('Something went wrong. Please try again.');
        }
    };

    // ── Payment Method: Toggle Active/Inactive ──
    const handleTogglePaymentMethod = async (methodId, currentStatus) => {
        const newStatus = !currentStatus;
        try {
            const res = await fetch('/api/Pages/Admin/Shipping-Management/Payment-Method', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id: methodId, status: newStatus }),
            });
            const result = await res.json();
            if (result.success) {
                await fetchShippingData();
            } else {
                alert(result.message || 'Failed to update payment method');
            }
        } catch (error) {
            console.error('Error toggling payment method:', error);
            alert('Something went wrong. Please try again.');
        }
    };

    const handleLogOut = () => {
        setOpen(false);
        router.push("/auth/login");
    };

    const handleProfile = () => {
        router.push("/Pages/Admin/Profile");
    };

    // Map Shipping Zones
    const shippingZones = data.shipping_zones.map(zone => ({
        id: zone.id,
        zone: zone.zone_name,
        cities: zone.areas,
        rate: zone.shipping_rate === 0 ? "Free" : `₹${zone.shipping_rate}`,
        deliveryTime: zone.delivery_time,
        status: zone.status ? "Active" : "Inactive",
        _raw: zone
    }));

    // Map Payment Methods
    const paymentMethods = data.payment_options.map(method => {
        const name = method.category || "Default Method";
        const nameLower = name.toLowerCase();

        // Dynamic icon selection
        let icon = <Banknote size={24} />;
        if (nameLower.includes('card') || nameLower.includes('razorpay')) {
            icon = <CreditCard size={24} />;
        } else if (nameLower.includes('bank')) {
            icon = <Building2 size={24} />;
        } else if (nameLower.includes('upi')) {
            icon = <Wallet size={24} />;
        }

        return {
            id: method.id,
            name: name,
            type: method.category || "Payment",
            description: method.description || "Secure payment method",
            isActive: Boolean(method.status),
            status: method.status ? "Active" : "Inactive",
            commission: method.transaction_fee || "0%",
            icon: icon
        };
    });

    // Map Transactions
    const recentTransactions = data.transactions.map(txn => ({
        id: `TXN${txn.id.toString().padStart(3, '0')}`,
        orderId: `ORD-${new Date(txn.created_at).getFullYear()}-${txn.order_id}`,
        customer: txn.customer_name || "Unknown Customer",
        amount: `₹${parseFloat(txn.amount).toLocaleString('en-IN')}`,
        method: txn.payment_method,
        status: txn.status,
        date: new Date(txn.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    }));

    // Map Shipping Partners
    const shippingPartnersData = data.shipping_partners.map(partner => ({
        id: partner.id,
        name: partner.partner_name,
        type: partner.type || "Courier",
        tracking: partner.tracking_url || "N/A",
        status: partner.status ? "Active" : "Inactive",
        _raw: partner
    }));

    // Dynamic Stats Calculations
    const activeZonesCount = shippingZones.filter(z => z.status === "Active").length;
    const activePartnersCount = shippingPartnersData.filter(p => p.status === "Active").length;
    const totalRevenue = data.transactions
        .filter(t => t.status === "Completed")
        .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const successRate = data.transactions.length > 0
        ? ((data.transactions.filter(t => t.status === "Completed").length / data.transactions.length) * 100).toFixed(1)
        : "0.0";
    const processingFees = (totalRevenue * 0.02).toFixed(0); // Estimated 2%

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
                    <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin")}><LayoutDashboard size={18} /> Dashboard</div>
                    <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin/Product-Management")}><Package size={18} /> Product Management</div>
                    <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin/Order-Management")}><ShoppingCart size={18} /> Orders</div>
                    <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin/Customer-Management")}><Users size={18} /> Customers</div>
                    <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin/Contact-Management")}><PhoneCall size={18} /> Contact & Inquiry</div>
                    <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin/Reviews-Management")}><Star size={18} /> Reviews & Ratings</div>
                    <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin/Marketing")}><Megaphone size={18} /> Marketing</div>
                    <div className="admin-menu-item active" onClick={() => router.push("/Pages/Admin/Shipping-Management")}><Truck size={18} /> Shipping & Payment</div>
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </div>

            {/* Main */}
            <div className="admin-main">
                <div className="admin-header">
                    <input className="admin-search" placeholder="Search products, orders, customers..." />
                    <div className="admin-user">
                        <div className="admin-avatar" onClick={handleProfile} style={{ cursor: "pointer" }}>
                            ZJ
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="admin-content">
                    <h1 className="page-title">Shipping & Payment Management</h1>
                    <p className="page-subtitle">Configure shipping zones, rates, and payment methods for your store</p>

                    {/* Tabs */}
                    <div className="tabs-container">
                        <button
                            className={`tab-btn ${activeTab === "shipping" ? "active" : ""}`}
                            onClick={() => setActiveTab("shipping")}
                        >
                            <Truck size={18} /> Shipping Settings
                        </button>
                        <button
                            className={`tab-btn ${activeTab === "payment" ? "active" : ""}`}
                            onClick={() => setActiveTab("payment")}
                        >
                            <CreditCard size={18} /> Payment Methods
                        </button>
                        <button
                            className={`tab-btn ${activeTab === "transactions" ? "active" : ""}`}
                            onClick={() => setActiveTab("transactions")}
                        >
                            <IndianRupee size={18} /> Transactions
                        </button>
                    </div>

                    {/* Shipping Tab Content */}
                    {activeTab === "shipping" && (
                        <>
                            {/* Stats */}
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-card-header">
                                        <div className="stat-card-icon gold">
                                            <MapPin size={24} />
                                        </div>
                                    </div>
                                    <div className="stat-card-value">{activeZonesCount}</div>
                                    <div className="stat-card-label">Active Shipping Zones</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-header">
                                        <div className="stat-card-icon green">
                                            <Truck size={24} />
                                        </div>
                                    </div>
                                    <div className="stat-card-value">{activePartnersCount}</div>
                                    <div className="stat-card-label">Active Shipping Partners</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-header">
                                        <div className="stat-card-icon blue">
                                            <Package size={24} />
                                        </div>
                                    </div>
                                    <div className="stat-card-value">{data.transactions.length}</div>
                                    <div className="stat-card-label">Shipments MTD</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-header">
                                        <div className="stat-card-icon orange">
                                            <Clock size={24} />
                                        </div>
                                    </div>
                                    <div className="stat-card-value">3.2 days</div>
                                    <div className="stat-card-label">Avg. Delivery Time</div>
                                </div>
                            </div>

                            {/* Shipping Zones Table */}
                            <div className="content-card">
                                <div className="content-card-header">
                                    <h3 className="content-card-title">
                                        <MapPin size={20} /> Shipping Zones & Rates
                                    </h3>
                                    <button className="add-zone-btn" onClick={handleOpenAddModal}>
                                        <Plus size={16} /> Add Shipping Zone & Rates
                                    </button>
                                </div>
                                <div className="content-card-body">
                                    {loading ? (
                                        <div style={{ textAlign: "center", padding: "40px", opacity: 0.6 }}>
                                            <Clock className="spin-animation" size={24} style={{ marginBottom: "12px", display: "inline-block" }} />
                                            <p>Fetching shipping zones...</p>
                                        </div>
                                    ) : shippingZones.length > 0 ? (
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Zone</th>
                                                    <th>Cities Covered</th>
                                                    <th>Shipping Rate</th>
                                                    <th>Delivery Time</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {shippingZones.map((zone) => (
                                                    <tr key={`zone-${zone.id}`}>
                                                        <td><strong>{zone.zone}</strong></td>
                                                        <td>{zone.cities}</td>
                                                        <td><strong>{zone.rate}</strong></td>
                                                        <td>{zone.deliveryTime}</td>
                                                        <td>
                                                            <span className={`status-badge ${(zone.status || "").toLowerCase()}`}>
                                                                <CheckCircle2 size={14} /> {zone.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="action-btns">
                                                                <button className="action-btn edit" title="Edit" onClick={() => handleOpenEditModal(zone._raw)}>
                                                                    <Pencil size={15} />
                                                                </button>
                                                                <button className="action-btn delete" title="Delete" onClick={() => handleDeleteZone(zone.id)}>
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div style={{ textAlign: "center", padding: "40px", opacity: 0.4 }}>
                                            <MapPin size={32} style={{ marginBottom: "12px" }} />
                                            <p>No shipping zones configured</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Shipping Partners Table */}
                            <div className="content-card">
                                <div className="content-card-header">
                                    <h3 className="content-card-title">
                                        <Truck size={20} /> Shipping Partners
                                    </h3>
                                    <button className="add-zone-btn" onClick={handleOpenAddPartnerModal}>
                                        <Plus size={16} /> Add Shipping Partner
                                    </button>
                                </div>
                                <div className="content-card-body">
                                    {loading ? (
                                        <div style={{ textAlign: "center", padding: "40px", opacity: 0.6 }}>
                                            <Clock className="spin-animation" size={24} style={{ marginBottom: "12px", display: "inline-block" }} />
                                            <p>Fetching shipping partners...</p>
                                        </div>
                                    ) : shippingPartnersData.length > 0 ? (
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Partner</th>
                                                    <th>Type</th>
                                                    <th>Tracking URL</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {shippingPartnersData.map((partner) => (
                                                    <tr key={`partner-${partner.id}`}>
                                                        <td><strong>{partner.name}</strong></td>
                                                        <td>{partner.type}</td>
                                                        <td>{partner.tracking}</td>
                                                        <td>
                                                            <span className={`status-badge ${(partner.status || "").toLowerCase()}`}>
                                                                {partner.status === "Active" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                                                {partner.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="action-btns">
                                                                <button className="action-btn edit" title="Edit" onClick={() => handleOpenEditPartnerModal(partner._raw)}>
                                                                    <Pencil size={15} />
                                                                </button>
                                                                <button className="action-btn delete" title="Delete" onClick={() => handleDeletePartner(partner.id)}>
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div style={{ textAlign: "center", padding: "40px", opacity: 0.4 }}>
                                            <Truck size={32} style={{ marginBottom: "12px" }} />
                                            <p>No shipping partners configured</p>
                                        </div>
                                    )}
                                </div>
                                <div className="info-box">
                                    <Info size={20} className="info-box-icon" />
                                    <div className="info-box-content">
                                        <strong>Insurance Policy for Jewelry Shipments</strong>
                                        All jewelry items are shipped with full insurance coverage. For orders above ₹1,00,000, signature confirmation and secure packaging with tamper-proof seals are mandatory.
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Payment Tab Content */}
                    {activeTab === "payment" && (
                        <>
                            {/* Stats */}
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-card-header">
                                        <div className="stat-card-icon gold">
                                            <CreditCard size={24} />
                                        </div>
                                    </div>
                                    <div className="stat-card-value">{paymentMethods.length}</div>
                                    <div className="stat-card-label">Payment Methods Active</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-header">
                                        <div className="stat-card-icon green">
                                            <IndianRupee size={24} />
                                        </div>
                                    </div>
                                    <div className="stat-card-value">₹{(totalRevenue / 100000).toFixed(1)}L</div>
                                    <div className="stat-card-label">Revenue MTD</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-header">
                                        <div className="stat-card-icon blue">
                                            <CheckCircle2 size={24} />
                                        </div>
                                    </div>
                                    <div className="stat-card-value">{successRate}%</div>
                                    <div className="stat-card-label">Payment Success Rate</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-header">
                                        <div className="stat-card-icon orange">
                                            <Wallet size={24} />
                                        </div>
                                    </div>
                                    <div className="stat-card-value">₹{parseFloat(processingFees).toLocaleString('en-IN')}</div>
                                    <div className="stat-card-label">Processing Fees (Est.)</div>
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div className="content-card">
                                <div className="content-card-header">
                                    <h3 className="content-card-title">
                                        <CreditCard size={20} /> Configured Payment Methods
                                    </h3>
                                </div>
                                <div className="content-card-body">
                                    {loading ? (
                                        <div style={{ textAlign: "center", padding: "40px", opacity: 0.6 }}>
                                            <Clock className="spin-animation" size={24} style={{ marginBottom: "12px", display: "inline-block" }} />
                                            <p>Fetching payment methods...</p>
                                        </div>
                                    ) : paymentMethods.length > 0 ? (
                                        paymentMethods.map((method) => (
                                            <div className="payment-card" key={`method-${method.id}`}>
                                                <div className="payment-icon">
                                                    {method.icon}
                                                </div>
                                                <div className="payment-details">
                                                    <div className="payment-name">{method.name}</div>
                                                    <div className="payment-type">{method.type}</div>
                                                    <div className="payment-description">{method.description}</div>
                                                    <div className="payment-info">
                                                        {method.keyId && (
                                                            <span className="payment-info-item"><strong>Key ID:</strong> {method.keyId}</span>
                                                        )}
                                                        {method.limit && (
                                                            <span className="payment-info-item"><strong>Limit:</strong> {method.limit}</span>
                                                        )}
                                                        {method.accountDetails && (
                                                            <span className="payment-info-item"><strong>Account:</strong> {method.accountDetails}</span>
                                                        )}
                                                        {method.upiId && (
                                                            <span className="payment-info-item"><strong>UPI ID:</strong> {method.upiId}</span>
                                                        )}
                                                        <span className="payment-info-item"><strong>Commission:</strong> {method.commission}</span>
                                                    </div>
                                                </div>
                                                <div className="payment-status">
                                                    <div className="toggle-wrapper">
                                                        <label className="toggle-switch">
                                                            <input
                                                                type="checkbox"
                                                                checked={method.isActive}
                                                                onChange={() => handleTogglePaymentMethod(method.id, method.isActive)}
                                                            />
                                                            <span className="toggle-slider"></span>
                                                        </label>
                                                        <span className={`toggle-label ${method.isActive ? 'active' : 'inactive'}`}>
                                                            {method.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ textAlign: "center", padding: "40px", opacity: 0.4 }}>
                                            <CreditCard size={32} style={{ marginBottom: "12px" }} />
                                            <p>No payment methods configured</p>
                                        </div>
                                    )}
                                </div>
                                <div className="info-box">
                                    <Info size={20} className="info-box-icon" />
                                    <div className="info-box-content">
                                        <strong>Razorpay Integration</strong>
                                        Razorpay is configured as the primary payment gateway. All online payments including Credit/Debit Cards, UPI, Net Banking, and Wallets are processed through Razorpay. Transaction reports are available in the Razorpay Dashboard.
                                    </div>
                                </div>
                            </div>

                            {/* Bank Details Card */}
                            <div className="content-card">
                                <div className="content-card-header">
                                    <h3 className="content-card-title">
                                        <Building2 size={20} /> Bank Account Details (For Bank Transfer)
                                    </h3>
                                </div>
                                <div className="content-card-body" style={{ padding: "24px" }}>
                                    <div className="two-col-grid">
                                        <div>
                                            <div className="payment-info-item" style={{ marginBottom: "12px" }}>
                                                <strong>Bank Name:</strong> HDFC Bank
                                            </div>
                                            <div className="payment-info-item" style={{ marginBottom: "12px" }}>
                                                <strong>Account Name:</strong> Zulu Jewels Pvt. Ltd.
                                            </div>
                                            <div className="payment-info-item" style={{ marginBottom: "12px" }}>
                                                <strong>Account Number:</strong> XXXXXXXX1234
                                            </div>
                                        </div>
                                        <div>
                                            <div className="payment-info-item" style={{ marginBottom: "12px" }}>
                                                <strong>IFSC Code:</strong> HDFC0001234
                                            </div>
                                            <div className="payment-info-item" style={{ marginBottom: "12px" }}>
                                                <strong>Branch:</strong> Mumbai Main Branch
                                            </div>
                                            <div className="payment-info-item" style={{ marginBottom: "12px" }}>
                                                <strong>Account Type:</strong> Current Account
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Transactions Tab Content */}
                    {activeTab === "transactions" && (
                        <>
                            {/* Stats */}
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-card-header">
                                        <div className="stat-card-icon gold">
                                            <IndianRupee size={24} />
                                        </div>
                                    </div>
                                    <div className="stat-card-value">₹{parseFloat(totalRevenue).toLocaleString('en-IN')}</div>
                                    <div className="stat-card-label">Total Revenue</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-header">
                                        <div className="stat-card-icon green">
                                            <CheckCircle2 size={24} />
                                        </div>
                                    </div>
                                    <div className="stat-card-value">{data.transactions.filter(t => t.status === "Completed" || "Success").length}</div>
                                    <div className="stat-card-label">Completed Transactions</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-header">
                                        <div className="stat-card-icon orange">
                                            <Clock size={24} />
                                        </div>
                                    </div>
                                    <div className="stat-card-value">{data.transactions.filter(t => t.status === "Pending").length}</div>
                                    <div className="stat-card-label">Pending Transactions</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-header">
                                        <div className="stat-card-icon blue">
                                            <Banknote size={24} />
                                        </div>
                                    </div>
                                    <div className="stat-card-value">{data.transactions.filter(t => t.payment_method === "COD").length}</div>
                                    <div className="stat-card-label">COD Orders</div>
                                </div>
                            </div>

                            {/* Recent Transactions Table */}
                            <div className="content-card">
                                <div className="content-card-header">
                                    <h3 className="content-card-title">
                                        <IndianRupee size={20} /> Recent Transactions
                                    </h3>
                                </div>
                                <div className="content-card-body">
                                    {loading ? (
                                        <div style={{ textAlign: "center", padding: "40px", opacity: 0.6 }}>
                                            <Clock className="spin-animation" size={24} style={{ marginBottom: "12px", display: "inline-block" }} />
                                            <p>Fetching transactions...</p>
                                        </div>
                                    ) : recentTransactions.length > 0 ? (
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Transaction ID</th>
                                                    <th>Order ID</th>
                                                    <th>Customer</th>
                                                    <th>Amount</th>
                                                    <th>Payment Method</th>
                                                    <th>Status</th>
                                                    <th>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentTransactions.map((txn) => (
                                                    <tr key={`txn-${txn.id}`}>
                                                        <td><strong>{txn.id}</strong></td>
                                                        <td>{txn.orderId}</td>
                                                        <td>{txn.customer}</td>
                                                        <td><strong>{txn.amount}</strong></td>
                                                        <td>{txn.method}</td>
                                                        <td>
                                                            <span className={`status-badge ${txn.status === "Completed" ? "completed" : "pending"}`}>
                                                                {txn.status === "Completed" ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                                                {txn.status}
                                                            </span>
                                                        </td>
                                                        <td>{txn.date}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div style={{ textAlign: "center", padding: "40px", opacity: 0.4 }}>
                                            <IndianRupee size={32} style={{ marginBottom: "12px" }} />
                                            <p>No transactions recorded</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Method Breakdown */}
                            <div className="two-col-grid">
                                <div className="content-card">
                                    <div className="content-card-header">
                                        <h3 className="content-card-title">
                                            <CreditCard size={20} /> Payment Method Breakdown
                                        </h3>
                                    </div>
                                    <div className="content-card-body" style={{ padding: "24px" }}>
                                        <div className="payment-info-item" style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
                                            <span>Razorpay (Cards/UPI/Net Banking)</span>
                                            <strong>65%</strong>
                                        </div>
                                        <div className="payment-info-item" style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
                                            <span>Cash on Delivery (COD)</span>
                                            <strong>20%</strong>
                                        </div>
                                        <div className="payment-info-item" style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
                                            <span>Bank Transfer (NEFT/RTGS)</span>
                                            <strong>10%</strong>
                                        </div>
                                        <div className="payment-info-item" style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span>UPI Direct</span>
                                            <strong>5%</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="content-card">
                                    <div className="content-card-header">
                                        <h3 className="content-card-title">
                                            <Settings size={20} /> Quick Settings
                                        </h3>
                                    </div>
                                    <div className="content-card-body" style={{ padding: "24px" }}>
                                        <div className="payment-info-item" style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
                                            <span>COD Limit</span>
                                            <strong>₹50,000</strong>
                                        </div>
                                        <div className="payment-info-item" style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
                                            <span>Free Shipping Threshold</span>
                                            <strong>₹10,000</strong>
                                        </div>
                                        <div className="payment-info-item" style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
                                            <span>International Shipping</span>
                                            <strong>Enabled</strong>
                                        </div>
                                        <div className="payment-info-item" style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span>Auto-Capture Payments</span>
                                            <strong>Enabled</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Shipping Zone Add/Edit Modal ── */}
            {showZoneModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingZone ? 'Edit Shipping Zone' : 'Add Shipping Zone & Rates'}
                            </h2>
                            <button className="modal-close" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveZone}>
                            <div className="modal-body">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Zone Name <span className="required">*</span></label>
                                        <input
                                            className="form-input"
                                            type="text"
                                            placeholder="e.g. Metro Cities"
                                            value={zoneForm.zone_name}
                                            onChange={(e) => setZoneForm({ ...zoneForm, zone_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Areas / Cities Covered</label>
                                        <input
                                            className="form-input"
                                            type="text"
                                            placeholder="e.g. Mumbai, Delhi, Bangalore"
                                            value={zoneForm.areas}
                                            onChange={(e) => setZoneForm({ ...zoneForm, areas: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Location</label>
                                        <input
                                            className="form-input"
                                            type="text"
                                            placeholder="e.g. India - Tier 1"
                                            value={zoneForm.location}
                                            onChange={(e) => setZoneForm({ ...zoneForm, location: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Shipping Rate (₹)</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0 for Free"
                                            value={zoneForm.shipping_rate}
                                            onChange={(e) => setZoneForm({ ...zoneForm, shipping_rate: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Delivery Time</label>
                                        <input
                                            className="form-input"
                                            type="text"
                                            placeholder="e.g. 2-4 Business Days"
                                            value={zoneForm.delivery_time}
                                            onChange={(e) => setZoneForm({ ...zoneForm, delivery_time: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Status</label>
                                        <select
                                            className="form-input"
                                            value={zoneForm.status ? 'true' : 'false'}
                                            onChange={(e) => setZoneForm({ ...zoneForm, status: e.target.value === 'true' })}
                                        >
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="btn-save" disabled={saving}>
                                    {saving ? 'Saving...' : (editingZone ? 'Update Zone' : 'Add Zone')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Shipping Partner Add/Edit Modal ── */}
            {showPartnerModal && (
                <div className="modal-overlay" onClick={handleClosePartnerModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingPartner ? 'Edit Shipping Partner' : 'Add Shipping Partner'}
                            </h2>
                            <button className="modal-close" onClick={handleClosePartnerModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSavePartner}>
                            <div className="modal-body">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Partner Name <span className="required">*</span></label>
                                        <input
                                            className="form-input"
                                            type="text"
                                            placeholder="e.g. BlueDart, DTDC"
                                            value={partnerForm.partner_name}
                                            onChange={(e) => setPartnerForm({ ...partnerForm, partner_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Type</label>
                                        <input
                                            className="form-input"
                                            type="text"
                                            placeholder="e.g. Courier, Express, Logistics"
                                            value={partnerForm.type}
                                            onChange={(e) => setPartnerForm({ ...partnerForm, type: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Tracking URL</label>
                                        <input
                                            className="form-input"
                                            type="text"
                                            placeholder="e.g. https://track.partner.com"
                                            value={partnerForm.tracking_url}
                                            onChange={(e) => setPartnerForm({ ...partnerForm, tracking_url: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Status</label>
                                        <select
                                            className="form-input"
                                            value={partnerForm.status ? 'true' : 'false'}
                                            onChange={(e) => setPartnerForm({ ...partnerForm, status: e.target.value === 'true' })}
                                        >
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={handleClosePartnerModal}>Cancel</button>
                                <button type="submit" className="btn-save" disabled={savingPartner}>
                                    {savingPartner ? 'Saving...' : (editingPartner ? 'Update Partner' : 'Add Partner')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}