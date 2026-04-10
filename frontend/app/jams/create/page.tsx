'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { X, Plus, ArrowLeft } from 'lucide-react';

export default function CreateGameJamPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppStore();
  const [formData, setFormData] = useState({
    title: '',
    theme: '',
    description: '',
    startDate: '',
    deadline: '',
    rules: [''],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-black mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please log in to create a game jam</p>
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
      newErrors.title = 'Jam title is required';
    }
    if (!formData.theme.trim()) {
      newErrors.theme = 'Jam theme is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    }
    if (formData.startDate && formData.deadline) {
      if (new Date(formData.deadline) <= new Date(formData.startDate)) {
        newErrors.deadline = 'Deadline must be after start date';
      }
    }
    if (formData.rules.every((rule) => !rule.trim())) {
      newErrors.rules = 'At least one rule is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  const handleRuleChange = (index: number, value: string) => {
    const newRules = [...formData.rules];
    newRules[index] = value;
    setFormData((prev) => ({
      ...prev,
      rules: newRules,
    }));
  };

  const addRule = () => {
    setFormData((prev) => ({
      ...prev,
      rules: [...prev.rules, ''],
    }));
  };

  const removeRule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { apiClient } = await import('@/lib/api');
      
      const payload = {
        ...formData,
        rules: formData.rules.filter((r) => r.trim()), // Only include non-empty rules
      };

      const response = await apiClient.post('/jams', payload);

      if (response.data?.success) {
        alert('Game Jam created successfully!');
        router.push(`/jams/${response.data.data._id}`);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create game jam';
      setErrors({ form: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDateMinValue = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/jams"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jams
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-black mb-2">Create Game Jam</h1>
          <p className="text-gray-600">Set up a new game jam and invite developers to participate</p>
        </div>

        {/* Error Message */}
        {errors.form && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{errors.form}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Jam Title */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <label className="block text-sm font-semibold text-black mb-3">
              Jam Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Summer Game Jam 2026"
              className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 transition-ring ${
                errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'
              }`}
            />
            {errors.title && <p className="text-red-600 text-sm mt-2">{errors.title}</p>}
          </div>

          {/* Theme */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <label className="block text-sm font-semibold text-black mb-3">
              Jam Theme
            </label>
            <input
              type="text"
              name="theme"
              value={formData.theme}
              onChange={handleChange}
              placeholder="e.g., Mystery & Magic"
              className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 transition-ring ${
                errors.theme ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'
              }`}
            />
            {errors.theme && <p className="text-red-600 text-sm mt-2">{errors.theme}</p>}
          </div>

          {/* Description */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <label className="block text-sm font-semibold text-black mb-3">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the jam theme, guidelines, and what developers should create..."
              rows={5}
              className={`w-full border rounded-lg px-4 py-2.5 resize-none focus:outline-none focus:ring-2 transition-ring ${
                errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'
              }`}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-600">{formData.description.length} characters</p>
              {errors.description && <p className="text-red-600 text-sm">{errors.description}</p>}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <label className="block text-sm font-semibold text-black mb-3">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                min={getDateMinValue()}
                className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 transition-ring ${
                  errors.startDate ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'
                }`}
              />
              {errors.startDate && <p className="text-red-600 text-sm mt-2">{errors.startDate}</p>}
            </div>

            {/* Deadline */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <label className="block text-sm font-semibold text-black mb-3">
                Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                min={getDateMinValue()}
                className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 transition-ring ${
                  errors.deadline ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'
                }`}
              />
              {errors.deadline && <p className="text-red-600 text-sm mt-2">{errors.deadline}</p>}
            </div>
          </div>

          {/* Rules */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-black">
                Jam Rules
              </label>
              <button
                type="button"
                onClick={addRule}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-black transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Rule
              </button>
            </div>

            <div className="space-y-3">
              {formData.rules.map((rule, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => handleRuleChange(index, e.target.value)}
                    placeholder={`Rule ${index + 1}`}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black transition-ring"
                  />
                  {formData.rules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRule(index)}
                      className="px-3 py-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {errors.rules && <p className="text-red-600 text-sm mt-2">{errors.rules}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? 'Creating...' : 'Create Game Jam'}
            </button>
            <Link
              href="/jams"
              className="px-6 py-3 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
