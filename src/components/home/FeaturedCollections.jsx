import Card from '../common/Card';
import SectionHeading from '../common/SectionHeading';

export default function FeaturedCollections() {
  const collections = [
    {
      title: 'Ginkgo Leaf Collection',
      description: 'Elegant gold jewelry featuring delicate ginkgo leaf designs',
      image: '/images/ginkgo-collection.jpg',
      price: 'From $299',
      href: '/collections/ginkgo',
    },
    {
      title: 'Snake Chain Classics',
      description: 'Timeless snake chain necklaces in pure gold',
      image: '/images/snake-chain.jpg',
      price: 'From $199',
      href: '/collections/snake-chain',
    },
    {
      title: 'Rose Gold Diamonds',
      description: 'Stunning rose gold pieces adorned with brilliant diamonds',
      image: '/images/rose-gold-diamonds.jpg',
      price: 'From $599',
      href: '/collections/rose-gold',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Featured Collections"
          subtitle="Discover Our Finest"
          className="mb-12"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection, index) => (
            <Card
              key={index}
              title={collection.title}
              description={collection.description}
              image={collection.image}
              imageAlt={collection.title}
              price={collection.price}
              href={collection.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

