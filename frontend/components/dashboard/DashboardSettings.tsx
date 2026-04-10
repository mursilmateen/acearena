'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { useProfile } from '@/hooks/useBackendApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function DashboardSettings() {
  const { user } = useAppStore();
  const { updateProfile, loading } = useProfile();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    bio: user?.bio || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      toast.success('Settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  if (!user) {
    return <div className="text-center py-12">Please log in to access settings</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black mb-2">
          Settings
        </h1>
        <p className="text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Account Settings */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-md">
        <h2 className="text-lg font-semibold text-black mb-6">
          Account Settings
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <Input
              type="text"
              name="username"
              value={user.username}
              disabled
              className="bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Username cannot be changed
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white hover:bg-gray-800 mt-6"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>

      {/* Account Info */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-black mb-6">
          Account Information
        </h2>

        <div className="space-y-4">
          <div className="py-3 border-b border-gray-200">
            <p className="text-sm text-gray-600">Account Type</p>
            <p className="text-base font-semibold text-black mt-1">
              {user.role === 'developer' ? 'Developer Account' : 'Player Account'}
            </p>
          </div>

          <div className="py-3 border-b border-gray-200">
            <p className="text-sm text-gray-600">Member Since</p>
            <p className="text-base font-semibold text-black mt-1">
              {USER_PROFILE.joinedDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="py-3">
            <p className="text-sm text-gray-600">Bio</p>
            <p className="text-base text-gray-700 mt-1">
              {USER_PROFILE.bio}
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
        <h2 className="text-lg font-semibold text-red-900 mb-4">
          Danger Zone
        </h2>
        <p className="text-sm text-red-800 mb-4">
          These actions cannot be undone
        </p>
        <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}
