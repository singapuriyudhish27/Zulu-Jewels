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
  Settings,
  Video,
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
    price: "",
    stock: "",
    description: "",
    craftsmanship_video: "",
    craftsmanship_video_file: null,
    is_active: true,
    variants: [], // New collection of material-specific data
    media: [], // Generic product media
    specifications: {} // Category-specific specifications
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [editingVariantIdx, setEditingVariantIdx] = useState(null);
  const [variantDraft, setVariantDraft] = useState({ material: "", metal_type: "", metal_purity: "", metal_color: "", metal_weight: "", gemstone_type: "None", gemstone_tcw: "", gemstone_color: "", gemstone_clarity: "", gemstone_cut: "", gemstone_shape: "", gemstone_setting: "", gemstone_center_carat: "", gemstone_cert_agency: "", gemstone_cert_number: "", price: "", stock: "0", description: "", media: [] });
  const [showGemstoneModal, setShowGemstoneModal] = useState(false);
  const [editingGemstoneVariantIdx, setEditingGemstoneVariantIdx] = useState(null);
  const [gemstoneDraft, setGemstoneDraft] = useState({ gemstone_type: "None", gemstone_tcw: "", gemstone_color: "", gemstone_clarity: "", gemstone_cut: "", gemstone_shape: "", gemstone_setting: "", gemstone_center_carat: "", gemstone_cert_agency: "", gemstone_cert_number: "" });
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [specsDraft, setSpecsDraft] = useState({});

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

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/Admin/Product-Management?page=${page}&limit=${pageSize}`, {
        credentials: 'include',
      });
      const result = await response.json();
      if (result.success) {
        setProductsData(result.data || []);
        setCategoriesData(result.categories || []);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1);
          setCurrentPage(result.pagination.currentPage || 1);
        }
      } else {
        console.error("Failed to fetch products:", result.message);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

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
      variants: item.variants || [],
      specifications: item.specifications || {}
    };
  });

  // Dynamic Categories Stats
  const categories = categoriesData.map(cat => {
    const catProducts = products.filter(p => p.category === cat.name);
    return {
      id: cat._id?.toString() || cat.id,
      name: cat.name,
      image_url: cat.image_url,
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
    const matLower = (material || "").toLowerCase();
    if (matLower.includes("gold")) return { bg: "linear-gradient(135deg, #d4af37, #f4e4c1)", color: "#2c2c2c" };
    if (matLower.includes("silver")) return { bg: "linear-gradient(135deg, #c0c0c0, #e8e8e8)", color: "#2c2c2c" };
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
          const res = await fetch("/api/Admin/Product-Management", {
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
      const res = await fetch("/api/Admin/Product-Management", {
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
    setLoading(true);
    try {
      const isEdit = !!editingCategoryId;
      const url = "/api/Admin/Product-Management/Category";
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
            const rawCat = categoriesData.find(c => (c._id?.toString() || c.id) === editingCategoryId);
            formData.append("image_url", rawCat ? rawCat.image_url || "" : "");
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
        const catRes = await fetch('/api/Admin/Product-Management', { credentials: 'include' });
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
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (cat) => {
    const rawCat = categoriesData.find(c => (c._id?.toString() || c.id) === cat.id);
    if (rawCat) {
      setCategoryForm({
        name: rawCat.name,
        image: null,
        imagePreview: rawCat.image_url || "",
        description: rawCat.description || ""
      });
      setEditingCategoryId(cat.id);
      setShowAddCategory(true);
    } else {
      toast.error("Category details could not be loaded.");
    }
  };

  const handleDeleteCategory = async (catId) => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete Category",
      message: "Are you sure you want to delete this category? This will fail if products are linked to it.",
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/Admin/Product-Management/Category", {
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

  const doSaveProduct = async (formData) => {
    setLoading(true);
    try {
      const isEdit = !!editingProductId;
      const url = "/api/Admin/Product-Management";
      const method = isEdit ? "PUT" : "POST";

      const compressImageOrToBase64 = file => new Promise((resolve, reject) => {
        if (!file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
          return;
        }
        const img = window.Image ? new window.Image() : new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(img.src);
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width = Math.round((width * MAX_HEIGHT) / height); height = MAX_HEIGHT; }
          }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.onerror = () => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = err => reject(err);
        };
      });

      const mappedMedia = [];
      for (const m of formData.media) {
        if (m.file) {
          const base64 = await compressImageOrToBase64(m.file);
          mappedMedia.push({ fileData: base64, fileName: m.file.name, fileType: m.file.type, is_primary: Boolean(m.is_primary) });
        } else {
          mappedMedia.push({ id: m._id || m.id, media_url: m.media_url || m.preview || m.url, media_type: m.media_type || "image", is_primary: Boolean(m.is_primary) });
        }
      }

      const mappedVariants = [];
      for (const v of formData.variants) {
        const variantMedia = [];
        if (v.media) {
          for (const m of v.media) {
            if (m.file) {
              const base64 = await compressImageOrToBase64(m.file);
              variantMedia.push({ fileData: base64, fileName: m.file.name, fileType: m.file.type, is_primary: Boolean(m.is_primary) });
            } else {
              variantMedia.push({ id: m._id || m.id, media_url: m.media_url || m.preview || m.url, media_type: m.media_type || "image", is_primary: Boolean(m.is_primary) });
            }
          }
        }
        mappedVariants.push({ 
          id: v._id || v.id, 
          material: v.material, 
          metal_type: v.metal_type,
          metal_purity: v.metal_purity,
          metal_color: v.metal_color,
          metal_weight: v.metal_weight,
          gemstone_type: v.gemstone_type,
          gemstone_tcw: v.gemstone_tcw,
          gemstone_color: v.gemstone_color,
          gemstone_clarity: v.gemstone_clarity,
          gemstone_cut: v.gemstone_cut,
          gemstone_shape: v.gemstone_shape,
          gemstone_setting: v.gemstone_setting,
          gemstone_center_carat: v.gemstone_center_carat,
          gemstone_cert_agency: v.gemstone_cert_agency,
          gemstone_cert_number: v.gemstone_cert_number,
          price: v.price, 
          stock: v.stock, 
          description: v.description, 
          media: variantMedia 
        });
      }

      const finalMaterial = mappedVariants.length > 0
        ? [...new Set(mappedVariants.map(v => v.material).filter(m => m))].join(", ")
        : (typeof formData.material === 'string' ? formData.material : formData.material.join(", "));

      let craftsmanshipVideoPayload = formData.craftsmanship_video || "";
      if (formData.craftsmanship_video_file) {
        craftsmanshipVideoPayload = await compressImageOrToBase64(formData.craftsmanship_video_file);
      }

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProductId,
          name: formData.name,
          category_name: formData.category_name,
          gender: formData.gender,
          material: finalMaterial,
          price: formData.price,
          stock: formData.stock,
          description: formData.description,
          craftsmanship_video: craftsmanshipVideoPayload,
          is_active: formData.is_active,
          variants: mappedVariants,
          media: mappedMedia
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Product ${isEdit ? 'updated' : 'added'} successfully`);
        await fetchData(currentPage);
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

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    await doSaveProduct(productForm);
  };

  const addVariant = () => {
    setVariantDraft({ 
      material: "", 
      metal_type: "", 
      metal_purity: "", 
      metal_color: "", 
      metal_weight: "", 
      gemstone_type: "None",
      gemstone_tcw: "",
      gemstone_color: "",
      gemstone_clarity: "",
      gemstone_cut: "",
      gemstone_shape: "",
      gemstone_setting: "",
      gemstone_center_carat: "",
      gemstone_cert_agency: "",
      gemstone_cert_number: "",
      price: productForm.price || "", 
      stock: "0", 
      description: "", 
      media: [] 
    });
    setEditingVariantIdx(null);
    setShowVariantModal(true);
  };

  const removeVariant = (index) => {
    setProductForm(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));
  };

  const openEditVariant = (idx) => {
    const variant = productForm.variants[idx];
    
    // Parse legacy variant details if metal_type is missing but material is present
    let parsedType = variant.metal_type || "";
    let parsedPurity = variant.metal_purity || "";
    let parsedColor = variant.metal_color || "";
    let parsedWeight = variant.metal_weight || "";

    if (!parsedType && variant.material) {
      const mat = variant.material.toLowerCase();
      // Try to parse metal type
      if (mat.includes("gold")) parsedType = "Gold";
      else if (mat.includes("silver")) parsedType = "Silver";
      else if (mat.includes("platinum")) parsedType = "Platinum";
      else if (mat.includes("titanium")) parsedType = "Titanium";

      // Try to parse purity (e.g. 18K, 14K, 925, 950)
      if (mat.includes("10k")) parsedPurity = "10K";
      else if (mat.includes("14k")) parsedPurity = "14K";
      else if (mat.includes("18k")) parsedPurity = "18K";
      else if (mat.includes("22k")) parsedPurity = "22K";
      else if (mat.includes("925")) parsedPurity = "925 Sterling Silver";
      else if (mat.includes("950")) parsedPurity = "950 Platinum";

      // Try to parse color
      if (mat.includes("yellow")) parsedColor = "Yellow Gold";
      else if (mat.includes("white")) parsedColor = "White Gold";
      else if (mat.includes("rose")) parsedColor = "Rose Gold";
      else if (mat.includes("two-tone") || mat.includes("two tone")) parsedColor = "Two-Tone";
      else if (mat.includes("silver")) parsedColor = "Silver";

      // Try to parse weight (e.g. (3.5g) or 3.5g)
      const weightMatch = variant.material.match(/(\d+(?:\.\d+)?)\s*g/i);
      if (weightMatch) {
        parsedWeight = weightMatch[1];
      }
    }

    setVariantDraft({ 
      ...variant, 
      metal_type: parsedType,
      metal_purity: parsedPurity,
      metal_color: parsedColor,
      metal_weight: parsedWeight,
      gemstone_type: variant.gemstone_type || "None",
      gemstone_tcw: variant.gemstone_tcw || "",
      gemstone_color: variant.gemstone_color || "",
      gemstone_clarity: variant.gemstone_clarity || "",
      gemstone_cut: variant.gemstone_cut || "",
      gemstone_shape: variant.gemstone_shape || "",
      gemstone_setting: variant.gemstone_setting || "",
      gemstone_center_carat: variant.gemstone_center_carat || "",
      gemstone_cert_agency: variant.gemstone_cert_agency || "",
      gemstone_cert_number: variant.gemstone_cert_number || ""
    });
    setEditingVariantIdx(idx);
    setShowVariantModal(true);
  };

  const handleVariantDraftMediaChange = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      media_type: file.type.startsWith("video/") ? "video" : "image",
      is_primary: variantDraft.media.length === 0
    }));
    setVariantDraft(prev => ({ ...prev, media: [...prev.media, ...newMedia] }));
  };

  const removeVariantDraftMedia = (mIdx) => {
    setVariantDraft(prev => {
      const updatedMedia = [...prev.media];
      updatedMedia.splice(mIdx, 1);
      if (updatedMedia.length > 0 && !updatedMedia.some(m => m.is_primary)) updatedMedia[0].is_primary = true;
      return { ...prev, media: updatedMedia };
    });
  };

  const setVariantDraftPrimaryMedia = (mIdx) => {
    setVariantDraft(prev => ({ ...prev, media: prev.media.map((m, i) => ({ ...m, is_primary: i === mIdx })) }));
  };

  const saveVariantAndProduct = async () => {
    if (!variantDraft.metal_type) { toast.error("Metal Type is required."); return; }
    if (!variantDraft.metal_purity) { toast.error("Metal Purity is required."); return; }
    if (!variantDraft.metal_color) { toast.error("Metal Color is required."); return; }
    if (!variantDraft.price)    { toast.error("Price is required."); return; }
    if (!productForm.name)      { toast.error("Please fill in the Product Name first."); return; }
    if (!productForm.category_name) { toast.error("Please select a Category first."); return; }
    if (!productForm.price)     { toast.error("Please fill in the Base Price first."); return; }

    let materialStr = "";
    if (variantDraft.metal_purity) materialStr += variantDraft.metal_purity;
    if (variantDraft.metal_color) {
      if (materialStr) materialStr += " ";
      materialStr += variantDraft.metal_color;
    }
    if (variantDraft.metal_weight) {
      if (materialStr) materialStr += " ";
      materialStr += `(${variantDraft.metal_weight}g)`;
    }
    if (!materialStr) {
      materialStr = variantDraft.metal_type || "Custom Metal";
    }

    const finalDraft = {
      ...variantDraft,
      material: materialStr
    };

    const updatedVariants = editingVariantIdx !== null
      ? productForm.variants.map((v, i) => i === editingVariantIdx ? finalDraft : v)
      : [...productForm.variants, finalDraft];
    const updatedForm = { ...productForm, variants: updatedVariants };
    setProductForm(updatedForm);
    setShowVariantModal(false);
  };

  const openGemstoneModal = (idx) => {
    const variant = productForm.variants[idx];
    setGemstoneDraft({
      gemstone_type: variant.gemstone_type || "None",
      gemstone_tcw: variant.gemstone_tcw || "",
      gemstone_color: variant.gemstone_color || "",
      gemstone_clarity: variant.gemstone_clarity || "",
      gemstone_cut: variant.gemstone_cut || "",
      gemstone_shape: variant.gemstone_shape || "",
      gemstone_setting: variant.gemstone_setting || "",
      gemstone_center_carat: variant.gemstone_center_carat || "",
      gemstone_cert_agency: variant.gemstone_cert_agency || "",
      gemstone_cert_number: variant.gemstone_cert_number || ""
    });
    setEditingGemstoneVariantIdx(idx);
    setShowGemstoneModal(true);
  };

  const saveGemstoneDetails = async (e) => {
    e.preventDefault();
    if (editingGemstoneVariantIdx === null) return;
    
    // Validate: Enforce TCW is required only if Gemstone Type is not "None"
    if (gemstoneDraft.gemstone_type !== "None" && !gemstoneDraft.gemstone_tcw) {
      toast.error("Total Carat Weight (TCW) is required for gemstones.");
      return;
    }

    const updatedVariants = productForm.variants.map((v, i) => {
      if (i === editingGemstoneVariantIdx) {
        return {
          ...v,
          ...gemstoneDraft
        };
      }
      return v;
    });

    const updatedForm = { ...productForm, variants: updatedVariants };
    setProductForm(updatedForm);
    setShowGemstoneModal(false);
  };

  const openSpecsModal = () => {
    const existing = productForm.specifications || {};
    let template = existing.template_type;
    if (!template && productForm.category_name) {
      const catLower = productForm.category_name.toLowerCase();
      if (catLower.includes("ring")) template = "Rings";
      else if (catLower.includes("earring")) template = "Earrings";
      else if (catLower.includes("necklace") || catLower.includes("pendant")) template = "Necklaces";
      else if (catLower.includes("bracelet")) template = "Bracelets";
      else if (catLower.includes("anklet")) template = "Anklets";
      else if (catLower.includes("watch")) template = "Watches";
      else template = "Custom";
    }
    setSpecsDraft({ template_type: template || "Custom", ...existing });
    setShowSpecsModal(true);
  };

  const saveSpecsDetails = (e) => {
    e.preventDefault();
    setProductForm(prev => ({ ...prev, specifications: specsDraft }));
    setShowSpecsModal(false);
  };

  const handleAddCustomField = () => {
    setSpecsDraft(prev => ({
      ...prev,
      custom_fields: [...(prev.custom_fields || []), { label: "", value: "" }]
    }));
  };

  const handleUpdateCustomField = (index, field, val) => {
    setSpecsDraft(prev => {
      const fields = [...(prev.custom_fields || [])];
      fields[index] = { ...fields[index], [field]: val };
      return { ...prev, custom_fields: fields };
    });
  };

  const handleRemoveCustomField = (index) => {
    setSpecsDraft(prev => ({
      ...prev,
      custom_fields: (prev.custom_fields || []).filter((_, idx) => idx !== index)
    }));
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      media_type: file.type.startsWith("video/") ? "video" : "image",
      is_primary: productForm.media.length === 0
    }));
    setProductForm(prev => ({ ...prev, media: [...prev.media, ...newMedia] }));
  };

  const removeMedia = (index) => {
    setProductForm(prev => {
      const updatedMedia = [...prev.media];
      updatedMedia.splice(index, 1);
      if (updatedMedia.length > 0 && !updatedMedia.some(m => m.is_primary)) updatedMedia[0].is_primary = true;
      return { ...prev, media: updatedMedia };
    });
  };

  const setPrimaryMedia = (index) => {
    setProductForm(prev => ({ ...prev, media: prev.media.map((m, i) => ({ ...m, is_primary: i === index })) }));
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
                setProductForm({ name: "", category_name: "", gender: "Unisex", material: [], price: "", stock: "", description: "", craftsmanship_video: "", craftsmanship_video_file: null, is_active: true, variants: [], media: [], specifications: {} });
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
                                const rawProd = productsData.find(p => p.id === product.rawId);
                                setEditingProductId(product.rawId);
                                setProductForm({
                                  name: product.name,
                                  category_name: product.category,
                                  gender: product.gender,
                                  material: typeof product.material === 'string' ? product.material.split(", ").filter(m => m) : [],
                                  price: product.price.replace(/[^\d]/g, ""),
                                  stock: product.stock,
                                  description: rawProd?.description || "", 
                                  craftsmanship_video: rawProd?.craftsmanship_video || "",
                                  craftsmanship_video_file: null,
                                  is_active: product.status === "Active",
                                  variants: product.variants.map(v => {
                                    const vId = v._id?.toString() || v.id?.toString();
                                    return {
                                      ...v,
                                      id: vId,
                                      media: product.allMedia.filter(m => m.variant_id?.toString() === vId).map(m => ({
                                        ...m,
                                        preview: m.media_url
                                      }))
                                    };
                                  }),
                                  media: product.allMedia.filter(m => !m.variant_id).map(m => ({ ...m, preview: m.media_url })),
                                  specifications: product.specifications || {}
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
            {totalPages > 1 && (
              <div className="pagination-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '12px 24px', borderTop: '1px solid #eee' }}>
                <span style={{ fontSize: '13px', color: '#666' }}>
                  Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button" 
                    className="add-btn secondary" 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    Previous
                  </button>
                  <button 
                    type="button" 
                    className="add-btn secondary" 
                    disabled={currentPage === totalPages} 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="modal-overlay" onClick={() => setShowAddProduct(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingProductId ? "Edit Product" : "Add New Product"}</h2>
              <button className="modal-close" onClick={() => setShowAddProduct(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveProduct}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input type="text" className="form-input" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required placeholder="Enter product name" />
                </div>
                
                {/* --- Product Variants (Metals) Section --- */}
                <div style={{ margin: '20px 0', padding: '14px 16px', background: '#f9f9f9', borderRadius: '10px', border: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: productForm.variants.length > 0 ? '10px' : '0' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#2c2c2c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Metal Variants</h3>
                    <button type="button" className="add-btn secondary" onClick={addVariant} style={{ padding: '5px 12px', fontSize: '12px' }}>
                      <Plus size={13} /> Add Metal Variant
                    </button>
                  </div>
                  {productForm.variants.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#bbb', padding: '10px 0 2px', fontSize: '12px' }}>No variants yet &mdash; click &ldquo;Add Metal Variant&rdquo;.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {productForm.variants.map((v, vIdx) => (
                        <div key={vIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#d4af37', flexShrink: 0 }}></span>
                            <span style={{ fontWeight: '600', fontSize: '13px', color: '#2c2c2c' }}>
                              {v.material || 'Unnamed'}
                              {v.gemstone_type && v.gemstone_type !== "None" && (
                                <span style={{ fontWeight: 'normal', color: '#666', fontSize: '11px', marginLeft: '6px', background: '#f5f5f5', padding: '1px 6px', borderRadius: '4px', border: '1px dashed #ddd' }}>
                                  {v.gemstone_tcw ? `${v.gemstone_tcw}ct ` : ""}{v.gemstone_type}
                                </span>
                              )}
                            </span>
                            {v.price && <span style={{ fontSize: '12px', color: '#555' }}>₹{v.price}</span>}
                            {v.stock !== undefined && <span style={{ fontSize: '11px', color: '#888', background: '#f0f0f0', padding: '1px 7px', borderRadius: '10px' }}>{v.stock} stock</span>}
                            {v.media?.length > 0 && <span style={{ fontSize: '11px', color: '#aaa' }}>{v.media.length} photo{v.media.length !== 1 ? 's' : ''}</span>}
                          </div>
                          <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                            <button 
                              type="button" 
                              onClick={() => openGemstoneModal(vIdx)} 
                              style={{ 
                                background: 'none', 
                                border: v.gemstone_type && v.gemstone_type !== "None" ? '1px solid #d4af37' : '1px solid #ddd', 
                                borderRadius: '6px', 
                                padding: '3px 9px', 
                                cursor: 'pointer', 
                                fontSize: '11px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '3px', 
                                color: v.gemstone_type && v.gemstone_type !== "None" ? '#d4af37' : '#4a4a4a',
                                fontWeight: v.gemstone_type && v.gemstone_type !== "None" ? '600' : 'normal'
                              }}
                              title="Configure Gemstone & Diamond Details"
                            >
                              <Gem size={11} /> Gemstone
                            </button>
                            <button type="button" onClick={() => openEditVariant(vIdx)} style={{ background: 'none', border: '1px solid #ddd', borderRadius: '6px', padding: '3px 9px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px', color: '#4a4a4a' }}><Edit size={11} /> Edit</button>
                            <button type="button" onClick={() => removeVariant(vIdx)} style={{ background: 'none', border: '1px solid #fde8e8', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#e74c3c' }}><Trash2 size={11} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>


                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Base Category *</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        className="form-select" 
                        value={productForm.category_name} 
                        onChange={(e) => {
                          const selectedCat = e.target.value;
                          let defaultTemplate = "Custom";
                          if (selectedCat) {
                            const catLower = selectedCat.toLowerCase();
                            if (catLower.includes("ring")) defaultTemplate = "Rings";
                            else if (catLower.includes("earring")) defaultTemplate = "Earrings";
                            else if (catLower.includes("necklace") || catLower.includes("pendant")) defaultTemplate = "Necklaces";
                            else if (catLower.includes("bracelet")) defaultTemplate = "Bracelets";
                            else if (catLower.includes("anklet")) defaultTemplate = "Anklets";
                            else if (catLower.includes("watch")) defaultTemplate = "Watches";
                          }

                          setProductForm(prev => ({ ...prev, category_name: selectedCat, specifications: { template_type: defaultTemplate } }));
                          
                          if (selectedCat) {
                            setSpecsDraft({ template_type: defaultTemplate, custom_fields: [] });
                            setShowSpecsModal(true);
                          }
                        }} 
                        required
                        style={{ flex: 1 }}
                      >
                        <option value="">Select Category</option>
                        {categoriesData.map(c => <option key={c._id?.toString() || c.id} value={c.name}>{c.name}</option>)}
                      </select>
                      
                      {productForm.category_name && (
                        <button
                          type="button"
                          onClick={openSpecsModal}
                          className="add-btn"
                          title="Configure category specifications"
                          style={{
                            padding: '0 12px',
                            height: '42px',
                            background: Object.keys(productForm.specifications || {}).length > 0 ? '#f0f9ff' : '#f8fafc',
                            color: Object.keys(productForm.specifications || {}).length > 0 ? '#0284c7' : '#64748b',
                            border: Object.keys(productForm.specifications || {}).length > 0 ? '1px solid #0284c7' : '1px solid #cbd5e1',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <Settings size={20} />
                        </button>
                      )}
                    </div>
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
                  <label className="form-label">Product Description</label>
                  <textarea className="form-input" rows="3" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} placeholder="Enter product description"></textarea>
                </div>

                {/* --- Craftsmanship Video Upload Section --- */}
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label">Craftsmanship Video (Optional)</label>
                  <div style={{ border: '2px dashed #ddd', padding: '16px', borderRadius: '8px', textAlign: 'center', background: '#fafafa' }}>
                    <input 
                      type="file" 
                      id="craftsmanship-video-input" 
                      accept="video/*" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const previewUrl = URL.createObjectURL(file);
                          setProductForm(prev => ({
                            ...prev,
                            craftsmanship_video: previewUrl,
                            craftsmanship_video_file: file
                          }));
                        }
                      }} 
                      style={{ display: 'none' }} 
                    />
                    <label htmlFor="craftsmanship-video-input" style={{ cursor: 'pointer', color: '#666', fontSize: '13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <Video size={24} color="#888" />
                      <span>{productForm.craftsmanship_video ? "Change Craftsmanship Video" : "Upload Craftsmanship Video (MP4, WebM, MOV max 15MB)"}</span>
                    </label>
                  </div>
                  {productForm.craftsmanship_video && (
                    <div style={{ position: 'relative', marginTop: '12px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd', background: '#000' }}>
                      <video 
                        src={productForm.craftsmanship_video} 
                        controls 
                        style={{ width: '100%', maxHeight: '220px', display: 'block' }} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setProductForm(prev => ({ ...prev, craftsmanship_video: '', craftsmanship_video_file: null }))}
                        style={{
                          position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.9)',
                          border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                        title="Remove Video"
                      >
                        <X size={16} color="#e74c3c" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <div style={{ marginRight: "auto" }}>
                  <button 
                    type="button" 
                    className={`status-btn ${productForm.is_active ? "active" : ""}`} 
                    onClick={() => setProductForm({ ...productForm, is_active: !productForm.is_active })}
                  >
                    <span className="status-indicator-dot"></span>
                    {productForm.is_active ? "Active" : "Inactive"}
                  </button>
                </div>
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
                <button type="submit" className="add-btn" disabled={loading}>
                  <Save size={16} /> {loading ? "Saving..." : (editingCategoryId ? "Update Category" : "Create Category")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Variant Sub-Modal ── */}
      {showVariantModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setShowVariantModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px', width: '92%' }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingVariantIdx !== null ? 'Edit Metal Variant' : 'Add Metal Variant'}</h2>
              <button className="modal-close" onClick={() => setShowVariantModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Metal Type *</label>
                  <select 
                    className="form-select" 
                    value={["Gold", "Silver", "Platinum", "Titanium", ""].includes(variantDraft.metal_type) ? variantDraft.metal_type : (variantDraft.metal_type ? "Custom" : "")}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "Custom") {
                        setVariantDraft(prev => ({ ...prev, metal_type: "Custom Metal" }));
                      } else {
                        setVariantDraft(prev => {
                          let purity = "";
                          let color = "";
                          if (val === "Gold") { purity = "18K"; color = "Yellow Gold"; }
                          else if (val === "Silver") { purity = "925 Sterling Silver"; color = "Silver"; }
                          else if (val === "Platinum") { purity = "950 Platinum"; color = "Silver"; }
                          else if (val === "Titanium") { purity = "Grade 5"; color = "Silver"; }
                          return { ...prev, metal_type: val, metal_purity: purity, metal_color: color };
                        });
                      }
                    }}
                    required
                  >
                    <option value="">Select Metal</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Titanium">Titanium</option>
                    <option value="Custom">Custom / Other</option>
                  </select>
                  {variantDraft.metal_type && !["Gold", "Silver", "Platinum", "Titanium"].includes(variantDraft.metal_type) && (
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ marginTop: '8px' }} 
                      value={variantDraft.metal_type} 
                      onChange={(e) => setVariantDraft(prev => ({ ...prev, metal_type: e.target.value }))} 
                      placeholder="Enter custom metal type" 
                      required
                    />
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Metal Purity *</label>
                  <select 
                    className="form-select" 
                    value={
                      variantDraft.metal_type === "Gold" && ["10K", "14K", "18K", "22K"].includes(variantDraft.metal_purity) ? variantDraft.metal_purity :
                      variantDraft.metal_type === "Silver" && ["925 Sterling Silver"].includes(variantDraft.metal_purity) ? variantDraft.metal_purity :
                      variantDraft.metal_type === "Platinum" && ["950 Platinum"].includes(variantDraft.metal_purity) ? variantDraft.metal_purity :
                      variantDraft.metal_type === "Titanium" && ["Grade 5", "Grade 23"].includes(variantDraft.metal_purity) ? variantDraft.metal_purity :
                      variantDraft.metal_purity === "" ? "" : (variantDraft.metal_purity ? "Custom" : "")
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "Custom") {
                        setVariantDraft(prev => ({ ...prev, metal_purity: "Custom Purity" }));
                      } else {
                        setVariantDraft(prev => ({ ...prev, metal_purity: val }));
                      }
                    }}
                    required
                  >
                    <option value="">Select Purity</option>
                    {variantDraft.metal_type === "Gold" && (
                      <>
                        <option value="10K">10K</option>
                        <option value="14K">14K</option>
                        <option value="18K">18K</option>
                        <option value="22K">22K</option>
                      </>
                    )}
                    {variantDraft.metal_type === "Silver" && (
                      <option value="925 Sterling Silver">925 Sterling Silver</option>
                    )}
                    {variantDraft.metal_type === "Platinum" && (
                      <option value="950 Platinum">950 Platinum</option>
                    )}
                    {variantDraft.metal_type === "Titanium" && (
                      <>
                        <option value="Grade 5">Grade 5</option>
                        <option value="Grade 23">Grade 23</option>
                      </>
                    )}
                    <option value="Custom">Custom / Other</option>
                  </select>
                  {variantDraft.metal_purity && !(
                    (variantDraft.metal_type === "Gold" && ["10K", "14K", "18K", "22K"].includes(variantDraft.metal_purity)) ||
                    (variantDraft.metal_type === "Silver" && ["925 Sterling Silver"].includes(variantDraft.metal_purity)) ||
                    (variantDraft.metal_type === "Platinum" && ["950 Platinum"].includes(variantDraft.metal_purity)) ||
                    (variantDraft.metal_type === "Titanium" && ["Grade 5", "Grade 23"].includes(variantDraft.metal_purity))
                  ) && (
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ marginTop: '8px' }} 
                      value={variantDraft.metal_purity} 
                      onChange={(e) => setVariantDraft(prev => ({ ...prev, metal_purity: e.target.value }))} 
                      placeholder="Enter custom purity" 
                      required
                    />
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Metal Color *</label>
                  <select 
                    className="form-select" 
                    value={["Yellow Gold", "White Gold", "Rose Gold", "Two-Tone", "Silver", ""].includes(variantDraft.metal_color) ? variantDraft.metal_color : (variantDraft.metal_color ? "Custom" : "")}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "Custom") {
                        setVariantDraft(prev => ({ ...prev, metal_color: "Custom Color" }));
                      } else {
                        setVariantDraft(prev => ({ ...prev, metal_color: val }));
                      }
                    }}
                    required
                  >
                    <option value="">Select Color</option>
                    <option value="Yellow Gold">Yellow Gold</option>
                    <option value="White Gold">White Gold</option>
                    <option value="Rose Gold">Rose Gold</option>
                    <option value="Two-Tone">Two-Tone</option>
                    <option value="Silver">Silver</option>
                    <option value="Custom">Other</option>
                  </select>
                  {variantDraft.metal_color && !["Yellow Gold", "White Gold", "Rose Gold", "Two-Tone", "Silver"].includes(variantDraft.metal_color) && (
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ marginTop: '8px' }} 
                      value={variantDraft.metal_color} 
                      onChange={(e) => setVariantDraft(prev => ({ ...prev, metal_color: e.target.value }))} 
                      placeholder="Enter custom color" 
                      required
                    />
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Metal Weight (g)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-input" 
                    value={variantDraft.metal_weight} 
                    onChange={e => setVariantDraft(prev => ({ ...prev, metal_weight: e.target.value }))} 
                    placeholder="e.g. 3.5" 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input type="number" className="form-input" value={variantDraft.price} onChange={e => setVariantDraft(prev => ({ ...prev, price: e.target.value }))} placeholder="Price for this variant" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input type="number" className="form-input" value={variantDraft.stock} onChange={e => setVariantDraft(prev => ({ ...prev, stock: e.target.value }))} placeholder="Stock quantity" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{variantDraft.material || 'Variant'} Media</label>
                <div style={{ border: "2px dashed #e8e8e8", padding: "14px", borderRadius: "8px", textAlign: "center", marginBottom: "10px", background: '#fafafa' }}>
                  <input type="file" id="variant-draft-media" multiple accept="image/*,video/*" onChange={handleVariantDraftMediaChange} style={{ display: "none" }} />
                  <label htmlFor="variant-draft-media" style={{ cursor: "pointer", color: "#888", fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <ImageIcon size={22} color="#bbb" />
                    <span>Click to upload images / videos for <strong>{variantDraft.material || 'this variant'}</strong></span>
                  </label>
                </div>
                {variantDraft.media.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(76px, 1fr))", gap: "8px" }}>
                    {variantDraft.media.map((item, mIdx) => (
                      <div key={mIdx} style={{ position: "relative", borderRadius: "6px", overflow: "hidden", border: item.is_primary ? "2px solid #d4af37" : "1px solid #ddd" }}>
                        {item.media_type === "video" ? (
                          <div style={{ width: "100%", height: "62px", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}><CheckCircle2 size={16} color="#666" /></div>
                        ) : (
                          <img src={item.preview} alt="preview" style={{ width: "100%", height: "62px", objectFit: "cover" }} />
                        )}
                        <div style={{ position: "absolute", top: "2px", right: "2px", display: "flex", gap: "2px" }}>
                          <button type="button" onClick={() => setVariantDraftPrimaryMedia(mIdx)} title="Set Primary" style={{ background: "rgba(255,255,255,0.92)", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Star size={9} color={item.is_primary ? "#d4af37" : "#aaa"} /></button>
                          <button type="button" onClick={() => removeVariantDraftMedia(mIdx)} style={{ background: "rgba(255,255,255,0.92)", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={9} color="#e74c3c" /></button>
                        </div>
                        {item.is_primary && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#d4af37", color: "white", fontSize: "8px", textAlign: "center", padding: "1px" }}>PRIMARY</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">{variantDraft.material || 'Variant'} Description (Optional)</label>
                <textarea className="form-input" rows="2" value={variantDraft.description} onChange={e => setVariantDraft(prev => ({ ...prev, description: e.target.value }))} placeholder={`Unique details for the ${variantDraft.material || 'variant'} version`}></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="add-btn secondary" onClick={() => setShowVariantModal(false)}>Cancel Variant</button>
              <button type="button" className="add-btn" disabled={loading} onClick={saveVariantAndProduct}>
                <Save size={16} /> {loading ? "Saving..." : "Save Variant"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gemstone Details Modal */}
      {showGemstoneModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setShowGemstoneModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px', width: '92%' }}>
            <div className="modal-header">
              <h2 className="modal-title">Gemstone & Diamond Details</h2>
              <button className="modal-close" onClick={() => setShowGemstoneModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={saveGemstoneDetails}>
              <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Gemstone Type *</label>
                  <select 
                    className="form-select" 
                    value={["None", "Lab-Grown Diamond", "Natural Diamond", "Moissanite", "Sapphire", "Ruby", "Emerald", ""].includes(gemstoneDraft.gemstone_type) ? gemstoneDraft.gemstone_type : (gemstoneDraft.gemstone_type ? "Custom" : "None")}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "Custom") {
                        setGemstoneDraft(prev => ({ ...prev, gemstone_type: "Custom Gemstone" }));
                      } else {
                        setGemstoneDraft(prev => ({ ...prev, gemstone_type: val }));
                      }
                    }}
                    required
                  >
                    <option value="None">No Gemstone (Plain Metal)</option>
                    <option value="Lab-Grown Diamond">Lab-Grown Diamond</option>
                    <option value="Natural Diamond">Natural Diamond</option>
                    <option value="Moissanite">Moissanite</option>
                    <option value="Sapphire">Sapphire</option>
                    <option value="Ruby">Ruby</option>
                    <option value="Emerald">Emerald</option>
                    <option value="Custom">Custom / Other</option>
                  </select>
                </div>

                {gemstoneDraft.gemstone_type !== "None" && (
                  <div>
                    {gemstoneDraft.gemstone_type && !["None", "Lab-Grown Diamond", "Natural Diamond", "Moissanite", "Sapphire", "Ruby", "Emerald"].includes(gemstoneDraft.gemstone_type) && (
                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label className="form-label">Custom Gemstone Type *</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="e.g. Blue Topaz, Pearl" 
                          value={gemstoneDraft.gemstone_type} 
                          onChange={(e) => setGemstoneDraft(prev => ({ ...prev, gemstone_type: e.target.value }))}
                          required
                        />
                      </div>
                    )}

                    <div className="form-row" style={{ gap: '12px', marginBottom: '12px' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Total Carat Weight (TCW) *</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          className="form-input" 
                          placeholder="e.g. 1.25" 
                          value={gemstoneDraft.gemstone_tcw} 
                          onChange={(e) => setGemstoneDraft(prev => ({ ...prev, gemstone_tcw: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Diamond Color Grade</label>
                        <select 
                          className="form-select" 
                          value={gemstoneDraft.gemstone_color} 
                          onChange={(e) => setGemstoneDraft(prev => ({ ...prev, gemstone_color: e.target.value }))}
                        >
                          <option value="">Select Color</option>
                          <option value="D">D (Colorless)</option>
                          <option value="E">E (Colorless)</option>
                          <option value="F">F (Colorless)</option>
                          <option value="G">G (Near Colorless)</option>
                          <option value="H">H (Near Colorless)</option>
                          <option value="I">I (Near Colorless)</option>
                          <option value="J">J (Near Colorless)</option>
                          <option value="K-M">K-M (Faint Yellow)</option>
                          <option value="Fancy">Fancy Color</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row" style={{ gap: '12px', marginBottom: '12px' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Diamond Clarity</label>
                        <select 
                          className="form-select" 
                          value={gemstoneDraft.gemstone_clarity} 
                          onChange={(e) => setGemstoneDraft(prev => ({ ...prev, gemstone_clarity: e.target.value }))}
                        >
                          <option value="">Select Clarity</option>
                          <option value="FL">FL (Flawless)</option>
                          <option value="IF">IF (Internally Flawless)</option>
                          <option value="VVS1">VVS1 (Very Very Slightly Included 1)</option>
                          <option value="VVS2">VVS2 (Very Very Slightly Included 2)</option>
                          <option value="VS1">VS1 (Very Slightly Included 1)</option>
                          <option value="VS2">VS2 (Very Slightly Included 2)</option>
                          <option value="SI1">SI1 (Slightly Included 1)</option>
                          <option value="SI2">SI2 (Slightly Included 2)</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Diamond Cut Grade</label>
                        <select 
                          className="form-select" 
                          value={gemstoneDraft.gemstone_cut} 
                          onChange={(e) => setGemstoneDraft(prev => ({ ...prev, gemstone_cut: e.target.value }))}
                        >
                          <option value="">Select Cut</option>
                          <option value="Excellent">Excellent</option>
                          <option value="Very Good">Very Good</option>
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row" style={{ gap: '12px', marginBottom: '12px' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Diamond/Stone Shape</label>
                        <select 
                          className="form-select" 
                          value={gemstoneDraft.gemstone_shape} 
                          onChange={(e) => setGemstoneDraft(prev => ({ ...prev, gemstone_shape: e.target.value }))}
                        >
                          <option value="">Select Shape</option>
                          <option value="Round">Round Brilliant</option>
                          <option value="Oval">Oval</option>
                          <option value="Princess">Princess (Square)</option>
                          <option value="Cushion">Cushion</option>
                          <option value="Pear">Pear (Teardrop)</option>
                          <option value="Emerald">Emerald Cut</option>
                          <option value="Marquise">Marquise</option>
                          <option value="Radiant">Radiant</option>
                          <option value="Heart">Heart</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Setting Type</label>
                        <select 
                          className="form-select" 
                          value={gemstoneDraft.gemstone_setting} 
                          onChange={(e) => setGemstoneDraft(prev => ({ ...prev, gemstone_setting: e.target.value }))}
                        >
                          <option value="">Select Setting</option>
                          <option value="Prong">Prong Setting</option>
                          <option value="Bezel">Bezel Setting</option>
                          <option value="Pavé">Pavé Setting</option>
                          <option value="Channel">Channel Setting</option>
                          <option value="Tension">Tension Setting</option>
                          <option value="Halo">Halo Setting</option>
                          <option value="Solitaire">Solitaire Setting</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row" style={{ gap: '12px', marginBottom: '12px' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Center Stone Carat</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          className="form-input" 
                          placeholder="e.g. 0.75" 
                          value={gemstoneDraft.gemstone_center_carat} 
                          onChange={(e) => setGemstoneDraft(prev => ({ ...prev, gemstone_center_carat: e.target.value }))}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Certifying Agency</label>
                        <select 
                          className="form-select" 
                          value={gemstoneDraft.gemstone_cert_agency} 
                          onChange={(e) => setGemstoneDraft(prev => ({ ...prev, gemstone_cert_agency: e.target.value }))}
                        >
                          <option value="">Select Agency</option>
                          <option value="IGI">IGI</option>
                          <option value="GIA">GIA</option>
                          <option value="SGL">SGL</option>
                          <option value="Self-Certified">Self-Certified</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Certificate Number</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. LG59823482" 
                        value={gemstoneDraft.gemstone_cert_number} 
                        onChange={(e) => setGemstoneDraft(prev => ({ ...prev, gemstone_cert_number: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="add-btn secondary" onClick={() => setShowGemstoneModal(false)}>Cancel</button>
                <button type="submit" className="add-btn" disabled={loading}>
                  <Save size={16} /> {loading ? "Saving..." : "Save Gemstone Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Specifications Modal */}
      {showSpecsModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setShowSpecsModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', width: '92%' }}>
            <div className="modal-header">
              <h2 className="modal-title">🔧 {productForm.category_name} Detailed Specifications</h2>
              <button className="modal-close" onClick={() => setShowSpecsModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={saveSpecsDetails}>
              <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Specification Template Type</label>
                  <select 
                    className="form-select" 
                    value={specsDraft.template_type || "Custom"} 
                    onChange={(e) => setSpecsDraft(prev => ({ ...prev, template_type: e.target.value }))}
                    style={{ fontWeight: '500' }}
                  >
                    <option value="Custom">None / Custom Only</option>
                    <option value="Rings">Rings Template</option>
                    <option value="Earrings">Earrings Template</option>
                    <option value="Necklaces">Necklaces & Pendants Template</option>
                    <option value="Bracelets">Bracelets Template</option>
                    <option value="Anklets">Anklets Template</option>
                    <option value="Watches">Watches Template</option>
                  </select>
                </div>

                {(() => {
                  const template = specsDraft.template_type || "Custom";
                  const isRing = template === "Rings";
                  const isEarring = template === "Earrings";
                  const isNecklacePendant = template === "Necklaces";
                  const isBracelet = template === "Bracelets";
                  const isAnklet = template === "Anklets";
                  const isWatch = template === "Watches";

                  return (
                    <>
                      {/* --- RINGS SPECIFICATIONS --- */}
                      {isRing && (
                        <div>
                          <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="form-label">Available Ring Sizes (US) *</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                              {["4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"].map(sz => {
                                const currentSizes = specsDraft.ring_sizes || [];
                                const isChecked = currentSizes.includes(sz);
                                return (
                                  <label key={sz} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#334155', cursor: 'pointer', margin: 0 }}>
                                    <input 
                                      type="checkbox" 
                                      checked={isChecked} 
                                      onChange={(e) => {
                                        const updatedSizes = e.target.checked 
                                          ? [...currentSizes, sz]
                                          : currentSizes.filter(s => s !== sz);
                                        setSpecsDraft(prev => ({ ...prev, ring_sizes: updatedSizes }));
                                      }}
                                      style={{ cursor: 'pointer' }}
                                    />
                                    <span>{sz}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          <div className="form-row" style={{ gap: '12px', marginBottom: '16px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Band Width (mm) *</label>
                              <input 
                                type="text" 
                                className="form-input" 
                                placeholder="e.g. 1.8mm" 
                                value={specsDraft.band_width || ""} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, band_width: e.target.value }))}
                                required
                              />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Setting Height (mm)</label>
                              <input 
                                type="text" 
                                className="form-input" 
                                placeholder="e.g. 6.5mm" 
                                value={specsDraft.setting_height || ""} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, setting_height: e.target.value }))}
                              />
                            </div>
                          </div>

                          <div className="form-row" style={{ gap: '12px', marginBottom: '8px', alignItems: 'center' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Ring Style</label>
                              <select 
                                className="form-select" 
                                value={specsDraft.ring_type || ""} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, ring_type: e.target.value }))}
                              >
                                <option value="">Select Style</option>
                                <option value="Solitaire">Solitaire</option>
                                <option value="Halo">Halo</option>
                                <option value="Three-Stone">Three-Stone</option>
                                <option value="Eternity">Eternity</option>
                                <option value="Half-Eternity">Half-Eternity</option>
                                <option value="Fashion">Fashion</option>
                                <option value="Engagement">Engagement</option>
                              </select>
                            </div>
                            <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px' }}>
                              <input 
                                type="checkbox" 
                                id="modal-ring-resizable"
                                checked={specsDraft.resizable || false} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, resizable: e.target.checked }))}
                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                              />
                              <label htmlFor="modal-ring-resizable" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Resizable Ring</label>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* --- EARRINGS SPECIFICATIONS --- */}
                      {isEarring && (
                        <div>
                          <div className="form-row" style={{ gap: '12px', marginBottom: '16px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Backing / Closure Type *</label>
                              <select 
                                className="form-select" 
                                value={specsDraft.backing_type || ""} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, backing_type: e.target.value }))}
                                required
                              >
                                <option value="">Select Backing</option>
                                <option value="Post & Butterfly">Post & Butterfly</option>
                                <option value="Screw Back">Screw Back</option>
                                <option value="Push Back">Push Back</option>
                                <option value="Latch Back">Latch Back</option>
                                <option value="Lever Back">Lever Back</option>
                                <option value="French Hook">French Hook</option>
                                <option value="Huggie Hinge">Huggie Hinge</option>
                              </select>
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Earring Style</label>
                              <select 
                                className="form-select" 
                                value={specsDraft.earring_type || ""} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, earring_type: e.target.value }))}
                              >
                                <option value="">Select Style</option>
                                <option value="Studs">Studs</option>
                                <option value="Hoops">Hoops</option>
                                <option value="Huggies">Huggies</option>
                                <option value="Drop / Dangle">Drop / Dangle</option>
                                <option value="Chandelier">Chandelier</option>
                              </select>
                            </div>
                          </div>

                          <div className="form-row" style={{ gap: '12px', marginBottom: '8px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Dimensions (Height x Width)</label>
                              <input 
                                type="text" 
                                className="form-input" 
                                placeholder="e.g. 15mm x 5mm" 
                                value={specsDraft.dimensions || ""} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, dimensions: e.target.value }))}
                              />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Sold As</label>
                              <select 
                                className="form-select" 
                                value={specsDraft.sold_as || ""} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, sold_as: e.target.value }))}
                              >
                                <option value="">Select Option</option>
                                <option value="Pair">Pair</option>
                                <option value="Single Earring">Single Earring</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* --- NECKLACES & PENDANTS SPECIFICATIONS --- */}
                      {isNecklacePendant && (
                        <div>
                          <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="form-label">Available Chain Lengths (inches) *</label>
                            <div style={{ display: 'flex', gap: '15px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1', flexWrap: 'wrap' }}>
                              {["16\"", "18\"", "20\"", "22\"", "24\"", "Adjustable"].map(len => {
                                const currentLengths = specsDraft.chain_lengths || [];
                                const isChecked = currentLengths.includes(len);
                                return (
                                  <label key={len} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#334155', cursor: 'pointer', margin: 0 }}>
                                    <input 
                                      type="checkbox" 
                                      checked={isChecked} 
                                      onChange={(e) => {
                                        const updatedLengths = e.target.checked 
                                          ? [...currentLengths, len]
                                          : currentLengths.filter(l => l !== len);
                                        setSpecsDraft(prev => ({ ...prev, chain_lengths: updatedLengths }));
                                      }}
                                      style={{ cursor: 'pointer' }}
                                    />
                                    <span>{len}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          <div className="form-row" style={{ gap: '12px', marginBottom: '16px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Chain Type *</label>
                              <select 
                                className="form-select" 
                                value={specsDraft.chain_type || ""} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, chain_type: e.target.value }))}
                                required
                              >
                                <option value="">Select Chain</option>
                                <option value="Cable">Cable</option>
                                <option value="Rope">Rope</option>
                                <option value="Box">Box</option>
                                <option value="Curb">Curb</option>
                                <option value="Wheat">Wheat</option>
                                <option value="Link">Link</option>
                                <option value="Snake">Snake</option>
                                <option value="None - Pendant Only">None - Pendant Only</option>
                              </select>
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Clasp Type *</label>
                              <select 
                                className="form-select" 
                                value={specsDraft.clasp_type || ""} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, clasp_type: e.target.value }))}
                                required
                              >
                                <option value="">Select Clasp</option>
                                <option value="Lobster Claw">Lobster Claw</option>
                                <option value="Spring Ring">Spring Ring</option>
                                <option value="Toggle">Toggle</option>
                                <option value="Box Clasp">Box Clasp</option>
                              </select>
                            </div>
                          </div>

                          <div className="form-row" style={{ gap: '12px', marginBottom: '8px', alignItems: 'center' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Pendant Dimensions</label>
                              <input 
                                type="text" 
                                className="form-input" 
                                placeholder="e.g. 20mm x 12mm" 
                                value={specsDraft.pendant_dimensions || ""} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, pendant_dimensions: e.target.value }))}
                              />
                            </div>
                            <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px' }}>
                              <input 
                                type="checkbox" 
                                id="modal-pendant-removable"
                                checked={specsDraft.pendant_removable || false} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, pendant_removable: e.target.checked }))}
                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                              />
                              <label htmlFor="modal-pendant-removable" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Pendant Removable</label>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* --- BRACELETS SPECIFICATIONS --- */}
                      {isBracelet && (
                        <div>
                          <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="form-label">Available Bracelet Sizes (inches) *</label>
                            <div style={{ display: 'flex', gap: '15px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1', flexWrap: 'wrap' }}>
                              {["6.0\"", "6.5\"", "7.0\"", "7.5\"", "8.0\"", "Adjustable"].map(len => {
                                const currentLengths = specsDraft.bracelet_lengths || [];
                                const isChecked = currentLengths.includes(len);
                                return (
                                  <label key={len} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#334155', cursor: 'pointer', margin: 0 }}>
                                    <input 
                                      type="checkbox" 
                                      checked={isChecked} 
                                      onChange={(e) => {
                                        const updatedLengths = e.target.checked 
                                          ? [...currentLengths, len]
                                          : currentLengths.filter(l => l !== len);
                                        setSpecsDraft(prev => ({ ...prev, bracelet_lengths: updatedLengths }));
                                      }}
                                      style={{ cursor: 'pointer' }}
                                    />
                                    <span>{len}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          <div className="form-row" style={{ gap: '12px', marginBottom: '16px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Bracelet Style *</label>
                              <select 
                                className="form-select" 
                                value={specsDraft.bracelet_style || ""} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, bracelet_style: e.target.value }))}
                                required
                              >
                                <option value="">Select Style</option>
                                <option value="Tennis Bracelet">Tennis Bracelet</option>
                                <option value="Bangle">Bangle</option>
                                <option value="Chain Link">Chain Link</option>
                                <option value="Cuff">Cuff</option>
                                <option value="Charm Bracelet">Charm Bracelet</option>
                              </select>
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Clasp Type *</label>
                              <select 
                                className="form-select" 
                                value={specsDraft.clasp_type || ""} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, clasp_type: e.target.value }))}
                                required
                              >
                                <option value="">Select Clasp</option>
                                <option value="Box Clasp with Safety">Box Clasp with Safety</option>
                                <option value="Lobster Claw">Lobster Claw</option>
                                <option value="Toggle">Toggle</option>
                                <option value="Slide/Drawstring">Slide/Drawstring</option>
                              </select>
                            </div>
                          </div>

                          <div className="form-row" style={{ gap: '12px', marginBottom: '8px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Thickness / Width (mm)</label>
                              <input 
                                type="text" 
                                className="form-input" 
                                placeholder="e.g. 3.0mm" 
                                value={specsDraft.bracelet_thickness || ""} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, bracelet_thickness: e.target.value }))}
                              />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Inner Diameter (mm - for Bangles)</label>
                              <input 
                                type="text" 
                                className="form-input" 
                                placeholder="e.g. 58mm" 
                                value={specsDraft.inner_diameter || ""} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, inner_diameter: e.target.value }))}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* --- ANKLETS SPECIFICATIONS --- */}
                      {isAnklet && (
                        <div>
                          <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="form-label">Available Anklet Sizes (inches) *</label>
                            <div style={{ display: 'flex', gap: '15px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1', flexWrap: 'wrap' }}>
                              {["9\"", "10\"", "11\"", "Adjustable"].map(len => {
                                const currentLengths = specsDraft.anklet_lengths || [];
                                const isChecked = currentLengths.includes(len);
                                return (
                                  <label key={len} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#334155', cursor: 'pointer', margin: 0 }}>
                                    <input 
                                      type="checkbox" 
                                      checked={isChecked} 
                                      onChange={(e) => {
                                        const updatedLengths = e.target.checked 
                                          ? [...currentLengths, len]
                                          : currentLengths.filter(l => l !== len);
                                        setSpecsDraft(prev => ({ ...prev, anklet_lengths: updatedLengths }));
                                      }}
                                      style={{ cursor: 'pointer' }}
                                    />
                                    <span>{len}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          <div className="form-row" style={{ gap: '12px', marginBottom: '16px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Extender Chain Length *</label>
                              <select 
                                className="form-select" 
                                value={specsDraft.extender_length || ""} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, extender_length: e.target.value }))}
                                required
                              >
                                <option value="">Select Extender</option>
                                <option value="None">None</option>
                                <option value="0.5 inch">0.5 inch</option>
                                <option value="1 inch">1 inch</option>
                                <option value="2 inches">2 inches</option>
                              </select>
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Clasp Type *</label>
                              <select 
                                className="form-select" 
                                value={specsDraft.clasp_type || ""} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, clasp_type: e.target.value }))}
                                required
                              >
                                <option value="">Select Clasp</option>
                                <option value="Lobster Claw">Lobster Claw</option>
                                <option value="Spring Ring">Spring Ring</option>
                              </select>
                            </div>
                          </div>

                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Anklet Style</label>
                            <select 
                              className="form-select" 
                              value={specsDraft.anklet_style || ""} 
                              onChange={(e) => setSpecsDraft(prev => ({ ...prev, anklet_style: e.target.value }))}
                            >
                              <option value="">Select Style</option>
                              <option value="Chain Link">Chain Link</option>
                              <option value="Charm Anklet">Charm Anklet</option>
                              <option value="Beaded">Beaded</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* --- WATCHES SPECIFICATIONS --- */}
                      {isWatch && (
                        <div>
                          <div className="form-row" style={{ gap: '12px', marginBottom: '16px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Movement Type *</label>
                              <select 
                                className="form-select" 
                                value={specsDraft.movement_type || ""} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, movement_type: e.target.value }))}
                                required
                              >
                                <option value="">Select Movement</option>
                                <option value="Quartz/Battery">Quartz/Battery</option>
                                <option value="Automatic/Self-Winding">Automatic/Self-Winding</option>
                                <option value="Manual/Mechanical Wind">Manual/Mechanical Wind</option>
                                <option value="Solar">Solar</option>
                              </select>
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Case Diameter (mm) *</label>
                              <input 
                                type="number" 
                                className="form-input" 
                                placeholder="e.g. 40" 
                                value={specsDraft.case_diameter || ""} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, case_diameter: e.target.value }))}
                                required
                              />
                            </div>
                          </div>

                          <div className="form-row" style={{ gap: '12px', marginBottom: '16px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Case Material *</label>
                              <select 
                                className="form-select" 
                                value={specsDraft.case_material || ""} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, case_material: e.target.value }))}
                                required
                              >
                                <option value="">Select Material</option>
                                <option value="Stainless Steel">Stainless Steel</option>
                                <option value="Solid Gold">Solid Gold</option>
                                <option value="Gold Plated">Gold Plated</option>
                                <option value="Ceramic">Ceramic</option>
                                <option value="Titanium">Titanium</option>
                              </select>
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Strap Material *</label>
                              <select 
                                className="form-select" 
                                value={specsDraft.strap_material || ""} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, strap_material: e.target.value }))}
                                required
                              >
                                <option value="">Select Strap</option>
                                <option value="Genuine Leather">Genuine Leather</option>
                                <option value="Stainless Steel Link">Stainless Steel Link</option>
                                <option value="Mesh">Mesh</option>
                                <option value="Silicone">Silicone</option>
                                <option value="Gold Link">Gold Link</option>
                              </select>
                            </div>
                          </div>

                          <div className="form-row" style={{ gap: '12px', marginBottom: '16px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Water Resistance *</label>
                              <select 
                                className="form-select" 
                                value={specsDraft.water_resistance || ""} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, water_resistance: e.target.value }))}
                                required
                              >
                                <option value="">Select Resistance</option>
                                <option value="Not Water Resistant">Not Water Resistant</option>
                                <option value="3 ATM / 30m">3 ATM / 30m</option>
                                <option value="5 ATM / 50m">5 ATM / 50m</option>
                                <option value="10 ATM / 100m">10 ATM / 100m</option>
                              </select>
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Glass / Crystal Type</label>
                              <select 
                                className="form-select" 
                                value={specsDraft.glass_type || ""} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, glass_type: e.target.value }))}
                              >
                                <option value="">Select Glass</option>
                                <option value="Sapphire Crystal">Sapphire Crystal</option>
                                <option value="Mineral Glass">Mineral Glass</option>
                                <option value="Acrylic">Acrylic</option>
                              </select>
                            </div>
                          </div>

                          <div className="form-row" style={{ gap: '12px', marginBottom: '16px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Dial Color</label>
                              <input 
                                type="text" 
                                className="form-input" 
                                placeholder="e.g. Black, Blue" 
                                value={specsDraft.dial_color || ""} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, dial_color: e.target.value }))}
                              />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Strap / Lug Width (mm)</label>
                              <input 
                                type="number" 
                                className="form-input" 
                                placeholder="e.g. 20" 
                                value={specsDraft.strap_width || ""} 
                                onChange={(e) => setSpecsDraft(prev => ({ ...prev, strap_width: e.target.value }))}
                              />
                            </div>
                          </div>

                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Warranty Duration</label>
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="e.g. 2 Years International" 
                              value={specsDraft.warranty || ""} 
                              onChange={(e) => setSpecsDraft(prev => ({ ...prev, warranty: e.target.value }))}
                            />
                          </div>
                        </div>
                      )}

                        {/* --- ALWAYS-ON ADDITIONAL CUSTOM SPECIFICATIONS SECTION --- */}
                        <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                            ➕ {specsDraft.template_type !== "Custom" ? "Additional Custom Specifications" : "Custom Specifications"}
                          </h3>
                          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                            Add any custom properties that are not covered by the standard template above.
                          </p>

                          {(!specsDraft.custom_fields || specsDraft.custom_fields.length === 0) ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', border: '1px dashed #cbd5e1', borderRadius: '8px', background: '#f8fafc', textAlign: 'center' }}>
                              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px 0' }}>No custom specifications added yet.</p>
                              <button 
                                type="button" 
                                onClick={handleAddCustomField}
                                className="add-btn secondary"
                                style={{ padding: '6px 12px', fontSize: '11px', height: '32px' }}
                              >
                                + Add Custom Specification
                              </button>
                            </div>
                          ) : (
                            <div>
                              {/* Table headers */}
                              <div style={{ display: 'flex', gap: '10px', padding: '0 8px 6px 36px', borderBottom: '1px solid #e2e8f0', marginBottom: '12px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', flex: 2 }}>Spec Name</span>
                                <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', flex: 3 }}>Value</span>
                                <span style={{ width: '38px', flexShrink: 0 }}></span>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {specsDraft.custom_fields.map((field, idx) => (
                                  <div 
                                    key={idx} 
                                    style={{ 
                                      display: 'flex', 
                                      gap: '10px', 
                                      alignItems: 'center', 
                                      padding: '10px 12px', 
                                      background: 'white', 
                                      border: '1px solid #e2e8f0', 
                                      borderRadius: '8px', 
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                                    }}
                                  >
                                    {/* Index indicator */}
                                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#f1f5f9', color: '#64748b', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                      #{idx + 1}
                                    </div>

                                    <div className="form-group" style={{ margin: 0, flex: 2 }}>
                                      <input 
                                        type="text" 
                                        className="form-input" 
                                        placeholder="e.g. Height, Occasion" 
                                        value={field.label || ""}
                                        onChange={(e) => handleUpdateCustomField(idx, "label", e.target.value)}
                                        required
                                        style={{ height: '36px', fontSize: '12px' }}
                                      />
                                    </div>
                                    
                                    <div className="form-group" style={{ margin: 0, flex: 3 }}>
                                      <input 
                                        type="text" 
                                        className="form-input" 
                                        placeholder="e.g. 15cm, Bridal" 
                                        value={field.value || ""}
                                        onChange={(e) => handleUpdateCustomField(idx, "value", e.target.value)}
                                        required
                                        style={{ height: '36px', fontSize: '12px' }}
                                      />
                                    </div>

                                    <button 
                                      type="button" 
                                      onClick={() => handleRemoveCustomField(idx)} 
                                      className="add-btn secondary"
                                      style={{ padding: '0', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: '#fee2e2', color: '#ef4444', background: '#fef2f2', flexShrink: 0, borderRadius: '6px' }}
                                    >
                                      <Trash size={15} />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <button 
                                type="button" 
                                onClick={handleAddCustomField}
                                className="add-btn secondary"
                                style={{ 
                                  width: '100%', 
                                  justifyContent: 'center', 
                                  borderStyle: 'dashed', 
                                  borderWidth: '1.5px', 
                                  borderColor: '#cbd5e1',
                                  color: '#64748b',
                                  marginTop: '14px', 
                                  padding: '10px 0',
                                  fontSize: '12px',
                                  background: '#f8fafc'
                                }}
                              >
                                + Add Another Specification Row
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
              </div>
              <div className="modal-footer">
                <button type="button" className="add-btn secondary" onClick={() => setShowSpecsModal(false)}>Cancel</button>
                <button type="submit" className="add-btn" disabled={loading}>
                  <Save size={16} /> {loading ? "Saving..." : "Save Specifications"}
                </button>
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