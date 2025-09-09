// Utility to force TV mode for testing and development
export const enableTVMode = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('device-preference', 'tv');
    window.location.reload();
  }
};

export const disableTVMode = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('device-preference');
    window.location.reload();
  }
};

export const isTVMode = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('device-preference') === 'tv';
  }
  return false;
};

// Add to window for easy console access
if (typeof window !== 'undefined') {
  (window as typeof window & {
    enableTVMode: typeof enableTVMode;
    disableTVMode: typeof disableTVMode;
    isTVMode: typeof isTVMode;
  }).enableTVMode = enableTVMode;
  (window as typeof window & {
    enableTVMode: typeof enableTVMode;
    disableTVMode: typeof disableTVMode;
    isTVMode: typeof isTVMode;
  }).disableTVMode = disableTVMode;
  (window as typeof window & {
    enableTVMode: typeof enableTVMode;
    disableTVMode: typeof disableTVMode;
    isTVMode: typeof isTVMode;
  }).isTVMode = isTVMode;
}
