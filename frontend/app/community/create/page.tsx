'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import apiClient from '@/lib/api';

export default function CreatePostPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppStore();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Game Development' as 'Game Development' | 'Help' | 'Feedback' | 'Collaboration',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-black mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please log in to create a post</p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (formData.title.length > 150) {
      newErrors.title = 'Title must be less than 150 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    } else if (formData.content.length > 5000) {
      newErrors.content = 'Content must be less than 5000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post('/posts', formData);

      if (response.data?.success) {
        alert('Post created successfully!');
        router.push('/community');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create post';
      setErrors({ form: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Community
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-black mb-2">Create Discussion Post</h1>
          <p className="text-gray-600">Share your ideas, ask for help, or provide feedback to the community</p>
        </div>

        {/* Error Message */}
        {errors.form && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{errors.form}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Category */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <label className="block text-sm font-semibold text-black mb-3">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="Game Development">Game Development</option>
              <option value="Help">Help</option>
              <option value="Feedback">Feedback</option>
              <option value="Collaboration">Collaboration</option>
            </select>
          </div>

          {/* Title */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <label className="block text-sm font-semibold text-black mb-3">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., How do I optimize my game's performance?"
              className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 transition-ring ${
                errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'
              }`}
            />
            {errors.title && <p className="text-red-600 text-sm mt-2">{errors.title}</p>}
            <p className="text-xs text-gray-500 mt-2">{formData.title.length} / 150 characters</p>
          </div>

          {/* Content */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <label className="block text-sm font-semibold text-black mb-3">
              Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Share your thoughts, experiences, or questions..."
              rows={8}
              className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 transition-ring resize-none ${
                errors.content ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'
              }`}
            />
            {errors.content && <p className="text-red-600 text-sm mt-2">{errors.content}</p>}
            <p className="text-xs text-gray-500 mt-2">{formData.content.length} / 5000 characters</p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-black hover:bg-gray-800 text-white font-semibold py-2.5 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Post'}
            </Button>
            <Link href="/community">
              <Button
                type="button"
                className="border border-gray-300 bg-white hover:bg-gray-50 text-black font-semibold py-2.5 px-8"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
