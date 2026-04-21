'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/store/appStore';
import { validateUsername, validateEmail } from '@/lib/profileValidation';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, clearCorruptedData } = useAppStore();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'player' | 'developer'>('player');
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');

  const getRegistrationErrorMessage = (error: unknown): string => {
    const fallback = 'Registration failed. Please try again.';
    const errorWithResponse = error as {
      response?: {
        status?: number;
        data?: {
          error?: string;
          message?: string;
        };
      };
      message?: string;
    };

    const apiError = errorWithResponse.response?.data;

    if (typeof apiError?.error === 'string' && apiError.error.trim()) {
      return apiError.error;
    }

    if (typeof apiError?.message === 'string' && apiError.message.trim()) {
      return apiError.message;
    }

    if (errorWithResponse.response?.status === 429) {
      return 'Too many registration attempts. Please wait a few minutes and try again.';
    }

    if (typeof errorWithResponse.message === 'string' && errorWithResponse.message.trim()) {
      return errorWithResponse.message;
    }

    return fallback;
  };

  // Real-time username validation
  const handleUsernameChange = (value: string) => {
    setUsername(value);
    if (value.trim().length > 0) {
      const validation = validateUsername(value);
      setUsernameError(validation.error || '');
    } else {
      setUsernameError('');
    }
  };

  const handleClearData = () => {
    if (confirm('This will clear all local data. Continue?')) {
      clearCorruptedData();
      setEmail('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setError('');
      setUsernameError('');
      alert('Data cleared! You can now register a new account.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !username || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email).valid) {
      setError('Please enter a valid email address');
      return;
    }

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      setError(usernameValidation.error || 'Invalid username');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await register(email, username, password, role);
      router.push('/dashboard');
    } catch (err) {
      setError(getRegistrationErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-xl font-bold text-black">
            AceArena
          </span>
        </Link>
      </div>

      <Card className="p-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">
          Create Your Account
        </h1>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
          Join the AceArena community
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm font-medium">
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Username
            </label>
            <Input
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="Choose a username (3-20 characters)"
              required
              className={usernameError ? 'border-red-500' : ''}
            />
            {usernameError && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{usernameError}</p>
            )}
            {!usernameError && username && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Username available</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Account Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" style={{backgroundColor: role === 'player' ? 'rgba(0,0,0,0.05)' : 'transparent'}}>
                <input
                  type="radio"
                  name="role"
                  value="player"
                  checked={role === 'player'}
                  onChange={(e) => setRole(e.target.value as 'player' | 'developer')}
                  className="w-4 h-4 text-black"
                />
                <div className="ml-3">
                  <p className="font-medium text-slate-900 dark:text-white text-sm">Player</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Browse and download games</p>
                </div>
              </label>

              <label className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" style={{backgroundColor: role === 'developer' ? 'rgba(0,0,0,0.05)' : 'transparent'}}>
                <input
                  type="radio"
                  name="role"
                  value="developer"
                  checked={role === 'developer'}
                  onChange={(e) => setRole(e.target.value as 'player' | 'developer')}
                  className="w-4 h-4 text-black"
                />
                <div className="ml-3">
                  <p className="font-medium text-slate-900 dark:text-white text-sm">Developer</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Upload and sell games & assets</p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              At least 8 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Confirm Password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-slate-600 dark:text-slate-400 text-sm mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={handleClearData}
            className="w-full text-center text-xs text-slate-500 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            Having issues? Clear data and start fresh
          </button>
        </div>
      </Card>
    </div>
  );
}
