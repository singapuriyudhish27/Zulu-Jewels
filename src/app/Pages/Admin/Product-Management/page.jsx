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
  Trash,
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
  ToggleRight,
  LogOut,
  Clock,
  ToggleLeft,
} from "lucide-react";
import ConfirmModal from "@/components/common/ConfirmModal";

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
    material: [], // Legacy field (merged from variants for display)
    gender: "Unisex",
    price: "",
    stock: "",
    description: "",
    is_active: true,
    variants: [], // New collection of material-specific data
    media: [] // Generic product media
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  // Form states for Category
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    image: null,
    imagePreview: "",
    description: ""
  });

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "danger"
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

    // Use variant data if available
    const hasVariants = item.variants && item.variants.length > 0;
    
    // Total stock across all variants
    const totalStock = hasVariants 
        ? item.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
        : (item.is_active ? 10 : 0); // Fallback

    const variantMaterials = hasVariants 
        ? [...new Set(item.variants.map(v => v.material))].join(", ")
        : (item.material || "Gold");

    const material = variantMaterials;
    const gender = item.gender || "Unisex";

    const isCustom = itemNameLower.includes("custom");

    // Primary image is either a variant-specific primary or a generic primary
    const primaryImg = item.images.find(img => img.is_primary)?.media_url 
                    || item.images[0]?.media_url 
                    || null;

    return {
      id: `PRD-${item.id.toString().padStart(3, '0')}`,
      rawId: item.id,
      name: item.name,
      category: item.category?.name || "Other",
      material: material,
      gender: gender,
      price: formatCurrency(item.price),
      stock: totalStock,
      status: item.is_active ? "Active" : "Out of Stock",
      isCustom: isCustom,
      image: primaryImg,
      allMedia: item.images || [],
      variants: item.variants || []
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
    setConfirmConfig({
      isOpen: true,
      title: "Delete Product",
      message: "Are you sure you want to delete this product? This action cannot be undone.",
      type: "danger",
      onConfirm: async () => {
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
            toast.success("Product deleted successfully");
          } else {
            toast.error(data.message || "Failed to delete product");
          }
        } catch (error) {
          console.error("Delete error:", error);
          toast.error("Something went wrong");
        }
      }
    });
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
      const isEdit = !!editingCategoryId;
      const url = "/api/Pages/Admin/Product-Management/Category";
      const method = isEdit ? "PUT" : "POST";
      
      const formData = new FormData();
      formData.append("name", categoryForm.name);
      formData.append("description", categoryForm.description);
      if (categoryForm.image) {
        formData.append("image", categoryForm.image);
      }
      if (isEdit) {
        formData.append("id", editingCategoryId);
        // If editing and no new image, we might need to send the old URL or some signal
        if (!categoryForm.image) {
            const rawCat = categoriesData.find(c => c.id === editingCategoryId);
            formData.append("image_url", rawCat.image_url || "");
        }
      }

      const res = await fetch(url, {
        method: method,
        body: formData, // Send FormData instead of JSON string
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        // Refresh categories
        const catRes = await fetch('/api/Pages/Admin/Product-Management', { credentials: 'include' });
        const catData = await catRes.json();
        if (catData.success) {
            setCategoriesData(catData.categories || []);
        }

        toast.success(`Category ${isEdit ? 'updated' : 'added'} successfully`);
        setShowAddCategory(false);
        setEditingCategoryId(null);
        setCategoryForm({ name: "", image: null, imagePreview: "", description: "" });
      } else {
        toast.error(data.message || `Failed to ${isEdit ? 'update' : 'add'} category`);
      }
    } catch (error) {
      console.error("Category save error:", error);
    }
  };

  const handleEditCategory = (cat) => {
    const rawCat = categoriesData.find(c => c.id === cat.id);
    setCategoryForm({
      name: rawCat.name,
      image: null,
      imagePreview: rawCat.image_url || "",
      description: rawCat.description || ""
    });
    setEditingCategoryId(cat.id);
    setShowAddCategory(true);
  };

  const handleDeleteCategory = async (catId) => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete Category",
      message: "Are you sure you want to delete this category? This will fail if products are linked to it.",
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/Pages/Admin/Product-Management/Category", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category_id: catId }),
            credentials: "include",
          });
          const data = await res.json();
          if (data.success) {
            setCategoriesData(prev => prev.filter(c => c.id !== catId));
            toast.success("Category deleted successfully");
          } else {
            toast.error(data.message || "Failed to delete category");
          }
        } catch (error) {
          console.error("Category delete error:", error);
          toast.error("Something went wrong");
        }
      }
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isEdit = !!editingProductId;
      const url = "/api/Pages/Admin/Product-Management";
      const method = isEdit ? "PUT" : "POST";

      const formData = new FormData();
      formData.append("name", productForm.name);
      formData.append("category_name", productForm.category_name);
      formData.append("gender", productForm.gender);
      formData.append("material", productForm.material.join(", "));
      formData.append("price", productForm.price);
      formData.append("stock", productForm.stock);
      formData.append("description", productForm.description);
      formData.append("is_active", productForm.is_active);
      if (isEdit) formData.append("id", editingProductId);

      // Package Variants
      const variantsData = productForm.variants.map((v, idx) => {
          // Add new files to formData with specific keys
          const newFiles = v.media.filter(m => m.file).map(m => m.file);
          newFiles.forEach(file => formData.append(`media_variant_${idx}`, file));
          
          // Primary index within this variant's media
          const primaryIdx = v.media.findIndex(m => m.is_primary);
          formData.append(`primary_index_variant_${idx}`, primaryIdx >= 0 ? primaryIdx : 0);

          return {
              id: v.id,
              material: v.material,
              price: v.price,
              stock: v.stock,
              description: v.description,
              existing_media: v.media.filter(m => !m.file) 
          };
      });
      formData.append("variants", JSON.stringify(variantsData));

      // Package Generic Media
      const genericFiles = productForm.media.filter(m => m.file).map(m => m.file);
      genericFiles.forEach(file => formData.append("media", file));
      formData.append("existing_media", JSON.stringify(productForm.media.filter(m => !m.file)));

      const res = await fetch(url, {
        method: method,
        body: formData,
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        window.location.reload(); 
        setShowAddProduct(false);
      } else {
        toast.error(data.message || "Failed to save product");
      }
    } catch (error) {
      console.error("Product save error:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const addVariant = () => {
    setProductForm(prev => ({
      ...prev,
      variants: [...prev.variants, { material: "", price: prev.price, stock: "0", description: "", media: [] }]
    }));
  };

  const removeVariant = (index) => {
    setProductForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleVariantChange = (index, field, value) => {
    setProductForm(prev => {
      const updated = [...prev.variants];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variants: updated };
    });
  };

  const handleVariantMediaChange = (vIdx, e) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      media_type: file.type.startsWith("video/") ? "video" : "image",
      is_primary: productForm.variants[vIdx].media.length === 0
    }));
    setProductForm(prev => {
      const updated = [...prev.variants];
      updated[vIdx] = { ...updated[vIdx], media: [...updated[vIdx].media, ...newMedia] };
      return { ...prev, variants: updated };
    });
  };

  const removeVariantMedia = (vIdx, mIdx) => {
    setProductForm(prev => {
      const updatedVariants = [...prev.variants];
      const updatedMedia = [...updatedVariants[vIdx].media];
      updatedMedia.splice(mIdx, 1);
      if (updatedMedia.length > 0 && !updatedMedia.some(m => m.is_primary)) {
        updatedMedia[0].is_primary = true;
      }
      updatedVariants[vIdx] = { ...updatedVariants[vIdx], media: updatedMedia };
      return { ...prev, variants: updatedVariants };
    });
  };

  const setVariantPrimaryMedia = (vIdx, mIdx) => {
    setProductForm(prev => {
      const updatedVariants = [...prev.variants];
      updatedVariants[vIdx] = {
        ...updatedVariants[vIdx],
        media: updatedVariants[vIdx].media.map((m, i) => ({ ...m, is_primary: i === mIdx }))
      };
      return { ...prev, variants: updatedVariants };
    });
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      media_type: file.type.startsWith("video/") ? "video" : "image",
      is_primary: productForm.media.length === 0 // First one primary by default
    }));
    setProductForm(prev => ({ ...prev, media: [...prev.media, ...newMedia] }));
  };

  const removeMedia = (index) => {
    setProductForm(prev => {
      const updatedMedia = [...prev.media];
      updatedMedia.splice(index, 1);
      // If removed was primary, set first one as primary
      if (updatedMedia.length > 0 && !updatedMedia.some(m => m.is_primary)) {
        updatedMedia[0].is_primary = true;
      }
      return { ...prev, media: updatedMedia };
    });
  };

  const setPrimaryMedia = (index) => {
    setProductForm(prev => ({
      ...prev,
      media: prev.media.map((m, i) => ({ ...m, is_primary: i === index }))
    }));
  };


  return (
    <>
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
                setProductForm({ name: "", category_name: "", gender: "Unisex", material: [], price: "", stock: "", description: "", is_active: true, variants: [], media: [] });
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
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#2c2c2c' }}>Categories</h3>
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
                <div 
                  className={`category-card ${filterCategory === cat.name ? 'active' : ''}`} 
                  key={cat.id} 
                  onClick={() => setFilterCategory(filterCategory === cat.name ? 'all' : cat.name)}
                  style={cat.image_url ? {
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.8), rgba(255,255,255,0.8)), url(${cat.image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  } : {}}
                >
                  <div className="category-header-row">
                    <div className="category-name">{cat.name}</div>
                    <div className="category-actions">
                      <button className="cat-action-btn edit" onClick={(e) => { e.stopPropagation(); handleEditCategory(cat); }} title="Edit Category"><Edit size={14} /></button>
                      <button className="cat-action-btn delete" onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }} title="Delete Category"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="category-count">{cat.products} Products</div>
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
                                material: typeof product.material === 'string' ? product.material.split(", ").filter(m => m) : [],
                                price: product.price.replace(/[^\d]/g, ""),
                                stock: product.stock,
                                description: productsData.find(p => p.id === product.rawId)?.description || "", 
                                is_active: product.status === "Active",
                                variants: product.variants.map(v => ({
                                  ...v,
                                  media: product.allMedia.filter(m => m.variant_id === v.id).map(m => ({
                                    ...m,
                                    preview: m.media_url
                                  }))
                                })),
                                media: product.allMedia.filter(m => !m.variant_id).map(m => ({ ...m, preview: m.media_url }))
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

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="modal-overlay" onClick={() => setShowAddProduct(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px", width: "90%" }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingProductId ? "Edit Product" : "Add New Product"}</h2>
              <button className="modal-close" onClick={() => setShowAddProduct(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveProduct}>
              <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input type="text" className="form-input" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required placeholder="Enter product name" />
                </div>
                
                {/* Base/Generic Media Upload Section */}
                <div className="form-group">
                  <label className="form-label">Base/Generic Media (Applies to all metals)</label>
                  <div className="media-upload-area" style={{ border: "2px dashed #ddd", padding: "15px", borderRadius: "8px", textAlign: "center", marginBottom: "12px" }}>
                    <input type="file" id="generic-media-input" multiple accept="image/*,video/*" onChange={handleMediaChange} style={{ display: "none" }} />
                    <label htmlFor="generic-media-input" style={{ cursor: "pointer", color: "#666", fontSize: '13px' }}>
                      <Plus size={20} style={{ marginBottom: "4px" }} />
                      <p>Add common images/videos</p>
                    </label>
                  </div>
                  
                  {productForm.media.length > 0 && (
                    <div className="media-preview-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "8px", marginBottom: '16px' }}>
                      {productForm.media.map((item, idx) => (
                        <div key={idx} style={{ position: "relative", borderRadius: "6px", overflow: "hidden", border: "1px solid #ddd" }}>
                          {item.media_type === "video" ? (
                            <div style={{ width: "100%", height: "60px", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}><CheckCircle2 size={16} color="#666" /></div>
                          ) : (
                            <img src={item.preview} alt="preview" style={{ width: "100%", height: "60px", objectFit: "cover" }} />
                          )}
                          <div style={{ position: "absolute", top: "2px", right: "2px" }}>
                            <button type="button" onClick={() => removeMedia(idx)} style={{ background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: "18px", height: "18px", cursor: "pointer" }}><X size={10} color="#e74c3c" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* --- Product Variants (Metals) Section --- */}
                <div style={{ margin: '24px 0', padding: '20px', background: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#2c2c2c' }}>Product Variants (Metals)</h3>
                    <button type="button" className="add-btn secondary" onClick={addVariant} style={{ padding: '6px 12px', fontSize: '12px' }}>
                      <Plus size={14} /> Add Metal Variant
                    </button>
                  </div>

                  {productForm.variants.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#888', padding: '20px', fontSize: '13px' }}>No variants added yet. Add a variant to manage material-specific images.</p>
                  ) : (
                    <div className="variants-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {productForm.variants.map((v, vIdx) => (
                        <div key={vIdx} className="variant-card" style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #ddd', position: 'relative' }}>
                          <button type="button" onClick={() => removeVariant(vIdx)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c' }}><Trash2 size={16} /></button>
                          
                          <div className="form-row">
                            <div className="form-group">
                              <label className="form-label">Metal *</label>
                              <input 
                                type="text" 
                                className="form-input" 
                                value={v.material} 
                                onChange={(e) => handleVariantChange(vIdx, 'material', e.target.value)} 
                                required 
                                placeholder="e.g. Gold, Silver, 18K Rose Gold" 
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Price (₹) *</label>
                              <input type="number" className="form-input" value={v.price} onChange={(e) => handleVariantChange(vIdx, 'price', e.target.value)} required placeholder="Price for this metal" />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Stock *</label>
                              <input type="number" className="form-input" value={v.stock} onChange={(e) => handleVariantChange(vIdx, 'stock', e.target.value)} required placeholder="Stock" />
                            </div>
                          </div>

                          <div className="form-group">
                            <label className="form-label">{v.material} Specific Media *</label>
                            <div className="media-upload-area" style={{ border: "2px dashed #eee", padding: "12px", borderRadius: "8px", textAlign: "center", marginBottom: "12px" }}>
                              <input type="file" id={`variant-media-${vIdx}`} multiple accept="image/*,video/*" onChange={(e) => handleVariantMediaChange(vIdx, e)} style={{ display: "none" }} />
                              <label htmlFor={`variant-media-${vIdx}`} style={{ cursor: "pointer", color: "#666", fontSize: '12px' }}>
                                <ImageIcon size={20} style={{ marginBottom: "4px" }} />
                                <p>Upload images for {v.material}</p>
                              </label>
                            </div>

                            {v.media.length > 0 && (
                              <div className="media-preview-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "8px" }}>
                                {v.media.map((item, mIdx) => (
                                  <div key={mIdx} className={`media-preview-card ${item.is_primary ? "primary" : ""}`} style={{ position: "relative", borderRadius: "6px", overflow: "hidden", border: item.is_primary ? "2px solid #d4af37" : "1px solid #ddd" }}>
                                    {item.media_type === "video" ? (
                                      <div style={{ width: "100%", height: "60px", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}><CheckCircle2 size={16} color="#666" /></div>
                                    ) : (
                                      <img src={item.preview} alt="preview" style={{ width: "100%", height: "60px", objectFit: "cover" }} />
                                    )}
                                    <div className="media-actions" style={{ position: "absolute", top: "2px", right: "2px", display: "flex", gap: "2px" }}>
                                      <button type="button" onClick={() => setVariantPrimaryMedia(vIdx, mIdx)} title="Set Primary" style={{ background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer" }}><Star size={10} color={item.is_primary ? "#d4af37" : "#666"} /></button>
                                      <button type="button" onClick={() => removeVariantMedia(vIdx, mIdx)} style={{ background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer" }}><X size={10} color="#e74c3c" /></button>
                                    </div>
                                    {item.is_primary && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#d4af37", color: "white", fontSize: "8px", textAlign: "center", padding: "1px" }}>PRIMARY</div>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="form-group">
                            <label className="form-label">{v.material} Description (Optional)</label>
                            <textarea className="form-input" rows="2" value={v.description} onChange={(e) => handleVariantChange(vIdx, 'description', e.target.value)} placeholder={`Unique details for the ${v.material} version`}></textarea>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Base Category *</label>
                    <select className="form-select" value={productForm.category_name} onChange={(e) => setProductForm({ ...productForm, category_name: e.target.value })} required>
                      <option value="">Select Category</option>
                      {categoriesData.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Base Gender *</label>
                    <select className="form-select" value={productForm.gender} onChange={(e) => setProductForm({ ...productForm, gender: e.target.value })} required>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Unisex">Unisex</option>
                      <option value="Couple">Couple</option>
                    </select>
                  </div>
                </div>
                


                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Base Price (₹) *</label>
                    <input type="number" className="form-input" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required placeholder="Default price" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Base Stock Quantity *</label>
                    <input type="number" className="form-input" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} required placeholder="Default stock" />
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
                <button type="submit" className="add-btn" disabled={loading}><Save size={16} /> {loading ? "Saving..." : (editingProductId ? "Update Product" : "Save Product")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="modal-overlay" onClick={() => { setShowAddCategory(false); setEditingCategoryId(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingCategoryId ? "Edit Category" : "Add New Category"}</h2>
              <button className="modal-close" onClick={() => { setShowAddCategory(false); setEditingCategoryId(null); }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveCategory}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input type="text" className="form-input" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required placeholder="e.g., Anklets, Nose Rings" />
                </div>
                <div className="form-group">
                  <label className="form-label">Landing Page Image *</label>
                  <div className="media-upload-area" style={{ border: "2px dashed #ddd", padding: "15px", borderRadius: "8px", textAlign: "center", marginBottom: "12px" }}>
                    <input 
                      type="file" 
                      id="category-image-input" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setCategoryForm({ 
                            ...categoryForm, 
                            image: file, 
                            imagePreview: URL.createObjectURL(file) 
                          });
                        }
                      }} 
                      style={{ display: "none" }} 
                    />
                    <label htmlFor="category-image-input" style={{ cursor: "pointer", color: "#666", fontSize: '13px' }}>
                      <Plus size={20} style={{ marginBottom: "4px" }} />
                      <p>{categoryForm.imagePreview ? "Change Image" : "Upload Category Image"}</p>
                    </label>
                  </div>
                  {categoryForm.imagePreview && (
                    <div style={{ position: "relative", width: "100%", height: "120px", borderRadius: "8px", overflow: "hidden", border: "1px solid #ddd" }}>
                      <img src={categoryForm.imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button 
                        type="button" 
                        onClick={() => setCategoryForm({ ...categoryForm, image: null, imagePreview: "" })} 
                        style={{ position: "absolute", top: "5px", right: "5px", background: "white", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                      >
                        <X size={14} color="#e74c3c" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows="3" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} placeholder="Enter category description"></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="add-btn"><Save size={16} /> {editingCategoryId ? "Update Category" : "Create Category"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
      />
    </>
  );
}