import { connectDB } from '@/lib/db';
import Category from '@/lib/models/Category';
import Product from '@/lib/models/Product';

export default async function sitemap() {
  const baseUrl = 'https://www.zulujewellers.com';
  
  // Static paths
  const routes = [
    '',
    '/Pages',
    '/Pages/about',
    '/Pages/contact',
    '/Pages/custom',
    '/Pages/Products',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' || route === '/Pages' ? 1.0 : 0.8,
  }));

  try {
    await connectDB();
    
    // Dynamic Categories
    const categories = await Category.find();
    const categoryRoutes = categories.map((cat) => ({
      url: `${baseUrl}/Pages/Products?category=${cat._id.toString()}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    // Dynamic Products
    const products = await Product.find({ is_deleted: false })
        .select('_id updated_at')
        .limit(5000)
        .lean();
    const productRoutes = products.map((prod) => ({
      url: `${baseUrl}/Pages/Products/${prod._id.toString()}`,
      lastModified: prod.updated_at || new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

    return [...routes, ...categoryRoutes, ...productRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return routes;
  }
}
