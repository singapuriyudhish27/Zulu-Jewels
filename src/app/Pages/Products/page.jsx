import ProductsClient from './ProductsClient';
import { connectDB } from "@/lib/db";
import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";
import ProductImage from "@/lib/models/ProductImage";

async function getProductsData(categoryId, search) {
  try {
    await connectDB();

    // Build category filter
    let categoryFilter = {};
    if (categoryId) {
      if (typeof categoryId === 'string' && /^[0-9a-fA-F]{24}$/.test(categoryId)) {
        categoryFilter = { _id: categoryId };
      } else {
        categoryFilter = { _id: null };
      }
    }
    const cats = await Category.find(categoryFilter).sort({ name: 1 });

    // Build product filter
    const productFilter = { is_deleted: false };
    if (search) {
      const regex = new RegExp(search, 'i');
      productFilter.$or = [{ name: regex }, { description: regex }];
    }

    const categoriesResult = [];

    for (const cat of cats) {
      const products = await Product.find({ ...productFilter, category_id: cat._id }).sort({ _id: -1 });

      const productsWithImages = [];
      for (const p of products) {
        const images = await ProductImage.find({ product_id: p._id }).sort({ variant_id: 1, media_url: 1 });

        productsWithImages.push({
          id: p._id.toString(),
          category_id: cat._id.toString(),
          name: p.name,
          description: p.description,
          price: p.price,
          is_active: p.is_active,
          gender: p.gender,
          created_at: p.created_at?.toISOString() || null,
          updated_at: p.updated_at?.toISOString() || null,
          images: images.map(img => ({
            id: img._id.toString(),
            variant_id: img.variant_id?.toString() || null,
            image_url: img.media_url,
            is_primary: Boolean(img.is_primary),
          })),
          swatches: []
        });
      }

      if (productsWithImages.length > 0 || !search) {
        categoriesResult.push({
          id: cat._id.toString(),
          name: cat.name,
          image: cat.image_url,
          products: productsWithImages
        });
      }
    }

    return categoriesResult;
  } catch (error) {
    console.error("Error fetching products server-side:", error);
    return [];
  }
}

// Generate Dynamic Metadata for the Product Listing Page
export async function generateMetadata({ searchParams }) {
  const { category, search } = await searchParams;
  await connectDB();

  let categoryName = 'All Collections';
  if (category && typeof category === 'string' && /^[0-9a-fA-F]{24}$/.test(category)) {
    const cat = await Category.findById(category);
    if (cat) categoryName = cat.name;
  }

  const title = search 
    ? `Search Results for "${search}" | Zulu Jewellers`
    : `${categoryName} | Premium Lab-Grown Diamonds | Zulu Jewellers`;

  const description = search
    ? `Browse search results for "${search}" at Zulu Jewellers. Find sustainable, beautifully crafted lab-grown diamonds.`
    : `Explore the Zulu Jewellers ${categoryName} Collection. Certified lab-grown diamond rings, earrings, pendants, and bracelets.`;

  const canonicalUrl = category 
    ? `https://zulujewellers.com/Pages/Products?category=${category}`
    : 'https://zulujewellers.com/Pages/Products';

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Zulu Jewellers',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    }
  };
}

export default async function ProductsPage({ searchParams }) {
  const { category, search } = await searchParams;
  const categories = await getProductsData(category, search);

  return <ProductsClient initialCategories={categories} />;
}
