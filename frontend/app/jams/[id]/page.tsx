'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Users, ArrowLeft } from 'lucide-react';
import { useGameJams } from '@/hooks/useBackendApi';

export default function JamDetailPage() {
  const params = useParams();
  const jamId = params.id as string;
  const { getGameJamById, joinGameJam, loading } = useGameJams();
  const [jam, setJam] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    const fetchJam = async () => {
      try {
        const data = await getGameJamById(jamId);
        setJam(data);
      } catch (error) {
        console.error('Failed to fetch jam:', error);
      }
    };

    fetchJam();
  }, [jamId, getGameJamById]);

  const handleJoinJam = async () => {
    try {
      await joinGameJam(jamId);
      setIsJoined(true);
    } catch (error) {
      console.error('Failed to join jam:', error);
    }
  };

  if (loading || !jam) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link href="/jams" className="inline-flex items-center text-black hover:text-gray-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jams
        </Link>

        {/* Top Section */}
        <div className="mb-12">
          <div className="flex items-start gap-3 mb-4">
            <h1 className="text-3xl font-semibold text-black">{jam.title}</h1>
            <span className="text-xs font-medium px-2 py-1 rounded border bg-blue-50 text-blue-700 border-blue-200">
              Jam
            </span>
          </div>

          {/* Theme */}
          <p className="text-lg text-gray-600 mb-6">{jam.theme}</p>

          {/* Metadata */}
          <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Deadline: {formatDate(jam.deadline)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{jam.participants?.length || 0} participants</span>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleJoinJam}
            disabled={isJoined || loading}
            className={`font-semibold py-2 px-6 transition-colors ${
              isJoined
                ? 'bg-gray-200 hover:bg-gray-300 text-black'
                : 'bg-black hover:bg-gray-800 text-white'
            }`}
          >
            {isJoined ? 'Joined' : 'Join Jam'}
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* About/Description */}
            <section className="border-b border-gray-200 pb-8">
              <h2 className="text-xl font-semibold text-black mb-4">About</h2>
              <p className="text-gray-600 leading-relaxed">{jam.description || 'No description provided'}</p>
            </section>
          </div>
        </div>
      </div>
    </div>
                            <h3 className="font-semibold text-black mb-1">{submission.gameTitle}</h3>
                            <p className="text-sm text-gray-600 mb-2">by {submission.developer}</p>
                          </div>
                          {submission.rating && (
                            <div className="text-sm text-gray-600">
                              Rating: <span className="font-semibold">{submission.rating}/5</span>
                            </div>
                          )}
                        </div>

                        {/* Play Button */}
                        <Button className="bg-black hover:bg-gray-800 text-white h-fit px-4 py-2 text-sm whitespace-nowrap">
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Participants */}
            <section>
              <h2 className="text-xl font-semibold text-black mb-4">Participants</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {jam.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="border border-gray-200 rounded-lg p-4 text-center hover:border-gray-300 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-2 text-white font-bold">
                      {participant.avatar || participant.username.charAt(0)}
                    </div>
                    <h3 className="font-semibold text-sm text-black">{participant.username}</h3>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{participant.role}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div>
            {/* Submission Card */}
            <div className="sticky top-24 border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h3 className="font-semibold text-black mb-4">Ready to participate?</h3>

              {jam.status === 'ended' ? (
                <Button disabled className="w-full bg-gray-300 text-gray-600 cursor-not-allowed py-2">
                  Jam Ended
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Create a game based on the theme and submit before the deadline.
                  </p>
                  <Button className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2">
                    Submit Your Game
                  </Button>
                  <Button className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-black font-semibold py-2">
                    View Submission Guide
                  </Button>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Participants</span>
                    <span className="font-semibold text-black">{jam.participants.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submissions</span>
                    <span className="font-semibold text-black">{jam.submissions?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
