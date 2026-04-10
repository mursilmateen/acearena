'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import DashboardMyGames from '@/components/dashboard/DashboardMyGames';
import DashboardMyAssets from '@/components/dashboard/DashboardMyAssets';
import DashboardSettings from '@/components/dashboard/DashboardSettings';
import UpgradeModal from '@/components/modals/UpgradeModal';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppStore();
  const [activeSection, setActiveSection] = useState('overview');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const userRole = user?.role || 'player';

  // Access Control
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            Please login to access your dashboard
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Render Content Based on Active Section
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview onUpgradeClick={() => setShowUpgradeModal(true)} />;
      case 'games':
        return <DashboardMyGames />;
      case 'assets':
        return <DashboardMyAssets />;
      case 'activity':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">My Activity</h1>
              <p className="text-gray-500">Track your gameplay and interactions</p>
            </div>
            <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
              <p className="text-gray-600">No activity yet. Start playing games!</p>
            </div>
          </div>
        );
      case 'jams':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Joined Jams</h1>
              <p className="text-gray-500">Jams you've participated in</p>
            </div>
            <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
              <p className="text-gray-600">You haven't joined any jams yet</p>
            </div>
          </div>
        );
      case 'settings':
        return <DashboardSettings />;
      default:
        return <DashboardOverview onUpgradeClick={() => setShowUpgradeModal(true)} />;
    }
  };

  return (
    <>
      <DashboardLayout activeSection={activeSection} onSectionChange={setActiveSection}>
        {renderContent()}
      </DashboardLayout>
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </>
  );
}
