import { Suspense } from 'react';
import ProductDetailsClient from './ProductDetailsClient';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';
import ProductImage from '@/lib/models/ProductImage';
import Category from '@/lib/models/Category';
import PageLoader from '@/components/common/PageLoader';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.zulujewels.com';

/**
 * Server-side metadata generation for SEO — runs at request time so crawlers
 * always get accurate title, description, and Open Graph image.
 */
export async function generateMetadata({ params }) {
  const { Product_Details: id } = await params;

  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    return {
      title: 'Product Not Found | Zulu Jewels',
      description: 'The requested product could not be found.',
    };
  }

  try {
    await connectDB();
    const [product, category] = await Promise.all([
      Product.findById(id).select('name description price material category_id is_active is_deleted').lean(),
      null // resolved below
    ]);

    if (!product || product.is_deleted || !product.is_active) {
      return {
        title: 'Product Not Found | Zulu Jewels',
        description: 'The requested product could not be found.',
      };
    }

    const cat = product.category_id
      ? await Category.findById(product.category_id).select('name').lean()
      : null;

    const primaryImage = await ProductImage.findOne({ product_id: id, is_primary: true })
      .select('media_url')
      .lean();

    const ogImage = primaryImage?.media_url || `${BASE_URL}/og-default.jpg`;
    const title = `${product.name} | Zulu Jewels`;
    const description = product.description
      ? product.description.slice(0, 160).replace(/\n/g, ' ')
      : `Shop ${product.name} – premium ${product.material || 'fine jewellery'} from Zulu Jewels.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${BASE_URL}/Pages/Products/${id}`,
        siteName: 'Zulu Jewels',
        images: [{ url: ogImage, width: 1200, height: 630, alt: product.name }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
      alternates: {
        canonical: `${BASE_URL}/Pages/Products/${id}`,
      },
      other: {
        'product:price:amount': String(product.price || ''),
        'product:price:currency': 'INR',
      },
    };
  } catch {
    return {
      title: 'Zulu Jewels – Fine Diamond Jewellery',
      description: 'Discover exquisite handcrafted diamond jewellery at Zulu Jewels.',
    };
  }
}

/**
 * Next.js App Router page entry point.
 * This is a Server Component — it renders no interactive state itself.
 * All interactivity is handled by ProductDetailsClient ('use client').
 */
export default function ProductDetailsPage({ params, searchParams }) {
  return (
    <Suspense fallback={<PageLoader label="Preparing your jewellery" />}>
      <ProductDetailsClient />
    </Suspense>
  );
}
