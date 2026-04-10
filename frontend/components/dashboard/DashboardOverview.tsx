'use client';

import React from 'react';
import { useAppStore } from '@/store/appStore';

interface DashboardOverviewProps {
  onUpgradeClick?: () => void;
}

export default function DashboardOverview({ onUpgradeClick }: DashboardOverviewProps) {
  const { user } = useAppStore();
  const userRole = user?.role || 'player';

  const stats = userRole === 'developer'
    ? [
        { label: 'Games Uploaded', value: user?.gamesUploaded ?? 0 },
        { label: 'Assets Uploaded', value: user?.assetsUploaded ?? 0 },
        { label: 'Jams Joined', value: user?.jamsJoined ?? 0 },
      ]
    : [
        { label: 'Games Played', value: 0 },
        { label: 'Joined Jams', value: user?.jamsJoined ?? 0 },
        { label: 'Comments Made', value: 0 },
      ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-black mb-2">
          Welcome back, {user?.username}
        </h1>
        <p className="text-gray-600">
          Here's an overview of your account and recent activity
        </p>
      </div>

      {/* User Info */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-black mb-4">
          Account Info
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600 text-sm">Username</span>
            <span className="font-medium text-black text-sm">{user?.username}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600 text-sm">Email</span>
            <span className="font-medium text-black text-sm">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600 text-sm">Role</span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-md ${
              userRole === 'developer'
                ? 'bg-black text-white'
                : 'bg-gray-200 text-gray-800'
            }`}>
              {userRole === 'developer' ? 'Developer' : 'Player'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200"
          >
            <p className="text-xs text-gray-600 mb-2 uppercase font-semibold">{stat.label}</p>
            <p className="text-3xl font-semibold text-black">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Member Since */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-black mb-4">
          Member Since
        </h2>
        <p className="text-gray-600">
          {user?.joinedDate
            ? new Date(user.joinedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : 'Recently joined'}
        </p>
      </div>

      {/* Upgrade Section for Players */}
      {userRole === 'player' && (
        <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold text-black mb-3">
            Unlock Developer Features
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Upgrade to a Developer account to start uploading games and assets to AceArena
          </p>
          <button
            onClick={onUpgradeClick}
            className="px-6 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Upgrade to Developer
          </button>
        </div>
      )}
    </div>
  );
}
