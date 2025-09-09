'use client';

import React from 'react';
import HorizontalList from './HorizontalList';
import Focusable from './Focusable';

interface Anime {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  year?: number;
  rating?: number;
  episode?: number;
  duration?: string;
  status?: string;
}

interface AnimeCarouselProps {
  id: string;
  title: string;
  animes: Anime[];
  onAnimeClick?: (anime: Anime) => void;
  itemWidth?: number;
  showTitle?: boolean;
}

const AnimeCarousel: React.FC<AnimeCarouselProps> = ({
  id,
  title,
  animes,
  onAnimeClick,
  itemWidth = 280,
  showTitle = true
}) => {
  if (!animes || animes.length === 0) {
    return null;
  }

  const handleAnimeSelect = (anime: Anime) => {
    onAnimeClick?.(anime);
  };

  return (
    <div className="tv-anime-carousel" data-carousel-id={id}>
      {showTitle && (
        <h2 className="tv-anime-carousel__title">{title}</h2>
      )}
      
      <HorizontalList
        id={id}
        spacing={16}
        className="tv-anime-carousel__list"
      >
        {animes.map(anime => (
          <Focusable
            key={anime.id}
            id={`${id}-${anime.id}`}
            onSelect={() => handleAnimeSelect(anime)}
          >
            <div className="tv-anime-card">
              <div className="tv-anime-card__image-container">
                <img
                  src={anime.image}
                  alt={anime.title}
                  className="tv-anime-card__image"
                  loading="lazy"
                />
                <div className="tv-anime-card__overlay">
                  <div className="tv-anime-card__play-button">▶</div>
                </div>
              </div>
              
              <div className="tv-anime-card__info">
                <h3 className="tv-anime-card__title">{anime.title}</h3>
                {anime.subtitle && (
                  <p className="tv-anime-card__subtitle">{anime.subtitle}</p>
                )}
                
                <div className="tv-anime-card__meta">
                  {anime.year && (
                    <span className="tv-anime-card__year">{anime.year}</span>
                  )}
                  {anime.rating && (
                    <span className="tv-anime-card__rating">★ {anime.rating}</span>
                  )}
                  {anime.episode && (
                    <span className="tv-anime-card__episode">EP {anime.episode}</span>
                  )}
                </div>
                
                {anime.duration && (
                  <p className="tv-anime-card__duration">{anime.duration}</p>
                )}
                
                {anime.status && (
                  <span className={`tv-anime-card__status tv-anime-card__status--${anime.status.toLowerCase()}`}>
                    {anime.status}
                  </span>
                )}
              </div>
            </div>
          </Focusable>
        ))}
      </HorizontalList>
    </div>
  );
};

export default AnimeCarousel;
