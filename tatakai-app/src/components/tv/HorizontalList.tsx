'use client';

import React, { useEffect, useRef } from 'react';
import { useTVNavigation, NavigationGroup } from './ReactTVProvider';

interface HorizontalListProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  wrapAround?: boolean;
  spacing?: number;
}

export const HorizontalList: React.FC<HorizontalListProps> = ({
  id,
  children,
  className = '',
  wrapAround = false,
  spacing = 16,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { registerGroup, unregisterGroup } = useTVNavigation();

  useEffect(() => {
    const group: NavigationGroup = {
      id,
      elements: [], // Will be populated by child Focusable elements
      orientation: 'horizontal',
      wrapAround,
    };
    
    registerGroup(group);
    
    return () => {
      unregisterGroup(id);
    };
  }, [id, wrapAround, registerGroup, unregisterGroup]);

  return (
    <div
      ref={containerRef}
      className={`tv-horizontal-list ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: `${spacing}px`,
        overflowX: 'auto',
        scrollBehavior: 'smooth',
      }}
      data-navigation-group={id}
    >
      {children}
    </div>
  );
};

export default HorizontalList;
     