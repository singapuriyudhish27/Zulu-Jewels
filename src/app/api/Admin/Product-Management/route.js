import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { saveFile } from "@/lib/storage";
import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";
import ProductVariant from "@/lib/models/ProductVariant";
import ProductImage from "@/lib/models/ProductImage";
import { verifyAdminFromRequest } from "@/lib/adminAuth";

export async function GET(request) {
    const auth = await verifyAdminFromRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        await connectDB();

        const url = new URL(request.url);
        const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
        const rawLimit = url.searchParams.get("limit");
        const limit = rawLimit !== null ? Math.min(Math.max(parseInt(rawLimit, 10), 1), 100) : 50;

        // Fetch Categories
        const categories = await Category.find().lean();

        const skip = (page - 1) * limit;
        const totalProducts = await Product.countDocuments({ is_deleted: false });
        const productsRaw = await Product.find({ is_deleted: false })
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const productIds = productsRaw.map(p => p._id);

        // Fetch variants in bulk
        const allVariants = await ProductVariant.find({ product_id: { $in: productIds } }).lean();
        const variantsMap = {};
        for (const v of allVariants) {
            const pid = v.product_id.toString();
            if (!variantsMap[pid]) {
                variantsMap[pid] = [];
            }
            variantsMap[pid].push(v);
        }

        // Fetch images in bulk
        const allImages = await ProductImage.find({ product_id: { $in: productIds } }).lean();
        const imagesMap = {};
        for (const img of allImages) {
            const pid = img.product_id.toString();
            if (!imagesMap[pid]) {
                imagesMap[pid] = [];
            }
            imagesMap[pid].push(img);
        }

        // Group Data
        const products = productsRaw.map(p => {
            const category = categories.find(c => c._id.toString() === p.category_id?.toString());
            const variants = variantsMap[p._id.toString()] || [];
            const images = imagesMap[p._id.toString()] || [];

            return {
                id: p._id,
                name: p.name,
                description: p.description,
                price: p.price,
                material: p.material,
                gender: p.gender,
                craftsmanship_video: p.craftsmanship_video || '',
                is_active: p.is_active,
                created_at: p.created_at,
                category: category ? {
                    id: category._id,
                    name: category.name,
                } : { id: null, name: null },
                variants,
                images,
                specifications: p.specifications || {}
            };
        });

        return NextResponse.json({
            success: true,
            categories: categories,
            data: products,
            pagination: limit > 0 ? {
                totalProducts,
                totalPages: Math.ceil(totalProducts / limit),
                currentPage: page,
                limit
            } : null
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Products Data:", error);
        return NextResponse.json({ message: "Error In Backend API Call" }, { status: 500 });
    }
}

//Add New Product
export async function POST(request) {
    const auth = await verifyAdminFromRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        await connectDB();
        const data = await request.json();
        
        const {
            name,
            category_name,
            description,
            price,
            material,
            gender,
            craftsmanship_video,
            is_active,
            variants = [],
            media = [],
            specifications = {}
        } = data;

        if (!category_name || !name || !price) {
            return NextResponse.json({ success: false, message: "Category, Name & Price Required." }, { status: 400 });
        }

        const category = await Category.findOne({ name: category_name });
        if (!category) return NextResponse.json({ success: false, message: "Category Not Found" }, { status: 400 });
        const categoryId = category._id;

        let finalMaterial = material;
        if (variants && variants.length > 0) {
            finalMaterial = [...new Set(variants.map(v => v.material).filter(m => m))].join(", ");
        }

        let craftsmanshipVideoUrl = "";
        if (craftsmanship_video) {
            craftsmanshipVideoUrl = await saveFile(craftsmanship_video, "craftsmanship_videos");
        }

        const newProduct = await Product.create({
            category_id: categoryId,
            name,
            description,
            price: Number(price),
            material: finalMaterial,
            gender,
            craftsmanship_video: craftsmanshipVideoUrl,
            is_active,
            specifications
        });

        const productId = newProduct._id;

        // Process Variants & Variant Media concurrently
        const variantPromises = variants.map(async (v) => {
            const variantId = new mongoose.Types.ObjectId();
            const variantMediaList = v.media || [];
            
            const mediaUploadPromises = variantMediaList.map(async (vm) => {
                const input = vm.fileData || vm.media_url || vm.url;
                if (input) {
                    const uploadedUrl = await saveFile(input);
                    const mediaType = (vm.fileType && vm.fileType.startsWith("video/")) || (vm.media_type === "video") ? "video" : "image";
                    return {
                        product_id: productId,
                        variant_id: variantId,
                        media_url: uploadedUrl,
                        media_type: mediaType,
                        is_primary: Boolean(vm.is_primary),
                        is_hover: Boolean(vm.is_hover)
                    };
                }
                return null;
            });
            
            const uploadedMedia = (await Promise.all(mediaUploadPromises)).filter(Boolean);
            
            return {
                variantData: {
                    _id: variantId,
                    product_id: productId,
                    material: v.material,
                    metal_type: v.metal_type,
                    metal_purity: v.metal_purity,
                    metal_color: v.metal_color,
                    metal_weight: v.metal_weight ? Number(v.metal_weight) : undefined,
                    gemstone_type: v.gemstone_type || "None",
                    gemstone_tcw: v.gemstone_tcw ? Number(v.gemstone_tcw) : undefined,
                    gemstone_color: v.gemstone_color || undefined,
                    gemstone_clarity: v.gemstone_clarity || undefined,
                    gemstone_cut: v.gemstone_cut || undefined,
                    gemstone_shape: v.gemstone_shape || undefined,
                    gemstone_setting: v.gemstone_setting || undefined,
                    gemstone_center_carat: v.gemstone_center_carat ? Number(v.gemstone_center_carat) : undefined,
                    gemstone_cert_agency: v.gemstone_cert_agency || undefined,
                    gemstone_cert_number: v.gemstone_cert_number || undefined,
                    description: v.description,
                    price: Number(v.price) || Number(price),
                    stock: Number(v.stock) || 0
                },
                mediaItems: uploadedMedia
            };
        });
        
        const genericMediaPromises = media.map(async (gm) => {
            const input = gm.fileData || gm.media_url || gm.url;
            if (input) {
                const uploadedUrl = await saveFile(input);
                const mediaType = (gm.fileType && gm.fileType.startsWith("video/")) || (gm.media_type === "video") ? "video" : "image";
                return {
                    product_id: productId,
                    variant_id: null,
                    media_url: uploadedUrl,
                    media_type: mediaType,
                    is_primary: Boolean(gm.is_primary),
                    is_hover: Boolean(gm.is_hover)
                };
            }
            return null;
        });

        // Run all concurrent uploads
        const [resolvedVariants, resolvedGenericMedia] = await Promise.all([
            Promise.all(variantPromises),
            Promise.all(genericMediaPromises)
        ]);

        // Insert into database
        for (const item of resolvedVariants) {
            await ProductVariant.create(item.variantData);
            for (const img of item.mediaItems) {
                await ProductImage.create(img);
            }
        }
        for (const img of resolvedGenericMedia.filter(Boolean)) {
            await ProductImage.create(img);
        }

        return NextResponse.json({ success: true, message: "Product added successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error Adding Products:", error);
        return NextResponse.json({ message: "Error In Backend API Call" }, { status: 500 });
    }
}

//Edit Product
export async function PUT(request) {
    const auth = await verifyAdminFromRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        await connectDB();
        const data = await request.json();
        
        const {
            id,
            name,
            category_name,
            description,
            price,
            material,
            gender,
            craftsmanship_video,
            is_active,
            variants = [],
            media = [],
            specifications = {}
        } = data;

        if (!id) return NextResponse.json({ success: false, message: "Product Id Not Found" }, { status: 400 });
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return NextResponse.json({ success: false, message: "Invalid Product ID format" }, { status: 400 });
        }

        // If it's a simple status toggle JSON update (only id and is_active are passed, others are missing), we do the update and return early
        const isStatusToggleOnly = !name && !category_name && !price;

        let categoryId = null;
        if (category_name) {
            const category = await Category.findOne({ name: category_name });
            if (category) categoryId = category._id;
        }

        // Update Product Info
        const updateFields = {};
        if (categoryId) updateFields.category_id = categoryId;
        if (name) updateFields.name = name;
        if (description !== undefined && description !== null) updateFields.description = description;
        if (price) updateFields.price = Number(price);
        
        let finalMaterial = material;
        if (variants && variants.length > 0) {
            finalMaterial = [...new Set(variants.map(v => v.material).filter(m => m))].join(", ");
        }
        if (finalMaterial !== undefined) updateFields.material = finalMaterial;
        if (gender !== undefined) updateFields.gender = gender;
        if (craftsmanship_video !== undefined) {
            if (craftsmanship_video) {
                updateFields.craftsmanship_video = await saveFile(craftsmanship_video, "craftsmanship_videos");
            } else {
                updateFields.craftsmanship_video = "";
            }
        }
        if (is_active !== undefined) updateFields.is_active = is_active;
        if (specifications !== undefined) updateFields.specifications = specifications;

        if (Object.keys(updateFields).length > 0) {
            await Product.updateOne({ _id: id }, updateFields);
        }

        if (isStatusToggleOnly) {
            return NextResponse.json({ success: true, message: "Product status updated successfully" }, { status: 200 });
        }

        // --- Variant Syncing Logic ---
        // 1. Get current variant IDs
        const currentVariants = await ProductVariant.find({ product_id: id });
        const currentVariantIds = currentVariants.map(v => v._id.toString());
        const incomingVariantIds = variants.map(v => v.id || v._id).filter(vId => vId && typeof vId === 'string' && vId.length > 5);

        // 2. Delete variants not in incoming list
        const toDelete = currentVariantIds.filter(vId => !incomingVariantIds.includes(vId));
        if (toDelete.length > 0) {
            await ProductVariant.deleteMany({ _id: { $in: toDelete } });
            await ProductImage.deleteMany({ variant_id: { $in: toDelete } });
        }

        // 3. Update or Insert Variants concurrently
        const variantPromises = variants.map(async (v) => {
            let variantId = v.id || v._id;
            const isUpdate = variantId && typeof variantId === 'string' && variantId.length > 5;

            if (!isUpdate) {
                variantId = new mongoose.Types.ObjectId().toString();
            }

            // Upload variant media concurrently
            const variantMediaList = v.media || [];
            const mediaUploadPromises = variantMediaList.map(async (vm) => {
                const input = vm.fileData || vm.media_url || vm.url;
                if (input) {
                    const uploadedUrl = await saveFile(input);
                    const mediaType = (vm.fileType && vm.fileType.startsWith("video/")) || (vm.media_type === "video") ? "video" : "image";
                    return {
                        product_id: id,
                        variant_id: variantId,
                        media_url: uploadedUrl,
                        media_type: mediaType,
                        is_primary: Boolean(vm.is_primary),
                        is_hover: Boolean(vm.is_hover)
                    };
                }
                return null;
            });

            const uploadedMedia = (await Promise.all(mediaUploadPromises)).filter(Boolean);

            return {
                variantId,
                isUpdate,
                variantData: {
                    material: v.material,
                    metal_type: v.metal_type,
                    metal_purity: v.metal_purity,
                    metal_color: v.metal_color,
                    metal_weight: v.metal_weight ? Number(v.metal_weight) : undefined,
                    gemstone_type: v.gemstone_type || "None",
                    gemstone_tcw: v.gemstone_tcw ? Number(v.gemstone_tcw) : undefined,
                    gemstone_color: v.gemstone_color || undefined,
                    gemstone_clarity: v.gemstone_clarity || undefined,
                    gemstone_cut: v.gemstone_cut || undefined,
                    gemstone_shape: v.gemstone_shape || undefined,
                    gemstone_setting: v.gemstone_setting || undefined,
                    gemstone_center_carat: v.gemstone_center_carat ? Number(v.gemstone_center_carat) : undefined,
                    gemstone_cert_agency: v.gemstone_cert_agency || undefined,
                    gemstone_cert_number: v.gemstone_cert_number || undefined,
                    description: v.description,
                    price: Number(v.price) || Number(price),
                    stock: Number(v.stock) || 0
                },
                mediaItems: uploadedMedia
            };
        });

        const genericMediaPromises = media.map(async (gm) => {
            const input = gm.fileData || gm.media_url || gm.url;
            if (input) {
                const uploadedUrl = await saveFile(input);
                const mediaType = (gm.fileType && gm.fileType.startsWith("video/")) || (gm.media_type === "video") ? "video" : "image";
                return {
                    product_id: id,
                    variant_id: null,
                    media_url: uploadedUrl,
                    media_type: mediaType,
                    is_primary: Boolean(gm.is_primary),
                    is_hover: Boolean(gm.is_hover)
                };
            }
            return null;
        });

        // Run all concurrent uploads in parallel
        const [resolvedVariants, resolvedGenericMedia] = await Promise.all([
            Promise.all(variantPromises),
            Promise.all(genericMediaPromises)
        ]);

        // Apply Database Writes
        for (const item of resolvedVariants) {
            if (item.isUpdate) {
                await ProductVariant.updateOne({ _id: item.variantId, product_id: id }, item.variantData);
            } else {
                await ProductVariant.create({
                    _id: item.variantId,
                    product_id: id,
                    ...item.variantData
                });
            }

            // Sync media for this variant
            await ProductImage.deleteMany({ variant_id: item.variantId });
            for (const img of item.mediaItems) {
                await ProductImage.create(img);
            }
        }

        // Generic media
        await ProductImage.deleteMany({ product_id: id, variant_id: null });
        for (const img of resolvedGenericMedia.filter(Boolean)) {
            await ProductImage.create(img);
        }

        return NextResponse.json({ success: true, message: "Product updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Editing Products:", error);
        return NextResponse.json({ message: "Error In Backend API Call" }, { status: 500 });
    }
}

//Delete Product
export async function DELETE(request) {
    const auth = await verifyAdminFromRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        await connectDB();
        const body = await request.json();
        const { product_id } = body;

        if (!product_id) return NextResponse.json({ success: false, message: "Product id Not Found" }, { status: 400 });
        if (!/^[0-9a-fA-F]{24}$/.test(product_id)) {
            return NextResponse.json({ success: false, message: "Invalid Product ID format" }, { status: 400 });
        }

        const product = await Product.findById(product_id);
        if (!product) return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
        if (product.is_active) return NextResponse.json({ success: false, message: "Deactivate product first" }, { status: 400 });

        // Use Soft Delete instead of physical delete
        await Product.updateOne({ _id: product_id }, { is_deleted: true });

        return NextResponse.json({ success: true, message: "Product Deleted Successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Deleting Products:", error);
        return NextResponse.json({ message: "Error In Backend API Call" }, { status: 500 });
    }
}