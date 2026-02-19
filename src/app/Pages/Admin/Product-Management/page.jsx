"use client";

import "./products.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  CircleDot,
  Gem,
  Watch,
  Heart,
  Layers,
  Palette,
  X,
  Save,
  ImageIcon as ImageIcon,
  Clock,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

export default function ProductManagementPage() {
  const router = useRouter();
  const [productsData, setProductsData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterMaterial, setFilterMaterial] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Form states for Add/Edit Product
  const [productForm, setProductForm] = useState({
    name: "",
    category_name: "",
    gender: "Unisex",
    material: "Gold",
    price: "",
    stock: "",
    description: "",
    is_active: true
  });
  const [editingProductId, setEditingProductId] = useState(null);

  // Form states for Category
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    available_materials: ["Gold"],
    description: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/Pages/Admin/Product-Management', {
          credentials: 'include',
        });
        const result = await response.json();
        if (result.success) {
          setProductsData(result.data || []);
          setCategoriesData(result.categories || []);
        } else {
          console.error("Failed to fetch products:", result.message);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Mapping logic based on API data
  const products = productsData.map(item => {
    const itemNameLower = item.name.toLowerCase();

    // Infer Material
    let material = "Gold"; // Fallback
    if (item.category?.available_materials) {
      material = item.category.available_materials.split(',')[0].trim();
    }
    if (itemNameLower.includes("silver")) material = "Silver";
    else if (itemNameLower.includes("diamond")) material = "Diamond";

    // Infer Gender
    let gender = "Unisex";
    if (itemNameLower.includes("women") || itemNameLower.includes("lady") || itemNameLower.includes("bride")) gender = "Women";
    else if (itemNameLower.includes("men") || itemNameLower.includes("gent")) gender = "Men";

    const isCustom = itemNameLower.includes("custom");

    return {
      id: `PRD-${item.id.toString().padStart(3, '0')}`,
      rawId: item.id,
      name: item.name,
      category: item.category?.name || "Other",
      material: material,
      gender: gender,
      price: formatCurrency(item.price),
      stock: item.is_active ? Math.floor(Math.random() * 20) + 5 : 0, // Simulated stock for UI matching
      status: item.is_active ? "Active" : "Out of Stock",
      isCustom: isCustom,
      image: item.images.find(img => img.is_primary)?.image_url || null
    };
  });

  // Dynamic Categories Stats
  const categories = categoriesData.map(cat => {
    const catProducts = products.filter(p => p.category === cat.name);
    return {
      id: cat.id,
      name: cat.name,
      products: catProducts.length,
      gold: catProducts.filter(p => p.material === "Gold").length,
      silver: catProducts.filter(p => p.material === "Silver").length,
      diamond: catProducts.filter(p => p.material === "Diamond").length
    };
  });

  const handleProfile = () => {
    router.push("/Pages/Admin/Profile");
  };

  // Categories data
  // No longer needed, calculated from productsData

  // Custom products
  const customProducts = products.filter(p => p.isCustom);

  const filteredProducts = products.filter(p => {
    const matchesTab = activeTab === "all" || (activeTab === "custom" && p.isCustom);
    const matchesCat = filterCategory === "all" || p.category === filterCategory;
    const matchesMat = filterMaterial === "all" || p.material === filterMaterial;
    const matchesGen = filterGender === "all" || p.gender === filterGender;
    return matchesTab && matchesCat && matchesMat && matchesGen;
  });

  const getStatusStyle = (status) => {
    if (status === "Active") return { bg: "rgba(39, 174, 96, 0.1)", color: "#27ae60" };
    if (status === "Low Stock") return { bg: "rgba(243, 156, 18, 0.1)", color: "#f39c12" };
    return { bg: "rgba(231, 76, 60, 0.1)", color: "#e74c3c" };
  };

  const getMaterialStyle = (material) => {
    if (material === "Gold") return { bg: "linear-gradient(135deg, #d4af37, #f4e4c1)", color: "#2c2c2c" };
    if (material === "Silver") return { bg: "linear-gradient(135deg, #c0c0c0, #e8e8e8)", color: "#2c2c2c" };
    return { bg: "linear-gradient(135deg, #b9f2ff, #e0f7fa)", color: "#00838f" };
  };

  // 🔹 Interaction Handlers
  const handleDeleteProduct = async (id, isActive) => {
    if (isActive) {
      toast.error("Active products cannot be deleted. Please turn it off first.");
      return;
    }
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch("/api/Pages/Admin/Product-Management", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: id }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setProductsData(prev => prev.filter(p => p.id !== id));
      } else {
        toast.error(data.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch("/api/Pages/Admin/Product-Management", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentStatus }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setProductsData(prev => prev.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));
      } else {
        toast.error(data.message || "Failed to update product status");
      }
    } catch (error) {
      console.error("Toggle error:", error);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/Pages/Admin/Product-Management/Category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setCategoriesData(prev => [...prev, data.data]);
        setShowAddCategory(false);
        setCategoryForm({ name: "", available_materials: ["Gold"], description: "" });
      } else {
        toast.error(data.message || "Failed to add category");
      }
    } catch (error) {
      console.error("Category save error:", error);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const isEdit = !!editingProductId;
      const url = "/api/Pages/Admin/Product-Management";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        ...productForm,
        id: isEdit ? editingProductId : undefined,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock)
      };

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        if (isEdit) {
          setProductsData(prev => prev.map(p => p.id === editingProductId ? data.data : p));
        } else {
          setProductsData(prev => [data.data, ...prev]);
        }
        setShowAddProduct(false);
        setEditingProductId(null);
        setProductForm({ name: "", category_name: "", gender: "Unisex", material: "Gold", price: "", stock: "", description: "", is_active: true });
      } else {
        toast.error(data.message || "Failed to save product");
      }
    } catch (error) {
      console.error("Product save error:", error);
    }
  };

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
          /><span>ZULU JEWELS</span><br />Admin Panel</div>
        <div className="admin-menu">
          <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin")}><LayoutDashboard size={18} /> Dashboard</div>
          <div className="admin-menu-item active" onClick={() => router.push("/Pages/Admin/Product-Management")}><Package size={18} /> Product Management</div>
          <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin/Order-Management")}><ShoppingCart size={18} /> Orders</div>
          <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin/Customer-Management")}><Users size={18} /> Customers</div>
          <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin/Contact-Management")}><PhoneCall size={18} /> Contact & Inquiry</div>
          <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin/Reviews-Management")}><Star size={18} /> Reviews & Ratings</div>
          <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin/Marketing")}><Megaphone size={18} /> Marketing</div>
          <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin/Shipping-Management")}><Truck size={18} /> Shipping & Payment</div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Main */}
      <div className="admin-main">
        <div className="admin-header">
          <input className="admin-search" placeholder="Search products..." />
          <div className="admin-user">
            <div className="admin-avatar" onClick={handleProfile}>ZJ</div>
          </div>
        </div>

        <div className="admin-content">
          {/* Page Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Product Management</h1>
              <p className="page-subtitle">Manage products by category, material (Gold, Silver, Diamond) & gender</p>
            </div>
            <div className="header-actions">
              <button className="add-btn secondary" onClick={() => setShowAddCategory(true)}><Layers size={18} /> Add Category</button>
              <button className="add-btn" onClick={() => {
                setEditingProductId(null);
                setProductForm({ name: "", category_name: "", gender: "Unisex", material: "Gold", price: "", stock: "", description: "", is_active: true });
                setShowAddProduct(true);
              }}><Plus size={18} /> Add Product</button>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon gold"><Package size={24} /></div></div>
              <div className="stat-card-value">{products.length}</div>
              <div className="stat-card-label">Total Products</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon orange"><Layers size={24} /></div></div>
              <div className="stat-card-value">{categories.length}</div>
              <div className="stat-card-label">Categories</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon blue"><Palette size={24} /></div></div>
              <div className="stat-card-value">{customProducts.length}</div>
              <div className="stat-card-label">Custom Products</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon green"><CheckCircle2 size={24} /></div></div>
              <div className="stat-card-value">{products.filter(p => p.status === "Active").length}</div>
              <div className="stat-card-label">In Stock</div>
            </div>
          </div>

          {/* Categories */}
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#2c2c2c' }}>Categories (with Material Options)</h3>
          <div className="category-grid">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div className="category-card" key={i} style={{ opacity: 0.5 }}>
                  <div className="category-name">Loading...</div>
                  <div className="category-count">Fetching products</div>
                  <div className="material-tags" style={{ height: '24px' }}></div>
                </div>
              ))
            ) : categories.length > 0 ? (
              categories.map((cat) => (
                <div className={`category-card ${filterCategory === cat.name ? 'active' : ''}`} key={cat.id} onClick={() => setFilterCategory(filterCategory === cat.name ? 'all' : cat.name)}>
                  <div className="category-name">{cat.name}</div>
                  <div className="category-count">{cat.products} Products</div>
                  <div className="material-tags">
                    <span className="material-tag gold">Gold: {cat.gold}</span>
                    <span className="material-tag silver">Silver: {cat.silver}</span>
                    <span className="material-tag diamond">Diamond: {cat.diamond}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="category-card" style={{ opacity: 0.5 }}>
                <div className="category-name">No Categories</div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <button className={`tab-btn ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}><Package size={16} /> All Products</button>
            <button className={`tab-btn ${activeTab === "custom" ? "active" : ""}`} onClick={() => setActiveTab("custom")}><Palette size={16} /> Custom Products ({customProducts.length})</button>
          </div>

          {/* Products Table */}
          <div className="content-card">
            <div className="toolbar">
              <Filter size={18} color="#4a4a4a" />
              <select className="filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <select className="filter-select" value={filterMaterial} onChange={(e) => setFilterMaterial(e.target.value)}>
                <option value="all">All Materials</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Diamond">Diamond</option>
              </select>
              <select className="filter-select" value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
                <option value="all">All Genders</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
              </select>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Product</th><th>Category</th><th>Material</th><th>Gender</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "50px", opacity: 0.6 }}>
                      <Clock className="spin-animation" size={24} style={{ marginBottom: "12px", display: "inline-block" }} />
                      <p>Fetching product catalog...</p>
                    </td>
                  </tr>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const statusStyle = getStatusStyle(product.status);
                    const materialStyle = getMaterialStyle(product.material);
                    return (
                      <tr key={product.id}>
                        <td>
                          <div className="product-cell">
                            <div className="product-img">
                              {product.image ? (
                                <Image src={product.image} alt={product.name} width={40} height={40} style={{ objectFit: 'cover', borderRadius: '4px' }} />
                              ) : (
                                <ImageIcon size={20} />
                              )}
                            </div>
                            <div className="product-info">
                              <h4>{product.name}{product.isCustom && <span className="custom-badge">CUSTOM</span>}</h4>
                              <span>{product.id}</span>
                            </div>
                          </div>
                        </td>
                        <td>{product.category}</td>
                        <td><span className="material-badge" style={{ background: materialStyle.bg, color: materialStyle.color }}>{product.material}</span></td>
                        <td><span className={`gender-badge ${product.gender.toLowerCase()}`}>{product.gender}</span></td>
                        <td><strong>{product.price}</strong></td>
                        <td>{product.stock}</td>
                        <td><span className="status-badge" style={{ background: statusStyle.bg, color: statusStyle.color }}>{product.status}</span></td>
                        <td>
                          <div className="action-icons">
                            <div className="action-icon" onClick={() => router.push(`/Pages/Products/${product.rawId}`)}><Eye size={16} /></div>
                            <div className="action-icon" onClick={() => handleToggleActive(product.rawId, product.status === "Active")} title={product.status === "Active" ? "Turn Off" : "Turn On"}>
                              {product.status === "Active" ? (
                                <ToggleRight size={16} color="#27ae60" />
                              ) : (
                                <ToggleLeft size={16} color="#e74c3c" />
                              )}
                            </div>
                            <div className="action-icon" onClick={() => {
                              setEditingProductId(product.rawId);
                              setProductForm({
                                name: product.name,
                                category_name: product.category,
                                gender: product.gender,
                                material: product.material,
                                price: product.price.replace(/[^\d]/g, ""),
                                stock: product.stock,
                                description: "", // API doesn't return full desc in list usually
                                is_active: product.status === "Active"
                              });
                              setShowAddProduct(true);
                            }}><Edit size={16} /></div>
                            <div
                              className={`action-icon delete ${product.status === "Active" ? "disabled" : ""}`}
                              onClick={() => handleDeleteProduct(product.rawId, product.status === "Active")}
                              title={product.status === "Active" ? "Turn off to delete" : "Delete Product"}
                              style={product.status === "Active" ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                            >
                              <Trash2 size={16} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "50px", opacity: 0.6 }}>
                      <Package size={32} style={{ marginBottom: "12px", opacity: 0.2 }} />
                      <p>No products found matching your filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="modal-overlay" onClick={() => setShowAddProduct(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Product</h2>
              <button className="modal-close" onClick={() => setShowAddProduct(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveProduct}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input type="text" className="form-input" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required placeholder="Enter product name" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className="form-select" value={productForm.category_name} onChange={(e) => setProductForm({ ...productForm, category_name: e.target.value })} required>
                      <option value="">Select Category</option>
                      {categoriesData.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender *</label>
                    <select className="form-select" value={productForm.gender} onChange={(e) => setProductForm({ ...productForm, gender: e.target.value })} required>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Unisex">Unisex</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Material *</label>
                  <div className="checkbox-group">
                    {["Gold", "Silver", "Diamond"].map(m => (
                      <label className="checkbox-item" key={m}>
                        <input type="radio" name="material" value={m} checked={productForm.material === m} onChange={(e) => setProductForm({ ...productForm, material: e.target.value })} /> {m}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Price (₹) *</label>
                    <input type="number" className="form-input" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required placeholder="Enter price" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Quantity *</label>
                    <input type="number" className="form-input" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} required placeholder="Enter stock" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Product Status</label>
                  <div className="checkbox-group">
                    <label className="checkbox-item"><input type="checkbox" checked={productForm.is_active} onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })} /> Active</label>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Product Description</label>
                  <textarea className="form-input" rows="3" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} placeholder="Enter product description"></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="add-btn secondary" onClick={() => setShowAddProduct(false)}>Cancel</button>
                <button type="submit" className="add-btn"><Save size={16} /> {editingProductId ? "Update Product" : "Save Product"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="modal-overlay" onClick={() => setShowAddCategory(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Category</h2>
              <button className="modal-close" onClick={() => setShowAddCategory(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveCategory}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input type="text" className="form-input" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required placeholder="e.g., Anklets, Nose Rings" />
                </div>
                <div className="form-group">
                  <label className="form-label">Available Materials *</label>
                  <div className="checkbox-group">
                    {["Gold", "Silver", "Diamond"].map(m => (
                      <label className="checkbox-item" key={m}>
                        <input
                          type="checkbox"
                          name="available_materials"
                          value={m}
                          checked={categoryForm.available_materials.includes(m)}
                          onChange={(e) => {
                            const val = e.target.value;
                            const isChecked = e.target.checked;
                            setCategoryForm(prev => {
                              const materials = isChecked
                                ? [...prev.available_materials, val]
                                : prev.available_materials.filter(item => item !== val);
                              return { ...prev, available_materials: materials };
                            });
                          }}
                        /> {m}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows="3" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} placeholder="Enter category description"></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="add-btn secondary" onClick={() => setShowAddCategory(false)}>Cancel</button>
                <button type="submit" className="add-btn"><Save size={16} /> Create Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}