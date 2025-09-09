'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimeAPI, type HomePageData } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

const TVHomePageSimple = () => {
  const router = useRouter();
  const [homeData, setHomeData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Fetch data
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const data = await AnimeAPI.getHomePage();
        if (data?.success) {
          setHomeData(data);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  // Simple keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!homeData?.data?.trendingAnimes) return;
      
      const maxIndex = homeData.data.trendingAnimes.length - 1;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(maxIndex, prev + 1));
          break;
        case 'Enter':
          e.preventDefault();
          const selectedAnime = homeData.data.trendingAnimes[focusedIndex];
          if (selectedAnime) {
            router.push(`/tv/anime/${selectedAnime.id}`);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, homeData, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-8">
        <Skeleton className="h-16 w-64 mb-8" />
        <div className="grid grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const animes = homeData?.data?.trendingAnimes || [];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Trending Anime</h1>
      
      <div className="grid grid-cols-5 gap-4">
        {animes.map((anime, index: number) => (
          <div
            key={anime.id}
            className={`
              relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200
              ${index === focusedIndex 
                ? 'ring-4 ring-rose-500 scale-105 z-10' 
                : 'hover:scale-105'}
            `}
            onClick={() => router.push(`/tv/anime/${anime.id}`)}
          >
            <img
              src={anime.poster}
              alt={anime.name}
              className="w-full h-80 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              <h3 className="text-lg font-semibold line-clamp-2">{anime.name}</h3>
            </div>
          </div>
        ))}
      </div>
      {/* Search Button */}
      <div className="flex justify-end mb-4">
        <button
          className={`
        px-6 py-3 text-lg font-semibold rounded-lg transition-all duration-200
        ${focusedIndex === animes.length 
          ? 'bg-rose-500 text-white ring-4 ring-rose-300 scale-105' 
          : 'bg-gray-800 text-white hover:bg-gray-700'}
          `}
          onClick={() => router.push('/tv/search')}
        >
          <span className="flex items-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
        Search Anime
          </span>
        </button>
      </div>
      {/* Instructions */}
      <div className="mt-8 text-gray-400">
        <p>Use ←→ arrows to navigate, Enter to select</p>
      </div>
    </div>
  );
};

export default TVHomePageSimple;
