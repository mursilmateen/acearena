'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import logo from '@/assets/logo.png';
import { useAppStore } from '@/store/appStore';
import { Menu, X, ChevronDown, LogOut, Settings, User, Search, Scale } from 'lucide-react';
import SearchBar from '@/components/shared/SearchBar';
import UploadModal from '@/components/modals/UploadModal';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout, user, comparisonGameIds } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUploadClick = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else {
      setUploadModalOpen(true);
    }
  };

  // Get display name: username if exists, else email
  const displayName = user?.username || user?.email?.split('@')[0] || 'User';

  // Check if nav item is active
  const isActive = (href: string) => pathname === href;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-[70px]">
          
          {/* LEFT: Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0 hover:opacity-80 transition-opacity">
            <Image
              src={logo}
              alt="AceArena"
              width={36}
              height={36}
              className="rounded"
              priority
            />
            <span className="text-lg font-semibold text-black tracking-wide">AceArena</span>
          </Link>

          {/* RIGHT: Pill Navigation, Search, Upload, Actions */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0 ml-auto">
            
            {/* Pill Navigation (Desktop) */}
            <div className="hidden lg:flex items-center gap-1 bg-gray-100 rounded-full px-1 py-1 flex-shrink-0">
              <Link 
                href="/" 
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive('/') 
                    ? 'bg-white text-black shadow-sm' 
                    : 'text-gray-600 hover:bg-white hover:text-black hover:shadow-sm'
                }`}
              >
                Browse
              </Link>
              <Link 
                href="/assets" 
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive('/assets') 
                    ? 'bg-white text-black shadow-sm' 
                    : 'text-gray-600 hover:bg-white hover:text-black hover:shadow-sm'
                }`}
              >
                Assets
              </Link>
              <Link 
                href="/jams" 
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive('/jams') 
                    ? 'bg-white text-black shadow-sm' 
                    : 'text-gray-600 hover:bg-white hover:text-black hover:shadow-sm'
                }`}
              >
                Game Jams
              </Link>
              <Link 
                href="/tags" 
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive('/tags') 
                    ? 'bg-white text-black shadow-sm' 
                    : 'text-gray-600 hover:bg-white hover:text-black hover:shadow-sm'
                }`}
              >
                Tags
              </Link>
              <Link 
                href="/community" 
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive('/community') 
                    ? 'bg-white text-black shadow-sm' 
                    : 'text-gray-600 hover:bg-white hover:text-black hover:shadow-sm'
                }`}
              >
                Community
              </Link>
              <Link 
                href="/about" 
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive('/about') 
                    ? 'bg-white text-black shadow-sm' 
                    : 'text-gray-600 hover:bg-white hover:text-black hover:shadow-sm'
                }`}
              >
                About
              </Link>
            </div>
            
            {/* Search Bar - Rounded Full */}
            <div className="hidden lg:flex flex-shrink-0 bg-gray-100 rounded-full px-4 py-2 hover:bg-white focus-within:bg-white focus-within:shadow-md transition-all duration-200">
              <SearchBar />
            </div>

            {/* Comparison Button */}
            {comparisonGameIds.length > 0 && (
              <Link
                href="/games/compare"
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium hover:bg-purple-200 transition-all duration-200 flex-shrink-0 relative"
              >
                <Scale className="w-4 h-4" />
                <span className="hidden sm:inline">{comparisonGameIds.length}</span>
                {comparisonGameIds.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {comparisonGameIds.length}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <>
                {/* Upload Button - Pill Style */}
                <button
                  onClick={handleUploadClick}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-900 transition-all duration-200 hover:shadow-md flex-shrink-0"
                >
                  Upload
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* User Menu Dropdown */}
                <div className="relative flex-shrink-0" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 transition-all duration-200 flex-shrink-0"
                  >
                    {/* Avatar Circle */}
                    {user?.avatar && (user.avatar.startsWith('blob:') || user.avatar.startsWith('data:')) ? (
                      <img
                        src={user.avatar}
                        alt={displayName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-xs font-bold flex-shrink-0">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Username */}
                    <span className="whitespace-nowrap text-sm font-medium text-black hidden sm:block">
                      {displayName}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-600 flex-shrink-0 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-black">{displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-2 text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full capitalize">
                          {user?.role}
                        </span>
                      </div>

                      {/* Menu Items */}
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                      >
                        <User className="w-4 h-4" />
                        View Profile
                      </Link>
                      <Link
                        href="/profile/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black border-t border-gray-200 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                          router.push('/');
                        }}
                        className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 border-t border-gray-200 transition-colors rounded-b-xl"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link 
                  href="/auth/login" 
                  className="flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium text-black border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium text-white bg-black hover:bg-gray-900 transition-all duration-200 hover:shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-black hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-4 space-y-3">
            
            {/* Mobile Search */}
            <div className="bg-gray-100 rounded-full px-4 py-2 mb-2">
              <SearchBar />
            </div>

            {/* Mobile Nav Links */}
            <Link href="/" className={`block px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive('/') ? 'bg-gray-100 text-black' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}>
              Browse
            </Link>
            <Link href="/assets" className={`block px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive('/assets') ? 'bg-gray-100 text-black' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}>
              Assets
            </Link>
            <Link href="/jams" className={`block px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive('/jams') ? 'bg-gray-100 text-black' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}>
              Game Jams
            </Link>
            <Link href="/tags" className={`block px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive('/tags') ? 'bg-gray-100 text-black' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}>
              Tags
            </Link>
            <Link href="/community" className={`block px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive('/community') ? 'bg-gray-100 text-black' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}>
              Community
            </Link>
            <Link href="/about" className={`block px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive('/about') ? 'bg-gray-100 text-black' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}>
              About
            </Link>

            {/* Mobile Auth Section */}
            {isAuthenticated ? (
              <>
                <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                  {comparisonGameIds.length > 0 && (
                    <Link
                      href="/games/compare"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all duration-200"
                    >
                      <span className="flex items-center gap-2">
                        <Scale className="w-4 h-4" />
                        Compare Games
                      </span>
                      <span className="bg-purple-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                        {comparisonGameIds.length}
                      </span>
                    </Link>
                  )}
                  <button
                    onClick={handleUploadClick}
                    className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-all duration-200"
                  >
                    Upload
                  </button>
                  <Link 
                    href="/profile" 
                    className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-all duration-200"
                  >
                    Profile
                  </Link>
                  <Link 
                    href="/profile/settings" 
                    className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-all duration-200"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      router.push('/');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border-t border-gray-200 pt-3 rounded-lg transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                <Link 
                  href="/auth/login" 
                  className="block px-4 py-2 text-sm font-medium text-black border border-gray-300 rounded-lg text-center hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-4 py-2 text-sm font-medium text-white bg-black rounded-lg text-center hover:bg-gray-900 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <UploadModal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} />
    </nav>
  );
}
