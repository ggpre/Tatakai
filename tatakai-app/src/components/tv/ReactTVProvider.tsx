'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

// Types for TV Navigation
export interface FocusableElement {
  id: string;
  element: HTMLElement;
  x: number;
  y: number;
  width: number;
  height: number;
  groupId?: string;
  disabled?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onSelect?: () => void;
}

export interface NavigationGroup {
  id: string;
  elements: FocusableElement[];
  orientation?: 'horizontal' | 'vertical' | 'grid';
  wrapAround?: boolean;
}

interface TVNavigationContextType {
  currentFocusId: string | null;
  registerElement: (element: FocusableElement) => void;
  unregisterElement: (id: string) => void;
  registerGroup: (group: NavigationGroup) => void;
  unregisterGroup: (id: string) => void;
  focusElement: (id: string) => void;
  moveFocus: (direction: 'up' | 'down' | 'left' | 'right') => void;
  selectCurrent: () => void;
  setInitialFocus: (id: string) => void;
}

const TVNavigationContext = createContext<TVNavigationContextType | null>(null);

export const useTVNavigation = () => {
  const context = useContext(TVNavigationContext);
  if (!context) {
    throw new Error('useTVNavigation must be used within a TVNavigationProvider');
  }
  return context;
};

interface TVNavigationProviderProps {
  children: React.ReactNode;
  initialFocus?: string;
}

