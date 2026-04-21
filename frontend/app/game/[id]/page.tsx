'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Download, Play, ArrowLeft, Loader, Star, Trash2 } from 'lucide-react';
import GamePlayer from '@/components/game/GamePlayer';
import Link from 'next/link';
import { useGames } from '@/hooks/useBackendApi';
import { canPlayInBrowser, detectGameFormat, GameFormat } from '@/lib/gameFormatUtils';
import apiClient from '@/lib/api';

const DEFAULT_GAME_THUMBNAIL = '/default-game-thumbnail.svg';

interface Comment {
  _id: string;
  text: string;
  userId: {
    _id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
}

interface RatingData {
  ratings: any[];
  averageRating: number;
  totalRatings: number;
  distribution: Record<number, number>;
}

export default function GameDetailPage() {
  const params = useParams();
  const gameId = params.id as string;
  const [game, setGame] = useState<any>(null);
  const [relatedGames, setRelatedGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [showPlayer, setShowPlayer] = useState(false);
  const [gameFormat, setGameFormat] = useState<GameFormat>('other');
  const [comments, setComments] = useState<Comment[]>([]);
  const [ratingsData, setRatingsData] = useState<RatingData | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [heroThumbnailSrc, setHeroThumbnailSrc] = useState(DEFAULT_GAME_THUMBNAIL);
  const { addRecentGameView, user, isAuthenticated } = useAppStore();
  const { getGameById, getGames } = useGames();

  useEffect(() => {
    let isMounted = true;

    const fetchGameData = async () => {
      try {
        const gameData = await getGameById(gameId);
        if (!isMounted) {
          return;
        }

        setGame(gameData);
        setHeroThumbnailSrc(gameData?.thumbnail || DEFAULT_GAME_THUMBNAIL);
        addRecentGameView(gameId);

        // Detect game format from file URL or stored format
        const format = gameData.gameFormat || (gameData.fileUrl ? detectGameFormat(gameData.fileUrl) : 'other');
        setGameFormat(format as GameFormat);

        // Render game details immediately; secondary sections can continue loading.
        setLoading(false);

        // Fetch related games by tags
        if (gameData.tags && gameData.tags.length > 0) {
          void getGames({ tags: gameData.tags.slice(0, 2) })
            .then((allGames) => {
              if (!isMounted) {
                return;
              }

              setRelatedGames(
                allGames
                  .filter((g: any) => (g._id || g.id) !== gameId)
                  .slice(0, 5)
              );
            })
            .catch((error) => {
              console.error('Failed to fetch related games:', error);
            });
        }

        // Fetch comments
        void apiClient
          .get(`/games/${gameId}/comments`)
          .then((commentsRes) => {
            if (!isMounted) {
              return;
            }

            if (commentsRes.data?.success) {
              setComments(commentsRes.data.data);
            }
          })
          .catch((error) => {
            console.error('Failed to fetch comments:', error);
          });

        // Fetch ratings
        void apiClient
          .get(`/games/${gameId}/ratings`)
          .then((ratingsRes) => {
            if (!isMounted) {
              return;
            }

            if (ratingsRes.data?.success) {
              setRatingsData(ratingsRes.data.data);
            }
          })
          .catch((error) => {
            console.error('Failed to fetch ratings:', error);
          });

        // Fetch user's rating if authenticated
        if (isAuthenticated) {
          void apiClient
            .get(`/games/${gameId}/ratings/me`)
            .then((userRatingRes) => {
              if (!isMounted) {
                return;
              }

              if (userRatingRes.data?.data) {
                setUserRating(userRatingRes.data.data.score);
              }
            })
            .catch((error) => {
              console.error('Failed to fetch user rating:', error);
            });
        }
      } catch (error) {
        console.error('Failed to fetch game:', error);
        if (isMounted) {
          setGame(null);
        }
      } finally {
        if (isMounted) {
        setLoading(false);
        }
      }
    };

    fetchGameData();

    return () => {
      isMounted = false;
    };
  }, [gameId, getGameById, getGames, addRecentGameView, isAuthenticated]);

  const handlePlayGame = () => {
    if (game?.fileUrl) {
      setShowPlayer(true);
    }
  };

  const handleDownloadGame = () => {
    if (!game?._id && !game?.id) {
      return;
    }

    const gameIdentifier = game._id || game.id;
    const baseApiUrl = (String(apiClient.defaults.baseURL || '/api')).replace(/\/+$/, '');
    const downloadUrl = `${baseApiUrl}/games/${gameIdentifier}/download`;
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      alert('Please log in to comment');
      return;
    }

    if (!commentText.trim()) {
      setCommentError('Comment cannot be empty');
      return;
    }

    setSubmittingComment(true);
    setCommentError('');

    try {
      const response = await apiClient.post(
        `/games/${gameId}/comments`,
        { text: commentText }
      );

      if (response.data?.success) {
        setComments([response.data.data, ...comments]);
        setCommentText('');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to post comment';
      setCommentError(errorMsg);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      const response = await apiClient.delete(`/games/${gameId}/comments/${commentId}`);
      if (response.data?.success) {
        setComments(comments.filter((c) => c._id !== commentId));
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleSubmitRating = async (score: number) => {
    if (!isAuthenticated) {
      alert('Please log in to rate');
      return;
    }

    setSubmittingRating(true);

    try {
      const response = await apiClient.post(
        `/games/${gameId}/ratings`,
        { score }
      );

      if (response.data?.success) {
        setUserRating(score);
        // Refetch ratings
        const ratingsRes = await apiClient.get(`/games/${gameId}/ratings`);
        if (ratingsRes.data?.success) {
          setRatingsData(ratingsRes.data.data);
        }
      }
    } catch (error: any) {
      console.error('Failed to submit rating:', error);
      alert(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
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
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-4">Game Not Found</h1>
          <p className="text-gray-600 mb-6">The game you're looking for doesn't exist.</p>
          <Link href="/games">
            <Button className="bg-black hover:bg-gray-800 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Games
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const authorName =
    game?.author ||
    (typeof game?.createdBy === 'object' ? game?.createdBy?.username : null) ||
    'Unknown Developer';
  const hasPlayableFile = Boolean(game?.fileUrl);
  const hasDownloadFile = Boolean(game?.downloadUrl || game?.fileUrl || game?.activeBuild);

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Show Player if gameplay is active */}
        {showPlayer && game?.fileUrl && (
          <div className="mb-12 p-6 bg-black rounded-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-white text-xl font-bold">Playing: {game.title}</h2>
              <Button
                onClick={() => setShowPlayer(false)}
                className="bg-white/20 hover:bg-white/40 text-white"
                size="sm"
              >
                Close Player
              </Button>
            </div>
            <GamePlayer
              gameId={game._id}
              gameTitle={game.title}
              fileUrl={game.fileUrl}
              gameFormat={gameFormat}
              onDownload={handleDownloadGame}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Left: Image or Preview */}
          <div className="lg:col-span-2">
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
              {!showPlayer ? (
                <img
                  src={heroThumbnailSrc}
                  alt={game?.title}
                  className="w-full h-full object-cover block max-w-full"
                  onError={() => setHeroThumbnailSrc(DEFAULT_GAME_THUMBNAIL)}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">Game is playing above</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Game Info */}
          <div className="flex flex-col justify-between">
            {/* Title & Developer */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-black mb-3">{game?.title}</h1>
              <p className="text-sm text-gray-600 mb-4">by {authorName}</p>

              {/* Game Format Badge */}
              <div className="mb-4 flex items-center gap-2">
                <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  {gameFormat.toUpperCase()}
                </span>
                {canPlayInBrowser(gameFormat) ? (
                  <span className="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    Browser Compatible
                  </span>
                ) : (
                  <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                    Download Required
                  </span>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {game?.tags?.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handlePlayGame}
                disabled={!hasPlayableFile}
                className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4 mr-2" />
                {canPlayInBrowser(gameFormat) ? 'Play Now' : 'Play Info'}
              </Button>
              <Button
                onClick={handleDownloadGame}
                disabled={!hasDownloadFile}
                className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-black font-semibold py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>

            {/* Stats */}
            {(ratingsData?.averageRating !== undefined || game?.downloads || game?.reviews) && (
              <div className="mt-8 pt-6 border-t border-gray-200 space-y-4 text-sm">
                {/* Rating Section */}
                {ratingsData && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-600">Rating</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 cursor-pointer transition-colors ${
                                i < Math.round(ratingsData.averageRating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                              onClick={() => handleSubmitRating(i + 1)}
                              style={{ opacity: submittingRating ? 0.5 : 1, pointerEvents: submittingRating ? 'none' : 'auto' }}
                            />
                          ))}
                        </div>
                        <span className="font-semibold text-black">
                          {ratingsData.averageRating.toFixed(1)}/5
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{ratingsData.totalRatings} {ratingsData.totalRatings === 1 ? 'rating' : 'ratings'}</p>
                    {isAuthenticated && userRating && (
                      <p className="text-xs text-blue-600 mt-1">Your rating: {userRating} ⭐</p>
                    )}
                  </div>
                )}
                {game?.downloads && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Downloads</span>
                    <span className="font-semibold text-black">
                      {(game.downloads / 1000).toFixed(1)}k
                    </span>
                  </div>
                )}
                {game?.reviews && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reviews</span>
                    <span className="font-semibold text-black">{game.reviews}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Description & Comments */}
          <div className="lg:col-span-2 space-y-12">
            {/* About This Game */}
            <section>
              <h2 className="text-xl font-semibold text-black mb-4">About this game</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {game.longDescription || game.description}
              </p>
            </section>

            {/* Comments Section */}
            <section className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-semibold text-black mb-6">Comments ({comments.length})</h2>

              {/* Comment List */}
              <div className="space-y-4 mb-8">
                {comments.length === 0 ? (
                  <p className="text-sm text-gray-500 py-6 text-center">No comments yet. Be the first to comment!</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment._id} className="pb-4 border-b border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {comment.userId.avatar && (
                            <img
                              src={comment.userId.avatar}
                              alt={comment.userId.username}
                              className="w-6 h-6 rounded-full"
                            />
                          )}
                          <span className="font-semibold text-sm text-black">{comment.userId.username}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                          {user?.id === comment.userId._id && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{comment.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <div className="bg-gray-50 p-4 rounded-md">
                {!isAuthenticated ? (
                  <p className="text-sm text-gray-600 mb-4">
                    <Link href="/auth/login" className="text-blue-600 hover:underline">
                      Log in
                    </Link>
                    {' '}to post a comment
                  </p>
                ) : (
                  <>
                    <textarea
                      value={commentText}
                      onChange={(e) => {
                        setCommentText(e.target.value);
                        setCommentError('');
                      }}
                      placeholder="Write a comment..."
                      className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-none"
                      rows={3}
                      disabled={submittingComment}
                    />
                    {commentError && <p className="text-red-600 text-xs mt-2">{commentError}</p>}
                    <div className="flex justify-end mt-3">
                      <Button
                        onClick={handleSubmitComment}
                        disabled={submittingComment || !commentText.trim()}
                        className="bg-black hover:bg-gray-800 text-white text-sm font-semibold py-1 px-6 disabled:opacity-50"
                      >
                        {submittingComment ? 'Posting...' : 'Post'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>

          {/* Right Sidebar - Similar Games */}
          <div>
            <h2 className="text-xl font-semibold text-black mb-4">Similar games</h2>
            <div className="space-y-4">
              {relatedGames.map((relatedGame) => {
                const relatedGameId = relatedGame.id || relatedGame._id;
                if (!relatedGameId) {
                  return null;
                }

                const relatedAuthor =
                  relatedGame.author ||
                  (typeof relatedGame.createdBy === 'object' ? relatedGame.createdBy?.username : null) ||
                  'Unknown Developer';

                return (
                  <Link
                    key={relatedGameId}
                    href={`/game/${relatedGameId}`}
                    className="flex gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-16 h-16 rounded bg-gray-100 overflow-hidden">
                      <img
                        src={relatedGame.thumbnail || DEFAULT_GAME_THUMBNAIL}
                        alt={relatedGame.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(event) => {
                          const target = event.currentTarget;
                          if (target.src !== DEFAULT_GAME_THUMBNAIL) {
                            target.src = DEFAULT_GAME_THUMBNAIL;
                          }
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-black truncate group-hover:text-gray-700">
                        {relatedGame.title}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">{relatedAuthor}</p>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {(relatedGame.tags || []).slice(0, 2).map((tag: string) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
