'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { COMMUNITY_POSTS, TRENDING_TOPICS, ACTIVE_DEVELOPERS, GAME_JAMS } from '@/data/communityData';
import { MessageCircle, TrendingUp, Users, Trophy, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api';
import { useAppStore } from '@/store/appStore';

interface Post {
  _id: string;
  title: string;
  content: string;
  category: 'Game Development' | 'Help' | 'Feedback' | 'Collaboration';
  userId: {
    _id: string;
    username: string;
    avatar?: string;
  };
  replies: number;
  createdAt: string;
}

interface TrendingTopic {
  title: string;
  posts: number;
}

interface Developer {
  _id?: string;
  username: string;
  avatar?: string;
  postsCount: number;
  specialty?: string;
}

export default function CommunityPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<'All' | 'Game Development' | 'Help' | 'Feedback' | 'Collaboration'>('All');
  const [posts, setPosts] = useState<Post[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [topDevelopers, setTopDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        // Fetch posts
        const postsRes = await apiClient.get('/posts', {
          params: {
            category: activeCategory === 'All' ? undefined : activeCategory,
            limit: 50,
          },
        });
        if (postsRes.data?.success) {
          setPosts(postsRes.data.data);
        }

        // Fetch trending topics
        const topicsRes = await apiClient.get('/posts/trending/topics');
        if (topicsRes.data?.success) {
          setTrendingTopics(topicsRes.data.data);
        }

        // Fetch top developers
        const devsRes = await apiClient.get('/posts/trending/developers');
        if (devsRes.data?.success) {
          setTopDevelopers(devsRes.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch community data:', error);
        // Fallback to mock data
        setPosts(COMMUNITY_POSTS as any);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, [activeCategory]);

  const handleTopicClick = (topicTitle: string) => {
    // Filter posts by the clicked topic (category)
    setActiveCategory(topicTitle as any);
  };

  const handleDeveloperClick = (username: string) => {
    // Navigate to developer profile page
    router.push(`/profile/${username}`);
  };

  const handleJamClick = (jamId: string) => {
    // Navigate to jam details page
    router.push(`/jams/${jamId}`);
  };

  const handlePostClick = (postId: string) => {
    // Navigate to post detail/discussion page
    router.push(`/community/${postId}`);
  };

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    router.push('/community/create');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex bg-white min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:block w-72 border-r border-gray-200 sticky top-16 h-[calc(100vh-64px)] bg-white overflow-hidden flex flex-col">
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Categories Filter */}
          <div>
            <h3 className="text-sm font-semibold text-black mb-3">
              Categories
            </h3>
            <nav className="space-y-2">
              {['All', 'Game Development', 'Help', 'Feedback', 'Collaboration'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat as any)}
                  className={`block w-full text-left px-0 py-1.5 text-sm transition-colors leading-snug ${
                    activeCategory === cat
                      ? 'text-black font-semibold underline'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>

          {/* Trending Topics */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-semibold text-black">
                Trending Topics
              </h3>
            </div>
            <div className="space-y-2">
              {(trendingTopics.length > 0 ? trendingTopics : TRENDING_TOPICS).map((topic) => (
                <button
                  key={typeof topic === 'object' && 'title' in topic ? topic.title : (topic as any).id}
                  onClick={() => handleTopicClick((topic as any).title)}
                  className="block w-full text-left px-3 py-2 rounded-md text-xs bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="font-medium text-gray-900">{(topic as any).title}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{(topic as any).posts} posts</div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Developers */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-semibold text-black">
                Top Developers
              </h3>
            </div>
            <div className="space-y-2">
              {(topDevelopers.length > 0 ? topDevelopers : ACTIVE_DEVELOPERS).slice(0, 4).map((dev: any) => (
                <button
                  key={dev._id || dev.id}
                  onClick={() => handleDeveloperClick(dev.username || (dev as any).username)}
                  className="w-full text-left px-3 py-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors border-none cursor-pointer"
                >
                  <div className="font-medium text-sm text-gray-900">{dev.username}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{dev.specialty || dev.bio || 'Game Developer'}</div>
                  <div className="text-xs text-gray-400 mt-1">{dev.postsCount} posts</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-black mb-2">
              Community
            </h1>
            <p className="text-base text-gray-600">
              Connect with indie developers, share ideas, and collaborate
            </p>
          </div>

          {/* Game Jams Section */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-gray-700" />
              <h2 className="text-xl font-bold text-black">
                Upcoming Game Jams
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {GAME_JAMS.map((jam) => (
                <button
                  key={jam.id}
                  onClick={() => handleJamClick(jam.title)}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer text-left bg-white hover:bg-gray-50"
                >
                  <h3 className="font-bold text-black mb-1">{jam.title}</h3>
                  <p className="text-xs text-gray-600 mb-3">{jam.description}</p>
                  <div className="space-y-1 text-xs text-gray-500">
                    <div><span className="font-medium">Theme:</span> {jam.theme}</div>
                    <div><span className="font-medium">Dates:</span> {jam.startDate} - {jam.endDate}</div>
                    <div><span className="font-medium">Prize:</span> {jam.prize}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Posts Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-black">
                Recent Discussions
              </h2>
              <Button
                onClick={handleCreatePost}
                className="bg-black hover:bg-gray-800 text-white text-sm font-semibold py-2 px-4 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Post
              </Button>
            </div>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading discussions...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No posts yet. Be the first to start a discussion!</div>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <button
                    key={post._id}
                    onClick={() => handlePostClick(post._id)}
                    className="w-full border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer text-left bg-white"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-black hover:text-gray-700">
                            {post.title}
                          </h3>
                          <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-sm">
                            {post.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>by <span className="font-medium text-gray-700">{post.userId.username}</span></span>
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 px-3 py-2 bg-gray-50 rounded-md">
                        <MessageCircle className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">{post.replies}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
