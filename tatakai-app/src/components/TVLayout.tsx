'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useScreenDetection } from '@/hooks/useScreenDetection';
import { NavigationProvider } from '@/components/tv/NavigationProvider';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface TVLayoutProps {
  children: React.ReactNode;
}

const TVLayout: React.FC<TVLayoutProps> = ({ children }) => {
  const { effectiveDeviceType } = useScreenDetection();
  const pathname = usePathname();
  
  // Check if we're on a watch page where navbar should be hidden
  const isWatchPage = pathname?.includes('/watch/');

  // TV layout without navbar for cleaner experience
  if (effectiveDeviceType === 'tv') {
    return (
      <div className="tv-layout min-h-screen bg-background text-foreground" data-device-type="tv">
        <main className="tv-main-content w-full h-full">
          {children}
        </main>
      </div>
    );
  }

  // Regular layout for non-TV devices
  return (
    <div data-device-type={effectiveDeviceType} className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="main-content pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default TVLayout;
