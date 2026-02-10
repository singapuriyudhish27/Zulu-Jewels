import Image from 'next/image';
import Button from '../common/Button';
import SectionHeading from '../common/SectionHeading';

export default function AboutPreview() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative h-[500px] rounded-lg overflow-hidden shadow-xl">
            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-amber-900/20 flex items-center justify-center">
                  <svg className="w-12 h-12 text-amber-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm">About Image Placeholder</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <SectionHeading
              title="Crafting Excellence Since Day One"
              subtitle="Our Story"
              align="left"
              className="mb-6"
            />
            <p className="text-lg text-gray-600 mb-4">
              At Zulu Jewels, we believe that jewelry is more than an accessory—it's a statement of 
              personal style and a celebration of life's precious moments.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Our master craftsmen combine traditional techniques with contemporary design, creating 
              pieces that are both timeless and modern. Each creation is meticulously handcrafted 
              using only the finest materials, ensuring exceptional quality and lasting beauty.
            </p>
            <Button href="/about" variant="outline">
              Learn More About Us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

