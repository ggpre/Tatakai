'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface FocusableElement {
  id: string;
  element: HTMLElement;
  parent?: string;
  children?: string[];
  onFocus?: () => void;
  onBlur?: () => void;
  onEnter?: () => void;
  autoScroll?: boolean;
}

interface NavigationContextType {
  registerElement: (id: string, element: HTMLElement, options?: Partial<FocusableElement>) => void;
  unregisterElement: (id: string) => void;
  focusElement: (id: string) => void;
  getCurrentFocus: () => string | null;
  moveLeft: () => void;
  moveRight: () => void;
  moveUp: () => void;
  moveDown: () => void;
  selectCurrent: () => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: React.ReactNode;
  initialFocus?: string;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  initialFocus
}) => {
  const [elements, setElements] = useState<Map<string, FocusableElement>>(new Map());
  const [currentFocus, setCurrentFocus] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const registerElement = useCallback((
    id: string,
    element: HTMLElement,
    options: Partial<FocusableElement> = {}
  ) => {
    setElements(prev => {
      const newMap = new Map(prev);
      newMap.set(id, {
        id,
        element,
        ...options
      });
      return newMap;
    });

    // Set initial focus if this is the designated initial focus
    if (initialFocus === id && !currentFocus) {
      setTimeout(() => setCurrentFocus(id), 100);
    }
  }, [initialFocus, currentFocus]);

  const unregisterElement = useCallback((id: string) => {
    setElements(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
    
    if (currentFocus === id) {
      setCurrentFocus(null);
    }
  }, [currentFocus]);

  const focusElement = useCallback((id: string) => {
    const focusableElement = elements.get(id);
    if (!focusableElement) return;

    // Blur current element
    if (currentFocus && currentFocus !== id) {
      const currentElement = elements.get(currentFocus);
      if (currentElement) {
        currentElement.element.classList.remove('tv-focused');
        currentElement.onBlur?.();
      }
    }

    // Focus new element
    focusableElement.element.classList.add('tv-focused');
    focusableElement.onFocus?.();
    
    // Auto-scroll if enabled
    if (focusableElement.autoScroll !== false) {
      focusableElement.element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }

    setCurrentFocus(id);
  }, [elements, currentFocus]);

  const findNextElement = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (!currentFocus) return null;

    const currentElement = elements.get(currentFocus);
    if (!currentElement) return null;

    const currentRect = currentElement.element.getBoundingClientRect();
    const elementsArray = Array.from(elements.values());

    const candidates: { element: FocusableElement; distance: number }[] = [];

    elementsArray.forEach(element => {
      if (element.id === currentFocus) return;
      
      const rect = element.element.getBoundingClientRect();
      let isValidDirection = false;
      let distance = 0;

      switch (direction) {
        case 'left':
          isValidDirection = rect.right <= currentRect.left + 10;
          distance = currentRect.left - rect.right + Math.abs(rect.top - currentRect.top) * 0.1;
          break;
        case 'right':
          isValidDirection = rect.left >= currentRect.right - 10;
          distance = rect.left - currentRect.right + Math.abs(rect.top - currentRect.top) * 0.1;
          break;
        case 'up':
          isValidDirection = rect.bottom <= currentRect.top + 10;
          distance = currentRect.top - rect.bottom + Math.abs(rect.left - currentRect.left) * 0.1;
          break;
        case 'down':
          isValidDirection = rect.top >= currentRect.bottom - 10;
          distance = rect.top - currentRect.bottom + Math.abs(rect.left - currentRect.left) * 0.1;
          break;
      }

      if (isValidDirection && distance >= 0) {
        candidates.push({ element, distance });
      }
    });

    // Sort by distance and return the closest
    candidates.sort((a, b) => a.distance - b.distance);
    return candidates.length > 0 ? candidates[0].element.id : null;
  }, [currentFocus, elements]);

  const moveLeft = useCallback(() => {
    if (isNavigating) return;
    setIsNavigating(true);
    const nextId = findNextElement('left');
    if (nextId) focusElement(nextId);
    setTimeout(() => setIsNavigating(false), 100);
  }, [findNextElement, focusElement, isNavigating]);

  const moveRight = useCallback(() => {
    if (isNavigating) return;
    setIsNavigating(true);
    const nextId = findNextElement('right');
    if (nextId) focusElement(nextId);
    setTimeout(() => setIsNavigating(false), 100);
  }, [findNextElement, focusElement, isNavigating]);

  const moveUp = useCallback(() => {
    if (isNavigating) return;
    setIsNavigating(true);
    const nextId = findNextElement('up');
    if (nextId) focusElement(nextId);
    setTimeout(() => setIsNavigating(false), 100);
  }, [findNextElement, focusElement, isNavigating]);

  const moveDown = useCallback(() => {
    if (isNavigating) return;
    setIsNavigating(true);
    const nextId = findNextElement('down');
    if (nextId) focusElement(nextId);
    setTimeout(() => setIsNavigating(false), 100);
  }, [findNextElement, focusElement, isNavigating]);

  const selectCurrent = useCallback(() => {
    if (!currentFocus) return;
    const element = elements.get(currentFocus);
    if (element) {
      element.onEnter?.();
    }
  }, [currentFocus, elements]);

  const getCurrentFocus = useCallback(() => currentFocus, [currentFocus]);

  // Handle initial focus
  useEffect(() => {
    if (initialFocus && elements.has(initialFocus) && !currentFocus) {
      setTimeout(() => focusElement(initialFocus), 100);
    }
  }, [initialFocus, elements, currentFocus, focusElement]);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
          event.preventDefault();
          moveRight();
          break;
        case 'ArrowUp':
          event.preventDefault();
          moveUp();
          break;
        case 'ArrowDown':
          event.preventDefault();
          moveDown();
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          selectCurrent();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveLeft, moveRight, moveUp, moveDown, selectCurrent]);

  const value: NavigationContextType = {
    registerElement,
    unregisterElement,
    focusElement,
    getCurrentFocus,
    moveLeft,
    moveRight,
    moveUp,
    moveDown,
    selectCurrent
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
