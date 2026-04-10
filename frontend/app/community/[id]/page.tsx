'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react';
import apiClient from '@/lib/api';

interface Post {
  _id: string;
  title: string;
  content: string;
  category: string;
  userId: {
    _id: string;
    username: string;
    avatar?: string;
  };
  replies: number;
  createdAt: string;
  updatedAt: string;
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const { isAuthenticated, user } = useAppStore();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await apiClient.get(`/posts/${postId}`);
        if (response.data?.success) {
          setPost(response.data.data);
          setEditedTitle(response.data.data.title);
          setEditedContent(response.data.data.content);
        }
      } catch (error) {
        console.error('Failed to fetch post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    setIsDeleting(true);

    try {
      const response = await apiClient.delete(`/posts/${postId}`);
      if (response.data?.success) {
        router.push('/community');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await apiClient.put(`/posts/${postId}`, {
        title: editedTitle,
        content: editedContent,
      });
      if (response.data?.success) {
        setPost(response.data.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Failed to update post');
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-6">The post you're looking for doesn't exist.</p>
          <Link href="/community">
            <Button className="bg-black hover:bg-gray-800 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Community
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Community
        </Link>

        {/* Post Card */}
        <div className="border border-gray-200 rounded-lg p-8 bg-white">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full text-3xl font-bold text-black border border-gray-300 rounded-lg px-3 py-2 mb-2"
                />
              ) : (
                <h1 className="text-3xl font-bold text-black mb-2">{post.title}</h1>
              )}
              <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                {post.category}
              </span>
            </div>

            {isAuthenticated && user?.id === post.userId._id && (
              <div className="flex gap-2">
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-gray-500 hover:bg-gray-600 text-white text-sm"
                  >
                    Edit
                  </Button>
                )}
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>

          {/* Author Info */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
            {post.userId.avatar && (
              <img
                src={post.userId.avatar}
                alt={post.userId.username}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <p className="text-sm font-semibold text-black">{post.userId.username}</p>
              <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
            </div>
          </div>

          {/* Content */}
          {isEditing ? (
            <>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4"
                rows={10}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdate}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  className="border border-gray-300 bg-white hover:bg-gray-50 text-black"
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="prose prose-sm max-w-none mb-8">
              <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
            </div>
          )}

          {/* Stats */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{post.replies}</span> replies • Last updated {formatDate(post.updatedAt)}
            </p>
          </div>

          {/* Placeholder for Reply Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-black mb-4">Replies Coming Soon</h2>
            <p className="text-gray-600">Reply functionality will be implemented in the next update.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
