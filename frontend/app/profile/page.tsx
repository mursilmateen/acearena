'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { useProfile } from '@/hooks/useBackendApi';
import { useToast } from '@/hooks/useToast';
import { Mail, Calendar, Edit, Code, Briefcase, ArrowRight, Check, Loader } from 'lucide-react';
import Breadcrumbs from '@/components/shared/Breadcrumbs';

export default function ProfilePage() {
  const { user, upgradeToDeveLoper } = useAppStore();
  const { getProfile, loading } = useProfile();
  const router = useRouter();
  const { success } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Optionally refresh profile data from API
    if (user) {
      loadProfileData();
    } else {
      setIsLoading(false);
    }
  }, [user?.email]);

  const loadProfileData = async () => {
    try {
      await getProfile();
    } catch (error) {
      // Profile already in store, just use that
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeToDeveloper = async () => {
    upgradeToDeveLoper();
    success('Welcome to Developer Program!', 'You can now upload games and assets');
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-4">Not Authenticated</h1>
          <p className="text-gray-600 mb-6">Please log in to view your profile.</p>
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Dashboard', href: '/dashboard' },
              { label: user.username },
            ]}
          />
        </div>

        {/* Profile Header Section */}
        <div className="mb-12">
          {/* Cover Background */}
          <div className="h-32 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg relative" />

          {/* Profile Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 relative z-10 -mt-16">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
              {/* Left: Avatar & Info */}
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center border-4 border-white shadow-md">
                  {user.avatar && (user.avatar.startsWith('blob:') || user.avatar.startsWith('data:')) ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl font-bold text-gray-600">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-black mb-2">{user.username}</h1>
                  <p className="text-gray-600 mb-4">{user.email}</p>
                  
                  {/* Role Badge */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-black text-white text-xs font-semibold rounded-full capitalize">
                      {user.role}
                    </span>
                  </div>

                  {/* Bio if exists */}
                  {user.bio && (
                    <p className="text-gray-700 max-w-md text-sm leading-relaxed">
                      {user.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Edit Button */}
              <Link href="/profile/settings" className="flex-shrink-0">
                <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* User Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Joined Date */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Member Since</h3>
            </div>
            <p className="text-2xl font-bold text-black">{formatDate(user.joinedDate)}</p>
          </div>

          {/* Account Status */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Check className="w-5 h-5 text-green-600" />
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Account Status</h3>
            </div>
            <p className="text-2xl font-bold text-black">Active</p>
          </div>
        </div>

        {/* Developer Stats - Only for Developers */}
        {user.role === 'developer' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Briefcase className="w-5 h-5 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Games Uploaded</h3>
              </div>
              <p className="text-3xl font-bold text-black">{user.gamesUploaded || 0}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Code className="w-5 h-5 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Assets Uploaded</h3>
              </div>
              <p className="text-3xl font-bold text-black">{user.assetsUploaded || 0}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Code className="w-5 h-5 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Jams Joined</h3>
              </div>
              <p className="text-3xl font-bold text-black">{user.jamsJoined || 0}</p>
            </div>
          </div>
        )}

        {/* Developer Upgrade Section - Only for Players */}
        {user.role === 'player' && (
          <div className="bg-white border-2 border-gray-200 rounded-lg p-8 md:p-10">
            <div className="flex flex-col md:flex-row gap-8 md:items-center md:justify-between">
              {/* Left: Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Code className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold text-black">Become a Developer</h3>
                </div>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Unlock the ability to upload and sell your games and assets. Reach a global audience of game enthusiasts and monetize your creations with our developer program.
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[
                    'Upload Games',
                    'Sell Assets',
                    'Earn Revenue',
                    'Analytics Dashboard',
                    'Community Access',
                    'Priority Support'
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-black flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Button */}
              <div className="flex-shrink-0">
                <button 
                  onClick={handleUpgradeToDeveloper}
                  className="w-full md:w-auto px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  Upgrade Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
