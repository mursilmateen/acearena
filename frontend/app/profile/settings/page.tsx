'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store/appStore';
import { useProfile } from '@/hooks/useBackendApi';
import { useToast } from '@/hooks/useToast';
import { Upload, Save, Check, AlertCircle } from 'lucide-react';
import { validateBio, validateUrl } from '@/lib/profileValidation';
import Breadcrumbs from '@/components/shared/Breadcrumbs';

export default function ProfileSettingsPage() {
  const { user } = useAppStore();
  const { updateProfile, uploadAvatar, loading } = useProfile();
  const { success, error: errorToast } = useToast();
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Form state
  const [username, setUsername] = useState(user?.username || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [bio, setBio] = useState(user?.bio || '');
  const [github, setGithub] = useState(user?.socialLinks?.github || '');
  const [linkedin, setLinkedin] = useState(user?.socialLinks?.linkedin || '');
  const [twitter, setTwitter] = useState(user?.socialLinks?.twitter || '');
  const [website, setWebsite] = useState(user?.socialLinks?.website || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-4">Not Authenticated</h1>
          <p className="text-gray-600 mb-6">Please log in to edit your profile.</p>
          <Link 
            href="/login"
            className="inline-block px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleBioChange = (value: string) => {
    if (value.length <= 150) {
      setBio(value);
      if (errors.bio) {
        setErrors({ ...errors, bio: '' });
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const bioValidation = validateBio(bio);
    if (!bioValidation.valid) {
      newErrors.bio = bioValidation.error || '';
    }

    if (github && !validateUrl(github)) {
      newErrors.github = 'Please enter a valid GitHub URL';
    }

    if (linkedin && !validateUrl(linkedin)) {
      newErrors.linkedin = 'Please enter a valid LinkedIn URL';
    }

    if (twitter && !validateUrl(twitter)) {
      newErrors.twitter = 'Please enter a valid Twitter URL';
    }

    if (website && !validateUrl(website)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setSuccessMessage('');

    try {
      // Update profile with bio and social links
      await updateProfile({
        username,
        bio,
        socialLinks: {
          github,
          linkedin,
          twitter,
          website,
        },
      });

      success('Profile updated successfully!');
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      errorToast('Failed to save profile');
      setErrors({ form: 'Failed to save profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, avatar: 'Please upload an image file' });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, avatar: 'Image must be less than 5MB' });
        return;
      }
      
      // Create object URL for instant preview
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      
      try {
        // Upload to server
        await uploadAvatar(file);
        success('Avatar updated successfully!');
        setSuccessMessage('Avatar updated successfully!');
        if (errors.avatar) {
          setErrors({ ...errors, avatar: '' });
        }
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        errorToast('Failed to upload avatar');
        setErrors({ ...errors, avatar: 'Failed to upload avatar' });
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Get avatar display - prioritize preview, then stored avatar, then fallback
  const getAvatarDisplay = () => {
    if (avatarPreview) {
      return (
        <img
          src={avatarPreview}
          alt={username}
          className="w-full h-full object-cover"
        />
      );
    }
    
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-700 text-4xl font-bold">
        {username.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Profile', href: '/profile' },
              { label: 'Settings' },
            ]}
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Edit Profile</h1>
          <p className="text-gray-600">Update your profile information and preferences</p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Avatar Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h2 className="text-lg font-semibold text-black mb-6">Profile Picture</h2>
            <div className="flex items-start gap-6">
              {/* Avatar Preview */}
              <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0 border border-gray-300">
                {getAvatarDisplay()}
              </div>
              
              {/* Upload Control */}
              <div className="flex-1 flex flex-col justify-center">
                <button 
                  type="button" 
                  onClick={triggerFileInput}
                  className="w-fit px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Change Image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-600 mt-3">PNG, JPG up to 5MB</p>
                {errors.avatar && <p className="text-xs text-red-600 mt-2">{errors.avatar}</p>}
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h2 className="text-lg font-semibold text-black mb-6">Basic Information</h2>
            <div className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black transition-ring"
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-600 mt-2">Email cannot be changed</p>
              </div>

              {/* Role (Read-only) */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Account Type</label>
                <input
                  type="text"
                  value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => handleBioChange(e.target.value)}
                  placeholder="Tell us about yourself"
                  maxLength={150}
                  rows={4}
                  className={`w-full border rounded-lg px-4 py-2.5 resize-none focus:outline-none focus:ring-2 transition-ring ${
                    errors.bio ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'
                  }`}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-600">{bio.length}/150 characters</p>
                  {errors.bio && <p className="text-xs text-red-600 font-medium">{errors.bio}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h2 className="text-lg font-semibold text-black mb-6">Social Links</h2>
            <p className="text-sm text-gray-600 mb-6">Add your social profiles (optional)</p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">GitHub</label>
                <input
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/username"
                  className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 transition-ring ${
                    errors.github ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'
                  }`}
                />
                {errors.github && <p className="text-xs text-red-600 mt-1 font-medium">{errors.github}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">LinkedIn</label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 transition-ring ${
                    errors.linkedin ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'
                  }`}
                />
                {errors.linkedin && <p className="text-xs text-red-600 mt-1 font-medium">{errors.linkedin}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Twitter</label>
                <input
                  type="url"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="https://twitter.com/username"
                  className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 transition-ring ${
                    errors.twitter ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'
                  }`}
                />
                {errors.twitter && <p className="text-xs text-red-600 mt-1 font-medium">{errors.twitter}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 transition-ring ${
                    errors.website ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'
                  }`}
                />
                {errors.website && <p className="text-xs text-red-600 mt-1 font-medium">{errors.website}</p>}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isSaving ? 'Saving...' : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
            <Link 
              href="/profile"
              className="px-6 py-3 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </Link>
          </div>

          {/* Messages */}
          {successMessage && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm font-medium flex items-center gap-2">
                <Check className="w-4 h-4" />
                {successMessage}
              </p>
            </div>
          )}
          {errors.form && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.form}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
