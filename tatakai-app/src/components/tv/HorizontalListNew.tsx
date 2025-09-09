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
  const { registerGroup, unregisterGroup, currentFocusId } = useTVNavigation();

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

  // Handle auto-scrolling when focus changes within this list
  useEffect(() => {
    if (currentFocusId && containerRef.current) {
      const focusedElement = containerRef.current.querySelector(`[data-focusable-id="${currentFocusId}"]`) as HTMLElement;
      if (focusedElement) {
        const container = containerRef.current;
        const children = Array.from(container.children) as HTMLElement[];
        const focusedIndex = children.indexOf(focusedElement);
        
        if (focusedIndex !== -1) {
          const itemWidth = focusedElement.offsetWidth;
          const itemLeft = focusedElement.offsetLeft;
          const containerWidth = container.clientWidth;
          const scrollLeft = container.scrollLeft;
          
          // Calculate if we need to scroll
          const itemStart = itemLeft;
          const itemEnd = itemLeft + itemWidth;
          const viewStart = scrollLeft;
          const viewEnd = scrollLeft + containerWidth;
          
          // Scroll if item is not fully visible
          if (itemStart < viewStart) {
            container.scrollTo({
              left: Math.max(0, itemLeft - spacing),
              behavior: 'smooth'
            });
          } else if (itemEnd > viewEnd) {
            container.scrollTo({
              left: itemLeft - containerWidth + itemWidth + spacing,
              behavior: 'smooth'
            });
          }
        }
      }
    }
  }, [currentFocusId, spacing]);

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
        scrollSnapType: 'x mandatory',
      }}
      data-navigation-group={id}
    >
      {children}
    </div>
  );
};

export default HorizontalList;
