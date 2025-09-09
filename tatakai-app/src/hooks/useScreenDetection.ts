'use client';

import { useState, useEffect } from 'react';

export interface ScreenInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTV: boolean;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'tv';
  effectiveDeviceType: 'mobile' | 'tablet' | 'desktop' | 'tv';
}

export const useScreenDetection = (): ScreenInfo => {
  const [screenInfo, setScreenInfo] = useState<ScreenInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isTV: false,
    width: 0,
    height: 0,
    orientation: 'portrait',
    deviceType: 'desktop',
    effectiveDeviceType: 'desktop'
  });

  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const orientation = width > height ? 'landscape' : 'portrait';
      
      // TV detection: More comprehensive approach
      // 1. Large screens with wide aspect ratios
      // 2. User agent detection for TV browsers
      // 3. Screen characteristics typical of TVs
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isWebOS = userAgent.includes('webos') || userAgent.includes('netcast');
      const isTizen = userAgent.includes('tizen') || userAgent.includes('smart-tv');
      const isAndroidTV = userAgent.includes('android') && userAgent.includes('tv');
      const isSmartTV = userAgent.includes('smarttv') || userAgent.includes('smart tv');
      const isTVUserAgent = isWebOS || isTizen || isAndroidTV || isSmartTV;
      
      // Large screen detection (more conservative for testing)
      const isLargeScreen = width >= 1920 && orientation === 'landscape' && (width / height >= 1.6);
      
      // TV detection prioritizes user agent detection
      const isTV = isTVUserAgent || (isLargeScreen && !window.navigator.userAgent.includes('Chrome'));
      
      // Mobile: screens smaller than 768px
      const isMobile = width < 768;
      
      // Tablet: screens between 768px and 1024px
      const isTablet = width >= 768 && width < 1024;
      
      // Desktop: screens 1024px and above (but not TV)
      const isDesktop = width >= 1024 && !isTV;

      // Determine device type
      let deviceType: 'mobile' | 'tablet' | 'desktop' | 'tv' = 'desktop';
      if (isTV) {
        deviceType = 'tv';
      } else if (isMobile) {
        deviceType = 'mobile';
      } else if (isTablet) {
        deviceType = 'tablet';
      } else {
        deviceType = 'desktop';
      }

      setScreenInfo({
        isMobile,
        isTablet,
        isDesktop,
        isTV,
        width,
        height,
        orientation,
        deviceType,
        effectiveDeviceType: deviceType
      });
    };

    // Initialize
    updateScreenInfo();

    // Add event listener
    window.addEventListener('resize', updateScreenInfo);
    window.addEventListener('orientationchange', updateScreenInfo);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateScreenInfo);
      window.removeEventListener('orientationchange', updateScreenInfo);
    };
  }, []);

  return screenInfo;
};
