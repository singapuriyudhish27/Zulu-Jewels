import ProductsClient from './ProductsClient';
import { connectDB } from "@/lib/db";
import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";
import ProductImage from "@/lib/models/ProductImage";

export const revalidate = 60;

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
    const cats = await Category.find(categoryFilter)
      .select('_id name image_url')
      .sort({ name: 1 })
      .lean();

    if (!cats.length) return [];

    const catIds = cats.map(c => c._id);

    // Build product filter
    const productFilter = { is_deleted: false, category_id: { $in: catIds } };
    if (search) {
      const regex = new RegExp(search, 'i');
      productFilter.$or = [{ name: regex }, { description: regex }];
    }

    // Single batch query for all matching products
    const products = await Product.find(productFilter)
      .select('_id category_id name description price is_active gender created_at updated_at')
      .sort({ _id: -1 })
      .lean();

    const productIds = products.map(p => p._id);

    // Single batch query for all images belonging to these products
    const images = productIds.length > 0
      ? await ProductImage.find({ product_id: { $in: productIds } })
          .select('_id product_id variant_id media_url is_primary is_hover')
          .sort({ variant_id: 1, media_url: 1 })
          .lean()
      : [];

    // Group images by product_id in-memory
    const imagesMap = {};
    for (const img of images) {
      const pid = img.product_id.toString();
      if (!imagesMap[pid]) imagesMap[pid] = [];
      imagesMap[pid].push({
        id: img._id.toString(),
        variant_id: img.variant_id?.toString() || null,
        image_url: img.media_url,
        is_primary: Boolean(img.is_primary),
        is_hover: Boolean(img.is_hover),
      });
    }

    // Group products by category_id in-memory
    const productsByCat = {};
    for (const p of products) {
      const cid = p.category_id?.toString();
      if (!cid) continue;
      if (!productsByCat[cid]) productsByCat[cid] = [];
      productsByCat[cid].push({
        id: p._id.toString(),
        category_id: cid,
        name: p.name,
        description: p.description,
        price: p.price,
        is_active: p.is_active,
        gender: p.gender,
        created_at: p.created_at ? new Date(p.created_at).toISOString() : null,
        updated_at: p.updated_at ? new Date(p.updated_at).toISOString() : null,
        images: imagesMap[p._id.toString()] || [],
        swatches: []
      });
    }

    // Assemble category hierarchy
    const categoriesResult = [];
    for (const cat of cats) {
      const catIdStr = cat._id.toString();
      const catProducts = productsByCat[catIdStr] || [];
      if (catProducts.length > 0 || !search) {
        categoriesResult.push({
          id: catIdStr,
          name: cat.name,
          image: cat.image_url,
          products: catProducts
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
