import { useState } from 'react';
import { X, Download, Smartphone, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function AppDownloadBanner() {
  const [isVisible, setIsVisible] = useState(() => {
    // Check if user has dismissed the banner before
    const dismissed = localStorage.getItem('app-download-banner-dismissed');
    return !dismissed;
  });
  const navigate = useNavigate();

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('app-download-banner-dismissed', 'true');
  };

  const handleLearnMore = () => {
    navigate('/download');
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="relative mb-8 overflow-hidden rounded-2xl"
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20" />
        <div className="absolute inset-0 backdrop-blur-xl bg-card/80" />
        
        {/* Content */}
        <div className="relative px-6 py-4 md:py-5">
          <div className="flex items-center justify-between gap-4">
            {/* Left Side - Icons and Text */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* App Icons */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                  <Monitor className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm md:text-base flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary sm:hidden" />
                  <span>Download Tatakai Apps</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-xs font-medium">
                    Coming Soon
                  </span>
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground truncate">
                  Native apps for Android & Windows in development
                </p>
              </div>
            </div>

            {/* Right Side - Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleLearnMore}
                className="px-3 md:px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                Learn More
              </button>
              <button
                onClick={handleDismiss}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />
      </motion.div>
    </AnimatePresence>
  );
}