export const TVNavigationProvider: React.FC<TVNavigationProviderProps> = ({ 
  children, 
  initialFocus 
}) => {
  const [currentFocusId, setCurrentFocusId] = useState<string | null>(null);
  const [elements, setElements] = useState<Map<string, FocusableElement>>(new Map());
  const [groups, setGroups] = useState<Map<string, NavigationGroup>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);
  const initialFocusRef = useRef<string | null>(initialFocus || null);

  const registerElement = useCallback((element: FocusableElement) => {
    setElements(prev => {
      const updated = new Map(prev);
      updated.set(element.id, element);
      return updated;
    });
  }, []);

  const unregisterElement = useCallback((id: string) => {
    setElements(prev => {
      const updated = new Map(prev);
      updated.delete(id);
      return updated;
    });
  }, []);

  const registerGroup = useCallback((group: NavigationGroup) => {
    setGroups(prev => {
      const updated = new Map(prev);
      updated.set(group.id, group);
      return updated;
    });
  }, []);

  const unregisterGroup = useCallback((id: string) => {
    setGroups(prev => {
      const updated = new Map(prev);
      updated.delete(id);
      return updated;
    });
  }, []);

  const focusElement = useCallback((id: string) => {
    const element = elements.get(id);
    if (element && !element.disabled) {
      // Blur current element
      if (currentFocusId) {
        const currentElement = elements.get(currentFocusId);
        if (currentElement) {
          currentElement.element.blur();
          currentElement.onBlur?.();
        }
      }

      // Focus new element
      setCurrentFocusId(id);
      element.element.focus();
      element.onFocus?.();
      
      // Enhanced scrolling for TV navigation
      const parentContainer = element.element.closest('.tv-horizontal-list, .tv-vertical-list');
      if (parentContainer) {
        const isHorizontal = parentContainer.classList.contains('tv-horizontal-list');
        const items = Array.from(parentContainer.children) as HTMLElement[];
        const currentIndex = items.indexOf(element.element);
        
        if (currentIndex !== -1 && items.length > 0) {
          const itemSize = isHorizontal ? element.width + 16 : element.height + 16; // 16px gap
          const containerSize = isHorizontal ? parentContainer.clientWidth : parentContainer.clientHeight;
          const scrollPosition = isHorizontal ? parentContainer.scrollLeft : parentContainer.scrollTop;
          
          // Calculate optimal scroll position to center the focused item
          const itemPosition = currentIndex * itemSize;
          const centerOffset = (containerSize - itemSize) / 2;
          const targetScroll = Math.max(0, itemPosition - centerOffset);
          
          // Smooth scroll to the focused item
          parentContainer.scrollTo({
            [isHorizontal ? 'left' : 'top']: targetScroll,
            behavior: 'smooth'
          });
        }
      }
      
      // Page-level vertical scrolling for section navigation
      const sectionContainer = element.element.closest('[data-section]');
      if (sectionContainer) {
        const sectionTop = (sectionContainer as HTMLElement).offsetTop;
        const windowHeight = window.innerHeight;
        const sectionHeight = (sectionContainer as HTMLElement).offsetHeight;
        
        // Calculate scroll position to show section optimally
        let targetScroll = sectionTop - (windowHeight * 0.1); // 10% from top
        
        // If section is smaller than viewport, center it
        if (sectionHeight < windowHeight * 0.8) {
          targetScroll = sectionTop - (windowHeight - sectionHeight) / 2;
        }
        
        // Ensure we don't scroll past the document
        const maxScroll = document.documentElement.scrollHeight - windowHeight;
        targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
        
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      } else {
        // Fallback to basic scroll into view
        element.element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }
    }
  }, [elements, currentFocusId]);

  const setInitialFocus = useCallback((id: string) => {
    initialFocusRef.current = id;
    if (!currentFocusId && elements.has(id)) {
      focusElement(id);
    }
  }, [currentFocusId, elements, focusElement]);

  // Calculate distance between two elements
  const calculateDistance = (from: FocusableElement, to: FocusableElement): number => {
    const dx = (to.x + to.width / 2) - (from.x + from.width / 2);
    const dy = (to.y + to.height / 2) - (from.y + from.height / 2);
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Find best candidate in a direction
  const findBestCandidate = (
    current: FocusableElement,
    direction: 'up' | 'down' | 'left' | 'right'
  ): FocusableElement | null => {
    const candidates = Array.from(elements.values()).filter(
      el => el.id !== current.id && !el.disabled
    );

    let bestCandidate: FocusableElement | null = null;
    let bestScore = Infinity;

    for (const candidate of candidates) {
      let isValidDirection = false;
      const distance = calculateDistance(current, candidate);

      switch (direction) {
        case 'up':
          isValidDirection = candidate.y < current.y;
          break;
        case 'down':
          isValidDirection = candidate.y > current.y;
          break;
        case 'left':
          isValidDirection = candidate.x < current.x;
          break;
        case 'right':
          isValidDirection = candidate.x > current.x;
          break;
      }

      if (isValidDirection && distance < bestScore) {
        bestScore = distance;
        bestCandidate = candidate;
      }
    }

    return bestCandidate;
  };

  const moveFocus = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!currentFocusId) return;

    const currentElement = elements.get(currentFocusId);
    if (!currentElement) return;

    // First, try to find within the same group
    if (currentElement.groupId) {
      const group = groups.get(currentElement.groupId);
      if (group) {
        const groupElements = group.elements.filter(el => !el.disabled);
        const currentIndex = groupElements.findIndex(el => el.id === currentFocusId);
        
        if (currentIndex !== -1) {
          let nextIndex = -1;
          
          if (group.orientation === 'horizontal') {
            if (direction === 'left') {
              nextIndex = currentIndex > 0 ? currentIndex - 1 : 
                         (group.wrapAround ? groupElements.length - 1 : -1);
            } else if (direction === 'right') {
              nextIndex = currentIndex < groupElements.length - 1 ? currentIndex + 1 :
                         (group.wrapAround ? 0 : -1);
            }
          } else if (group.orientation === 'vertical') {
            if (direction === 'up') {
              nextIndex = currentIndex > 0 ? currentIndex - 1 :
                         (group.wrapAround ? groupElements.length - 1 : -1);
            } else if (direction === 'down') {
              nextIndex = currentIndex < groupElements.length - 1 ? currentIndex + 1 :
                         (group.wrapAround ? 0 : -1);
            }
          }
          
          if (nextIndex !== -1) {
            focusElement(groupElements[nextIndex].id);
            return;
          }
        }
      }
    }

    // Enhanced section-to-section navigation for up/down movements
    if (direction === 'up' || direction === 'down') {
      const currentSection = currentElement.element.closest('[data-section]');
      if (currentSection) {
        const allSections = Array.from(document.querySelectorAll('[data-section]'));
        const currentSectionIndex = allSections.indexOf(currentSection);
        
        if (currentSectionIndex !== -1) {
          const nextSectionIndex = direction === 'down' ? 
            currentSectionIndex + 1 : currentSectionIndex - 1;
          
          if (nextSectionIndex >= 0 && nextSectionIndex < allSections.length) {
            const nextSection = allSections[nextSectionIndex];
            const nextSectionElements = Array.from(nextSection.querySelectorAll('[data-focusable-id]')) as HTMLElement[];
            
            if (nextSectionElements.length > 0) {
              // Find the first focusable element in the next section
              const targetElement = nextSectionElements[0];
              const targetId = targetElement.getAttribute('data-focusable-id');
              
              if (targetId) {
                focusElement(targetId);
                return;
              }
            }
          }
        }
      }
    }

    // If no group movement or reached group boundary, find global candidate
    const bestCandidate = findBestCandidate(currentElement, direction);
    if (bestCandidate) {
      focusElement(bestCandidate.id);
    }
  }, [currentFocusId, elements, groups, focusElement]);

  const selectCurrent = useCallback(() => {
    if (currentFocusId) {
      const element = elements.get(currentFocusId);
      if (element && !element.disabled) {
        element.onSelect?.();
        element.element.click();
      }
    }
  }, [currentFocusId, elements]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          moveFocus('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          moveFocus('down');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          moveFocus('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          moveFocus('right');
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
  }, [moveFocus, selectCurrent]);

  // Set initial focus when elements are available
  useEffect(() => {
    if (!isInitialized && elements.size > 0) {
      const focusId = initialFocusRef.current || Array.from(elements.keys())[0];
      if (elements.has(focusId)) {
        focusElement(focusId);
        setIsInitialized(true);
      }
    }
  }, [elements, focusElement, isInitialized]);

  const value = {
    currentFocusId,
    registerElement,
    unregisterElement,
    registerGroup,
    unregisterGroup,
    focusElement,
    moveFocus,
    selectCurrent,
    setInitialFocus,
  };

  return (
    <TVNavigationContext.Provider value={value}>
      {children}
    </TVNavigationContext.Provider>
  );
};
