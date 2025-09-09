'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useTVNavigation, FocusableElement } from './ReactTVProvider';

interface FocusableProps {
  id: string;
  children: React.ReactNode;
  groupId?: string;
  disabled?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onSelect?: () => void;
  className?: string;
  style?: React.CSSProperties;
  focusClassName?: string;
  tabIndex?: number;
}

export const Focusable: React.FC<FocusableProps> = ({
  id,
  children,
  groupId,
  disabled = false,
  onFocus,
  onBlur,
  onSelect,
  className = '',
  style,
  focusClassName = 'tv-focused',
  tabIndex = 0,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const { registerElement, unregisterElement, currentFocusId } = useTVNavigation();

  const updateElementPosition = useCallback(() => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      const element: FocusableElement = {
        id,
        element: elementRef.current,
        x: rect.left + scrollLeft,
        y: rect.top + scrollTop,
        width: rect.width,
        height: rect.height,
        groupId,
        disabled,
        onFocus: () => {
          updateElementPosition(); // Update position when focused
          onFocus?.();
        },
        onBlur,
        onSelect,
      };
      registerElement(element);
    }
  }, [id, groupId, disabled, onFocus, onBlur, onSelect, registerElement]);

  useEffect(() => {
    updateElementPosition();
    
    // Update position on window resize
    const handleResize = () => updateElementPosition();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      unregisterElement(id);
    };
  }, [id, updateElementPosition, unregisterElement]);

  const isFocused = currentFocusId === id;

  const handleClick = useCallback(() => {
    if (!disabled && onSelect) {
      onSelect();
    }
  }, [disabled, onSelect]);

  const combinedClassName = `${className} ${isFocused ? focusClassName : ''}`.trim();

  return (
    <div
      ref={elementRef}
      className={combinedClassName}
      style={style}
      tabIndex={disabled ? -1 : tabIndex}
      onClick={handleClick}
      data-focusable-id={id}
      data-focused={isFocused}
    >
      {children}
    </div>
  );
};

export default Focusable;
