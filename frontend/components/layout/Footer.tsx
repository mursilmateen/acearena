'use client';

import React from 'react';
import Link from 'next/link';
import { GAME_UPLOAD_COMING_SOON } from '@/lib/launchConfig';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-8">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-black mb-4">
              About AceArena
            </h3>
            <p className="text-xs text-gray-600">
              The platform for independent game developers to share and showcase their creations.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-black mb-4">
              Browse
            </h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <Link href="/" className="hover:text-black transition-colors">
                  All Games
                </Link>
              </li>
              <li>
                <Link href="/?price=free" className="hover:text-black transition-colors">
                  Free Games
                </Link>
              </li>
              <li>
                <Link href="/?sort=trending" className="hover:text-black transition-colors">
                  Trending
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-black transition-colors">
                  Collections
                </a>
              </li>
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h3 className="text-sm font-semibold text-black mb-4">
              For Developers
            </h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <Link href="/upload" className="hover:text-black transition-colors">
                  {GAME_UPLOAD_COMING_SOON ? 'Upload Game (Coming Soon)' : 'Upload Game'}
                </Link>
              </li>
              <li>
                <Link href="/upload-asset" className="hover:text-black transition-colors">
                  Upload Asset Package
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-black transition">
                  Devlog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black transition">
                  Community
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black transition">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-black mb-4">
              Legal
            </h3>
            <ul className="space-y-2 text-xs text-gray-500">
              <li>
                <a href="#" className="hover:text-black transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black transition">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-xs text-gray-500 mb-4 sm:mb-0">
            © {currentYear} AceArena. All rights reserved.
          </div>
          <div className="flex gap-6 text-xs text-gray-500">
            <a href="#" className="hover:text-black transition">
              Twitter
            </a>
            <a href="#" className="hover:text-black transition">
              Discord
            </a>
            <a href="#" className="hover:text-black transition">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
