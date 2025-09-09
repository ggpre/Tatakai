'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TVNavigationProvider } from './ReactTVProvider';
import { Focusable } from './Focusable';
import HorizontalList from './HorizontalListNew';
import VerticalList from './VerticalListNew';

interface Anime {
  id: number;
  title: string;
  image: string;
  description?: string;
}

interface TVHomePageProps {
  trendingAnime: Anime[];
  popularAnime: Anime[];
  recentAnime: Anime[];
  topRatedAnime: Anime[];
}

const AnimeCard: React.FC<{ anime: Anime; id: string; groupId: string }> = ({ anime, id, groupId }) => {
  const router = useRouter();

  const handleSelect = () => {
    router.push(`/anime/${anime.id}`);
  };

  return (
    <Focusable
      id={id}
      groupId={groupId}
      onSelect={handleSelect}
      className="tv-anime-card"
      focusClassName="tv-focused"
    >
      <div className="relative group">
        <img
          src={anime.image || '/placeholder-anime.jpg'}
          alt={anime.title}
          className="w-64 h-96 object-cover rounded-lg transition-transform duration-200"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
          <h3 className="text-white font-semibold text-sm line-clamp-2">
            {anime.title}
          </h3>
        </div>
      </div>
    </Focusable>
  );
};

const SpotlightSection: React.FC<{ anime: Anime }> = ({ anime }) => {
  const router = useRouter();

  const handleSelect = () => {
    router.push(`/anime/${anime.id}`);
  };

  const handleWatch = () => {
    router.push(`/watch/${anime.id}/1`);
  };

  return (
    <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
      <img
        src={anime.image || '/placeholder-anime.jpg'}
        alt={anime.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent">
        <div className="flex flex-col justify-center h-full p-8 max-w-2xl">
          <h1 className="text-4xl font-bold text-white mb-4">{anime.title}</h1>
          {anime.description && (
            <p className="text-lg text-gray-200 mb-6 line-clamp-3">
              {anime.description}
            </p>
          )}
          <div className="flex gap-4">
            <Focusable
              id="spotlight-watch"
              groupId="spotlight"
              onSelect={handleWatch}
              className="tv-button primary"
            >
              <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                ▶ Watch Now
              </button>
            </Focusable>
            <Focusable
              id="spotlight-details"
              groupId="spotlight"
              onSelect={handleSelect}
              className="tv-button secondary"
            >
              <button className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                More Info
              </button>
            </Focusable>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnimeSection: React.FC<{
  title: string;
  anime: Anime[];
  sectionId: string;
}> = ({ title, anime, sectionId }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4 px-4">{title}</h2>
      <HorizontalList id={sectionId} className="px-4" spacing={16} wrapAround>
        {anime.map((item, index) => (
          <AnimeCard
            key={item.id}
            anime={item}
            id={`${sectionId}-${index}`}
            groupId={sectionId}
          />
        ))}
      </HorizontalList>
    </div>
  );
};

const TVHomePage: React.FC<TVHomePageProps> = ({
  trendingAnime,
  popularAnime,
  recentAnime,
  topRatedAnime,
}) => {
  // Use the first trending anime for spotlight
  const spotlightAnime = trendingAnime[0];

  return (
    <TVNavigationProvider initialFocus="spotlight-watch">
      <div className="min-h-screen bg-black text-white">
        {/* Spotlight Section */}
        {spotlightAnime && <SpotlightSection anime={spotlightAnime} />}

        {/* Content Sections */}
        <VerticalList id="main-sections" spacing={32}>
          <AnimeSection
            title="🔥 Trending Now"
            anime={trendingAnime.slice(1)} // Skip first item used in spotlight
            sectionId="trending"
          />
          
          <AnimeSection
            title="⭐ Most Popular"
            anime={popularAnime}
            sectionId="popular"
          />
          
          <AnimeSection
            title="🆕 Recently Added"
            anime={recentAnime}
            sectionId="recent"
          />
          
          <AnimeSection
            title="🏆 Top Rated"
            anime={topRatedAnime}
            sectionId="top-rated"
          />
        </VerticalList>
      </div>
    </TVNavigationProvider>
  );
};

export default TVHomePage;
