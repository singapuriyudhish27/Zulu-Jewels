import { NextResponse } from "next/server";
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

        // Fetch Categories
        const categories = await Category.find();

        // Fetch non-deleted products
        const productsRaw = await Product.find({ is_deleted: false }).sort({ created_at: -1 });

        // Group Data
        const products = [];

        for (const p of productsRaw) {
            // Find Category details
            const category = categories.find(c => c._id.toString() === p.category_id?.toString());
            
            // Fetch Variants for this product
            const variants = await ProductVariant.find({ product_id: p._id });

            // Fetch Images for this product
            const images = await ProductImage.find({ product_id: p._id });

            products.push({
                id: p._id,
                name: p.name,
                description: p.description,
                price: p.price,
                material: p.material,
                gender: p.gender,
                is_active: p.is_active,
                created_at: p.created_at,
                category: category ? {
                    id: category._id,
                    name: category.name,
                } : { id: null, name: null },
                variants: variants,
                images: images
            });
        }

        return NextResponse.json({
            success: true,
            categories: categories,
            data: products,
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Products Data:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
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
            is_active,
            variants = [],
            media = []
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

        const newProduct = await Product.create({
            category_id: categoryId,
            name,
            description,
            price: Number(price),
            material: finalMaterial,
            gender,
            is_active
        });

        const productId = newProduct._id;

        // Process Variants & Variant Media
        for (let i = 0; i < variants.length; i++) {
            const v = variants[i];
            const newVariant = await ProductVariant.create({
                product_id: productId,
                material: v.material,
                description: v.description,
                price: Number(v.price) || Number(price),
                stock: Number(v.stock) || 0
            });
            
            const variantId = newVariant._id;
            const variantMediaList = v.media || [];
            
            for (let j = 0; j < variantMediaList.length; j++) {
                const vm = variantMediaList[j];
                const input = vm.fileData || vm.media_url || vm.url;
                if (input) {
                    const uploadedUrl = await saveFile(input);
                    const mediaType = (vm.fileType && vm.fileType.startsWith("video/")) || (vm.media_type === "video") ? "video" : "image";
                    await ProductImage.create({
                        product_id: productId,
                        variant_id: variantId,
                        media_url: uploadedUrl,
                        media_type: mediaType,
                        is_primary: Boolean(vm.is_primary)
                    });
                }
            }
        }

        // Process Generic Product Media
        for (let i = 0; i < media.length; i++) {
            const gm = media[i];
            const input = gm.fileData || gm.media_url || gm.url;
            if (input) {
                const uploadedUrl = await saveFile(input);
                const mediaType = (gm.fileType && gm.fileType.startsWith("video/")) || (gm.media_type === "video") ? "video" : "image";
                await ProductImage.create({
                    product_id: productId,
                    variant_id: null,
                    media_url: uploadedUrl,
                    media_type: mediaType,
                    is_primary: Boolean(gm.is_primary)
                });
            }
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
            is_active,
            variants = [],
            media = []
        } = data;

        if (!id) return NextResponse.json({ success: false, message: "Product Id Not Found" }, { status: 400 });

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
        if (is_active !== undefined) updateFields.is_active = is_active;

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

        // 3. Update or Insert Variants
        for (let i = 0; i < variants.length; i++) {
            const v = variants[i];
            let variantId = v.id || v._id;

            if (variantId && typeof variantId === 'string' && variantId.length > 5) {
                // Update
                await ProductVariant.updateOne({ _id: variantId, product_id: id }, {
                    material: v.material,
                    description: v.description,
                    price: Number(v.price) || Number(price),
                    stock: Number(v.stock) || 0
                });
            } else {
                // Insert
                const newVariant = await ProductVariant.create({
                    product_id: id,
                    material: v.material,
                    description: v.description,
                    price: Number(v.price) || Number(price),
                    stock: Number(v.stock) || 0
                });
                variantId = newVariant._id.toString();
            }

            // 4. Media Management for this Variant
            const variantMediaList = v.media || [];
            
            // Clear existing variant images to re-sync
            await ProductImage.deleteMany({ variant_id: variantId });

            for (let j = 0; j < variantMediaList.length; j++) {
                const vm = variantMediaList[j];
                const input = vm.fileData || vm.media_url || vm.url;
                if (input) {
                    const uploadedUrl = await saveFile(input);
                    const mediaType = (vm.fileType && vm.fileType.startsWith("video/")) || (vm.media_type === "video") ? "video" : "image";
                    await ProductImage.create({
                        product_id: id,
                        variant_id: variantId,
                        media_url: uploadedUrl,
                        media_type: mediaType,
                        is_primary: Boolean(vm.is_primary)
                    });
                }
            }
        }

        // Handle generic product media
        await ProductImage.deleteMany({ product_id: id, variant_id: null });
        for (let i = 0; i < media.length; i++) {
            const gm = media[i];
            const input = gm.fileData || gm.media_url || gm.url;
            if (input) {
                const uploadedUrl = await saveFile(input);
                const mediaType = (gm.fileType && gm.fileType.startsWith("video/")) || (gm.media_type === "video") ? "video" : "image";
                await ProductImage.create({
                    product_id: id,
                    variant_id: null,
                    media_url: uploadedUrl,
                    media_type: mediaType,
                    is_primary: Boolean(gm.is_primary)
                });
            }
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