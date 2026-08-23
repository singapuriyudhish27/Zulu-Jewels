import HomePageClient from './HomePageClient';
import { connectDB } from "@/lib/db";
import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";
import ProductImage from "@/lib/models/ProductImage";

export const revalidate = 300; // 5 minutes cache

async function getHomePageData() {
  try {
    await connectDB();
    const categories = await Category.find()
      .select('_id name image_url')
      .lean();

    const allProducts = await Product.find({ is_deleted: false })
      .select('_id name description price is_active created_at category_id')
      .sort({ _id: -1 })
      .limit(700) // generous cap; each category will be sliced to 10 below
      .lean();
    const productIds = allProducts.map(p => p._id);

    const allImages = await ProductImage.find({ product_id: { $in: productIds } })
      .select('_id product_id media_url is_primary is_hover')
      .lean();
    const imagesMap = {};
    for (const img of allImages) {
      const pid = img.product_id.toString();
      if (!imagesMap[pid]) {
        imagesMap[pid] = [];
      }
      imagesMap[pid].push(img);
    }

    for (const pid in imagesMap) {
      imagesMap[pid].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
    }

    const productsMap = {};
    for (const p of allProducts) {
      if (!p.category_id) continue;
      const cid = p.category_id.toString();
      if (!productsMap[cid]) {
        productsMap[cid] = [];
      }

      const images = imagesMap[p._id.toString()] || [];
      productsMap[cid].push({
        id: p._id.toString(),
        name: p.name,
        description: p.description,
        price: p.price,
        is_active: p.is_active,
        created_at: p.created_at?.toISOString() || null,
        images: images.map(img => ({
          id: img._id.toString(),
          image_url: img.media_url,
          is_primary: Boolean(img.is_primary),
          is_hover: Boolean(img.is_hover),
        })),
      });
    }

    const mapping = {
      "Rings": "Timeless Rings",
      "Earrings": "Statement Earrings",
      "Necklaces": "Timeless Neckline Elegance",
      "Bracelets": "Minimal & Statement Bracelets",
      "Pendants": "Pendants",
      "Watches": "Watches",
      "Anklets": "Anklets"
    };

    const formattedSections = categories.map(cat => ({
      id: cat._id.toString(),
      title: mapping[cat.name] || cat.name,
      name: cat.name,
      // Slice to latest 10 per category — already sorted newest-first by _id: -1
      products: (productsMap[cat._id.toString()] || []).slice(0, 10)
    })).filter(section => section.products.length > 0);

    const dbCollections = categories.map(cat => ({
      id: cat._id.toString(),
      name: cat.name,
      img: cat.image_url || "/Home Page/Most Loved Pieces/Frame 122.png"
    }));

    return {
      sections: formattedSections,
      collections: dbCollections
    };
  } catch (error) {
    console.error("Error fetching homepage data server-side:", error);
    return { sections: [], collections: [] };
  }
}

export const metadata = {
  title: 'Zulu Jewellers | Premium Lab-Grown Diamonds & Fine Jewelry',
  description: "Discover timeless fine jewellery and certified lab-grown diamonds crafted with exceptional beauty and modern sophistication.",
  openGraph: {
    title: 'Zulu Jewellers | Premium Lab-Grown Diamonds',
    description: "Discover timeless fine jewellery and certified lab-grown diamonds crafted with exceptional beauty.",
    type: 'website',
  }
};

export default async function HomePage() {
  const { sections, collections } = await getHomePageData();

  return (
    <HomePageClient 
      initialSections={sections} 
      initialCollections={collections} 
    />
  );
}
