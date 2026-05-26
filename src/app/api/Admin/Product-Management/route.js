import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { saveFile } from "@/lib/storage";
import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";
import ProductVariant from "@/lib/models/ProductVariant";
import ProductImage from "@/lib/models/ProductImage";

export async function GET() {
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
    try {
        await connectDB();
        const formData = await request.formData();

        const name = formData.get("name");
        const category_name = formData.get("category_name");
        const description = formData.get("description");
        const price = formData.get("price");
        const material = formData.get("material");
        const gender = formData.get("gender");
        const is_active = formData.get("is_active") === "true";
        
        const variantsJson = formData.get("variants");
        let variants = [];
        try { if (variantsJson) variants = JSON.parse(variantsJson); } catch (e) {}

        if (!category_name || !name || !price) {
            return NextResponse.json({ success: false, message: "Category, Name & Price Required." }, { status: 400 });
        }

        const category = await Category.findOne({ name: category_name });
        if (!category) return NextResponse.json({ success: false, message: "Category Not Found" }, { status: 400 });
        const categoryId = category._id;

        const newProduct = await Product.create({
            category_id: categoryId,
            name,
            description,
            price,
            material,
            gender,
            is_active
        });

        const productId = newProduct._id;

        // --- Parallel Media Uploads Optimization ---
        const uploadTasks = [];
        
        // Collect variant media
        variants.forEach((v, i) => {
            const files = formData.getAll(`media_variant_${i}`);
            files.forEach((file, j) => {
                uploadTasks.push((async () => {
                    const url = await saveFile(file);
                    return { type: 'variant', variantIndex: i, fileIndex: j, url, file };
                })());
            });
        });

        // Collect generic media
        const genericFiles = formData.getAll("media");
        genericFiles.forEach((file, i) => {
            uploadTasks.push((async () => {
                const url = await saveFile(file);
                return { type: 'generic', fileIndex: i, url, file };
            })());
        });

        // Run all uploads concurrently
        const uploadResults = await Promise.all(uploadTasks);

        // Process Variants
        for (let i = 0; i < variants.length; i++) {
            const v = variants[i];
            const newVariant = await ProductVariant.create({
                product_id: productId,
                material: v.material,
                description: v.description,
                price: v.price || price,
                stock: v.stock || 0
            });
            
            const variantId = newVariant._id;
            const primaryIndex = parseInt(formData.get(`primary_index_variant_${i}`) || "0");

            // Filter uploaded media for this variant
            const variantMedia = uploadResults.filter(r => r.type === 'variant' && r.variantIndex === i);
            
            for (const media of variantMedia) {
                if (media.url) {
                    const mediaType = media.file.type.startsWith("video/") ? "video" : "image";
                    await ProductImage.create({
                        product_id: productId,
                        variant_id: variantId,
                        media_url: media.url,
                        media_type: mediaType,
                        is_primary: media.fileIndex === primaryIndex
                    });
                }
            }
        }

        // Handle generic product media
        const genericMedia = uploadResults.filter(r => r.type === 'generic');
        for (const media of genericMedia) {
            if (media.url) {
                const mediaType = media.file.type.startsWith("video/") ? "video" : "image";
                await ProductImage.create({
                    product_id: productId,
                    variant_id: null,
                    media_url: media.url,
                    media_type: mediaType,
                    is_primary: false
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
    try {
        await connectDB();
        const contentType = request.headers.get("content-type") || "";

        let id, name, category_name, description, price, material, gender, is_active, variants = [];
        let formData = null;
        let isJson = contentType.includes("application/json");

        if (isJson) {
            // Handle simple JSON updates (like status toggles)
            const data = await request.json();
            id = data.id;
            is_active = data.is_active;
        } else {
            // Handle full FormData updates (with images)
            formData = await request.formData();
            id = formData.get("id");
            name = formData.get("name");
            category_name = formData.get("category_name");
            description = formData.get("description");
            price = formData.get("price");
            material = formData.get("material");
            gender = formData.get("gender");
            is_active = formData.get("is_active") === "true";
            
            const variantsJson = formData.get("variants");
            try { if (variantsJson) variants = JSON.parse(variantsJson); } catch (e) {}
        }

        if (!id) return NextResponse.json({ success: false, message: "Product Id Not Found" }, { status: 400 });

        let categoryId = null;
        if (!isJson && category_name) {
            const category = await Category.findOne({ name: category_name });
            if (category) categoryId = category._id;
        }

        // Update Product Info
        const updateFields = {};
        if (categoryId) updateFields.category_id = categoryId;
        if (name) updateFields.name = name;
        if (description !== undefined && description !== null) updateFields.description = description;
        if (price) updateFields.price = price;
        if (material !== undefined) updateFields.material = material;
        if (gender !== undefined) updateFields.gender = gender;
        if (is_active !== undefined) updateFields.is_active = is_active;

        if (Object.keys(updateFields).length > 0) {
            await Product.updateOne({ _id: id }, updateFields);
        }

        // If it's just a simple JSON update, we can return early
        if (isJson) {
            return NextResponse.json({ success: true, message: "Product status updated successfully" }, { status: 200 });
        }

        // --- Variant Syncing Logic (Only for Full FormData Edit) ---
        // 1. Get current variant IDs
        const currentVariants = await ProductVariant.find({ product_id: id });
        const currentVariantIds = currentVariants.map(v => v._id.toString());
        const incomingVariantIds = variants.map(v => v.id).filter(vId => vId && typeof vId === 'string' && vId.length > 5);

        // 2. Delete variants not in incoming list
        const toDelete = currentVariantIds.filter(vId => !incomingVariantIds.includes(vId));
        if (toDelete.length > 0) {
            await ProductVariant.deleteMany({ _id: { $in: toDelete } });
            await ProductImage.deleteMany({ variant_id: { $in: toDelete } });
        }

        // 3. Update or Insert Variants
        for (let i = 0; i < variants.length; i++) {
            const v = variants[i];
            let variantId = v.id;

            if (variantId && typeof variantId === 'string' && variantId.length > 5) {
                // Update
                await ProductVariant.updateOne({ _id: variantId }, {
                    material: v.material,
                    description: v.description,
                    price: v.price || price,
                    stock: v.stock || 0
                });
            } else {
                // Insert
                const newVariant = await ProductVariant.create({
                    product_id: id,
                    material: v.material,
                    description: v.description,
                    price: v.price || price,
                    stock: v.stock || 0
                });
                variantId = newVariant._id.toString();
            }

            // 4. Media Management for this Variant
            const existingMedia = v.existing_media || [];
            const newFiles = formData.getAll(`media_variant_${i}`);
            const primaryIndex = parseInt(formData.get(`primary_index_variant_${i}`) || "0");

            // Clear existing variant images to re-sync (simpler)
            await ProductImage.deleteMany({ variant_id: variantId });

            let currentIndex = 0;
            // Re-insert kept media
            for (const media of existingMedia) {
                await ProductImage.create({
                    product_id: id,
                    variant_id: variantId,
                    media_url: media.media_url,
                    media_type: media.media_type,
                    is_primary: currentIndex === primaryIndex
                });
                currentIndex++;
            }
            // Insert new media
            for (const file of newFiles) {
                const mediaUrl = await saveFile(file);
                if (mediaUrl) {
                    const mediaType = file.type.startsWith("video/") ? "video" : "image";
                    await ProductImage.create({
                        product_id: id,
                        variant_id: variantId,
                        media_url: mediaUrl,
                        media_type: mediaType,
                        is_primary: currentIndex === primaryIndex
                    });
                    currentIndex++;
                }
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