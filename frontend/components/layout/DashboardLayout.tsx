'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { Menu, X } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function DashboardLayout({
  children,
  activeSection,
  onSectionChange,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const { user } = useAppStore();
  const userRole = user?.role || 'player';

  const navItems = userRole === 'developer'
    ? [
        { id: 'overview', label: 'Overview' },
        { id: 'games', label: 'My Games' },
        { id: 'assets', label: 'My Assets' },
        { id: 'jams', label: 'My Jams' },
        { id: 'collections', label: 'My Collections', action: () => router.push('/dashboard/collections') },
        { id: 'upload-game', label: 'Upload Game', action: () => router.push('/upload') },
        { id: 'upload-asset', label: 'Upload Asset', action: () => router.push('/upload-asset') },
        { id: 'settings', label: 'Settings' },
      ]
    : [
        { id: 'overview', label: 'Overview' },
        { id: 'activity', label: 'My Activity' },
        { id: 'jams', label: 'Joined Jams' },
        { id: 'wishlist', label: 'My Wishlist', action: () => router.push('/dashboard/wishlist') },
        { id: 'collections', label: 'My Collections', action: () => router.push('/dashboard/collections') },
        { id: 'settings', label: 'Settings' },
      ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-white rounded border border-gray-200"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-56 h-screen bg-white border-r border-gray-200 p-6 transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-black uppercase tracking-wider">
            Dashboard
          </h2>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  onSectionChange(item.id);
                }
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeSection === item.id
                  ? 'bg-gray-200 text-black font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-6 left-6 right-6 border-t border-gray-200 pt-4">
          <Link
            href="/profile"
            className="block text-sm text-gray-600 hover:text-black transition-colors mb-2"
          >
            View Public Profile
          </Link>
          <button
            onClick={() => router.push('/')}
            className="block w-full text-left text-sm text-gray-600 hover:text-black transition-colors"
          >
            Back to Home
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto mt-16 md:mt-0">
        <div className="p-8 md:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
