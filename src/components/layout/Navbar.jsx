'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-serif font-bold text-amber-900">
              Zulu Jewels
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-amber-900 transition-colors font-medium">
              Home
            </Link>
            <Link href="/collections" className="text-gray-700 hover:text-amber-900 transition-colors font-medium">
              Collections
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-amber-900 transition-colors font-medium">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-amber-900 transition-colors font-medium">
              Contact
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-amber-900"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-gray-100">
            <Link href="/" className="block text-gray-700 hover:text-amber-900 transition-colors font-medium">
              Home
            </Link>
            <Link href="/collections" className="block text-gray-700 hover:text-amber-900 transition-colors font-medium">
              Collections
            </Link>
            <Link href="/about" className="block text-gray-700 hover:text-amber-900 transition-colors font-medium">
              About
            </Link>
            <Link href="/contact" className="block text-gray-700 hover:text-amber-900 transition-colors font-medium">
              Contact
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

