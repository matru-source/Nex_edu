import { useEffect } from "react";

export const useInterceptBackButton = (onBack: () => void) => {
  useEffect(() => {
    const listener = (e: PopStateEvent) => {
      e.preventDefault();
      onBack();
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', listener);
    window.history.pushState(null, '', window.location.href);

    return () => window.removeEventListener('popstate', listener);
  }, [onBack]);
};

