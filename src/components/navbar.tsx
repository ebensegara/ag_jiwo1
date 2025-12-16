'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 dark:bg-black/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#756657] rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Jiwo.AI</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/auth"
              className="text-gray-700 dark:text-gray-300 hover:text-[#756657] dark:hover:text-[#756657] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth"
              className="px-4 py-2 bg-[#756657] text-white rounded-lg hover:bg-[#756657]/90 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
