'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HorizontalList from './HorizontalList';
import Focusable from './Focusable';

interface SpotlightItem {
  id: string;
  name: string;
  poster: string;
  jname?: string;
  description?: string;
  otherInfo?: string[];
  type?: string;
}

interface SpotlightSectionProps {
  id: string;
  items: SpotlightItem[];
  autoChange?: boolean;
  changeInterval?: number;
}

const SpotlightSection: React.FC<SpotlightSectionProps> = ({
  id,
  items,
  autoChange = true,
  changeInterval = 5000
}) => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-change spotlight items
  useEffect(() => {
    if (!autoChange || items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items.length);
    }, changeInterval);

    return () => clearInterval(interval);
  }, [autoChange, changeInterval, items.length]);

  const currentItem = items[currentIndex] || items[0];

  const handleItemSelect = (item: SpotlightItem) => {
    router.push(`/tv/anime/${item.id}`);
  };

  const handleSpotlightSelect = () => {
    if (currentItem) {
      handleItemSelect(currentItem);
    }
  };

  const getIndicatorItems = () => {
    return items.map((item, index) => (
      <div
        key={item.id}
        className={`tv-spotlight__indicator ${index === currentIndex ? 'active' : ''}`}
        onClick={() => setCurrentIndex(index)}
      />
    ));
  };

  if (!items.length) return null;

  return (
    <div className="tv-spotlight" data-spotlight-id={id}>
      {/* Main Spotlight Display */}
      <div className="tv-spotlight__main">
        <Focusable
          id={`${id}-main`}
          onSelect={handleSpotlightSelect}
          className="tv-spotlight__content"
        >
          <div 
            className="tv-spotlight__background"
            style={{ backgroundImage: `url(${currentItem.poster})` }}
          >
            <div className="tv-spotlight__overlay">
              <div className="tv-spotlight__info">
                <h1 className="tv-spotlight__title">{currentItem.name}</h1>
                {currentItem.jname && (
                  <h2 className="tv-spotlight__subtitle">{currentItem.jname}</h2>
                )}
                {currentItem.description && (
                  <p className="tv-spotlight__description">
                    {currentItem.description.length > 200 
                      ? `${currentItem.description.substring(0, 200)}...`
                      : currentItem.description
                    }
                  </p>
                )}
                <div className="tv-spotlight__meta">
                  {currentItem.type && (
                    <span className="tv-spotlight__type">{currentItem.type}</span>
                  )}
                  {currentItem.otherInfo?.map((info, index) => (
                    <span key={index} className="tv-spotlight__info-item">
                      {info}
                    </span>
                  ))}
                </div>
                <div className="tv-spotlight__actions">
                  <div className="tv-spotlight__button tv-spotlight__button--primary">
                    ▶ Watch Now
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Focusable>

        {/* Indicators */}
        {items.length > 1 && (
          <div className="tv-spotlight__indicators">
            {getIndicatorItems()}
          </div>
        )}
      </div>

      {/* Horizontal List of all items */}
      <div className="tv-spotlight__list">
        <h3 className="tv-spotlight__list-title">Featured</h3>
        <HorizontalList
          id={`${id}-list`}
          spacing={12}
          className="tv-spotlight__list-container"
        >
          {items.map(item => (
            <Focusable
              key={item.id}
              id={`${id}-list-${item.id}`}
              onSelect={() => handleItemSelect(item)}
            >
              <div
                className={`tv-spotlight__list-item ${item.id === currentItem.id ? 'active' : ''}`}
              >
                <img
                  src={item.poster}
                  alt={item.name}
                  className="tv-spotlight__list-image"
                />
                <div className="tv-spotlight__list-info">
                  <h4 className="tv-spotlight__list-name">{item.name}</h4>
                  {item.jname && (
                    <p className="tv-spotlight__list-jname">{item.jname}</p>
                  )}
                </div>
              </div>
            </Focusable>
          ))}
        </HorizontalList>
      </div>
    </div>
  );
};

export default SpotlightSection;
