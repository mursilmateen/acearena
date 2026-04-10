'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/store/appStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAppStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Invalid email or password';
      setError(errorMessage);
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
          Welcome Back
        </h1>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
          Sign in to your account
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
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-slate-600 dark:text-slate-400 text-sm mt-6">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
          >
            Create one
          </Link>
        </p>

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p className="text-center text-xs text-slate-500 dark:text-slate-500 mb-4">
            Demo Account
          </p>
          <p className="text-center text-sm text-slate-600 dark:text-slate-400 space-y-1">
            <div>Email: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">dev@example.com</code></div>
            <div>Password: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">password123</code></div>
          </p>
        </div>
      </Card>
    </div>
  );
}
