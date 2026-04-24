'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { useRouter } from 'next/navigation';

export default function GameRegistrationPage() {
  const router = useRouter();
  const [step, setStep] = useState<'login' | 'register' | 'create'>('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  
  // Game state
  const [gameTitle, setGameTitle] = useState('');
  const [gameDesc, setGameDesc] = useState('');
  const [gameTags, setGameTags] = useState('');
  const [gamePrice, setGamePrice] = useState('0');
  const [gameFileUrl, setGameFileUrl] = useState('');
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          role: 'developer'
        })
      });

      if (res.ok) {
        setMessage('✅ Account created! Now logging in...');
        setTimeout(() => handleLogin(new Event('submit') as any), 1500);
      } else {
        const err = await res.json();
        setMessage(`❌ ${err.error || 'Registration failed'}`);
      }
    } catch (error) {
      setMessage('❌ Network error during registration');
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        setToken(data.data.token);
        setStep('create');
        setMessage('✅ Logged in! Ready to create games.');
      } else {
        const err = await res.json();
        setMessage(`❌ Login failed: ${err.error}`);
      }
    } catch (error) {
      setMessage('❌ Network error during login');
    }
    setLoading(false);
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: gameTitle,
          description: gameDesc,
          tags: gameTags.split(',').map(t => t.trim()),
          price: parseFloat(gamePrice),
          fileUrl: gameFileUrl
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessage(`✅ Game "${gameTitle}" created successfully!`);
        // Reset form
        setGameTitle('');
        setGameDesc('');
        setGameTags('');
        setGamePrice('0');
        setGameFileUrl('');
      } else {
        const err = await res.json();
        setMessage(`❌ Failed to create game: ${err.error}`);
      }
    } catch (error) {
      setMessage('❌ Network error while creating game');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎮 Game Registration</h1>
          <p className="text-gray-400">Create and register your games on AceArena</p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-gray-800 border-l-4 border-purple-500">
            <p className="text-white whitespace-pre-wrap">{message}</p>
          </div>
        )}

        {/* Login/Register Form */}
        {!token ? (
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-800 mb-6">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setStep('login')}
                className={`flex-1 py-2 px-4 rounded font-semibold transition ${
                  step === 'login'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setStep('register')}
                className={`flex-1 py-2 px-4 rounded font-semibold transition ${
                  step === 'register'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={step === 'login' ? handleLogin : handleRegister}>
              {step === 'register' && (
                <div className="mb-4">
                  <label className="block text-white font-semibold mb-2">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-purple-500 outline-none"
                    placeholder="Choose a username"
                    required
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-white font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-purple-500 outline-none"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-purple-500 outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-purple-600 text-white font-semibold rounded hover:bg-purple-700 disabled:opacity-50 transition"
              >
                {loading ? 'Processing...' : step === 'login' ? 'Login' : 'Register'}
              </button>
            </form>
          </div>
        ) : null}

        {/* Game Creation Form */}
        {token && (
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-6">Create a New Game</h2>

            <form onSubmit={handleCreateGame}>
              <div className="mb-4">
                <label className="block text-white font-semibold mb-2">Game Title *</label>
                <input
                  type="text"
                  value={gameTitle}
                  onChange={(e) => setGameTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-purple-500 outline-none"
                  placeholder="e.g., Falling Crown"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-white font-semibold mb-2">Description *</label>
                <textarea
                  value={gameDesc}
                  onChange={(e) => setGameDesc(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-purple-500 outline-none h-24 resize-none"
                  placeholder="Describe your game..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Tags</label>
                  <input
                    type="text"
                    value={gameTags}
                    onChange={(e) => setGameTags(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-purple-500 outline-none"
                    placeholder="action, adventure, puzzle"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Price</label>
                  <input
                    type="number"
                    value={gamePrice}
                    onChange={(e) => setGamePrice(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-purple-500 outline-none"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">File URL *</label>
                <input
                  type="url"
                  value={gameFileUrl}
                  onChange={(e) => setGameFileUrl(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-purple-500 outline-none"
                  placeholder="http://localhost:3000/games/falling-crown"
                  required
                />
                <p className="text-gray-400 text-sm mt-2">Where players can access/download your game</p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-purple-600 text-white font-semibold rounded hover:bg-purple-700 disabled:opacity-50 transition"
                >
                  {loading ? 'Creating...' : 'Create Game'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setToken('');
                    setStep('login');
                    setEmail('');
                    setPassword('');
                  }}
                  className="flex-1 py-2 px-4 bg-gray-800 text-white font-semibold rounded hover:bg-gray-700 transition"
                >
                  Logout
                </button>
              </div>
            </form>

            {/* Quick Links */}
            <div className="mt-8 p-4 bg-blue-900 rounded border border-blue-700">
              <h3 className="text-white font-semibold mb-2">Quick Links</h3>
              <ul className="text-blue-100 text-sm space-y-1">
                <li>• Falling Crown: <code className="bg-gray-800 px-2 py-1 rounded">http://localhost:3000/games/falling-crown</code></li>
                <li>• Space Run: <code className="bg-gray-800 px-2 py-1 rounded">http://localhost:3000/games/space-run</code></li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
