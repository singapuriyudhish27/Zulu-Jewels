import Image from 'next/image';
import Button from '../common/Button';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(180,83,9,0.1),transparent_50%)]" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <p className="text-amber-900 font-semibold text-sm uppercase tracking-wider mb-4">
              Timeless Elegance
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-gray-900 mb-6 leading-tight">
              Handcrafted
              <span className="block text-amber-900">Jewelry</span>
              <span className="block">for Every Moment</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
              Discover our exquisite collection of fine jewelry, where tradition meets modern elegance. 
              Each piece is crafted with precision and passion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button href="/collections" size="lg">
                Explore Collections
              </Button>
              <Button href="/about" variant="outline" size="lg">
                Our Story
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative h-[500px] lg:h-[600px] rounded-lg overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-transparent z-10" />
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-900 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Jewelry Image Placeholder</p>
                <p className="text-gray-400 text-xs mt-2">Add your hero image to /public/images/hero.jpg</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

