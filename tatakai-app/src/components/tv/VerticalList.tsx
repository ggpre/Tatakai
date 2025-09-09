'use client';

import React from 'react';
import Focusable from './Focusable';

interface VerticalListProps {
  id: string;
  children: React.ReactNode[];
  className?: string;
  gap?: number;
}

const VerticalList: React.FC<VerticalListProps> = ({
  id,
  children,
  className = '',
  gap = 16
}) => {
  return (
    <div
      className={`tv-vertical-list ${className}`}
      data-list-id={id}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: `${gap}px`
      }}
    >
      {children.map((child, index) => (
        <div key={index} className="tv-vertical-list__item">
          <Focusable id={`${id}-item-${index}`}>
            {child}
          </Focusable>
        </div>
      ))}
    </div>
  );
};

export default VerticalList;
