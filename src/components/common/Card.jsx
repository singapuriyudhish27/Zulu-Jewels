'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function Card({ 
  title, 
  description, 
  image, 
  imageAlt = '', 
  price,
  href,
  className = '' 
}) {
  const [imageError, setImageError] = useState(false);

  const content = (
    <div className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 ${className}`}>
      <div className="relative w-full h-64 bg-gradient-to-br from-amber-100 to-amber-200">
        {image && !imageError ? (
          <Image
            src={image}
            alt={imageAlt || title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-amber-900/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-gray-600 text-xs">Image Placeholder</p>
            </div>
          </div>
        )}
      </div>
      <div className="p-6">
        {title && (
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        )}
        {description && (
          <p className="text-gray-600 mb-4">{description}</p>
        )}
        {price && (
          <p className="text-2xl font-bold text-amber-900">{price}</p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
}

