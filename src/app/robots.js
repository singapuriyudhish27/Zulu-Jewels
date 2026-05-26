export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/portal/', '/api/', '/auth/', '/Pages/Profile/', '/Pages/cart/'],
    },
    sitemap: 'https://zulujewellers.com/sitemap.xml',
  };
}
