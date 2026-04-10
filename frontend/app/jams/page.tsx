'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Plus } from 'lucide-react';
import { useGameJams } from '@/hooks/useBackendApi';

export default function JamsListPage() {
  const { getAllGameJams, loading } = useGameJams();
  const [jams, setJams] = useState<any[]>([]);

  useEffect(() => {
    const fetchJams = async () => {
      try {
        const data = await getAllGameJams();
        setJams(data || []);
      } catch (error) {
        console.error('Failed to fetch jams:', error);
      }
    };

    fetchJams();
  }, [getAllGameJams]);

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-start justify-between mb-12">
          <div>
            <h1 className="text-3xl font-semibold text-black mb-2">Game Jams</h1>
            <p className="text-gray-600">Participate in challenges and build games</p>
          </div>
          <Link href="/jams/create">
            <Button className="bg-black hover:bg-gray-800 text-white font-semibold py-2 px-4 whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" />
              Create Jam
            </Button>
          </Link>
        </div>

        {/* Jams List */}
        {jams.length > 0 ? (
          <div className="space-y-4">
            {jams.map((jam: any) => (
              <Link key={jam._id} href={`/jams/${jam._id}`}>
                <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-6">
                  {/* Left Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title and Status */}
                    <div className="flex items-start gap-3 mb-3">
                      <h2 className="text-lg font-semibold text-black group-hover:text-gray-800 transition-colors">
                        {jam.title}
                      </h2>
                      <span className="text-xs font-medium px-2 py-1 rounded border bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap">
                        Jam
                      </span>
                    </div>

                    {/* Theme */}
                    <p className="text-sm text-gray-600 mb-3">{jam.theme}</p>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Deadline: {formatDate(jam.deadline)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {jam.participants?.length || 0}{' '}
                        {(jam.participants?.length || 0) === 1 ? 'participant' : 'participants'}
                      </span>
                    </div>
                  </div>

                  {/* Right Button */}
                  <Button className="bg-black text-white hover:bg-gray-800 font-semibold py-2 px-4 whitespace-nowrap transition-colors">
                    View Details
                  </Button>
                </div>
              </div>
            </Link>
          ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-gray-600 text-lg font-medium mb-2">No active game jams yet</p>
            <p className="text-gray-500 text-sm mb-6">Check back soon for new competitions or create one yourself!</p>
            <Button className="bg-black hover:bg-gray-800 text-white font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Create the First Jam
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
