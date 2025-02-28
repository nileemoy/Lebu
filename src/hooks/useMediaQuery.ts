
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState<boolean>(false);
  
    useEffect(() => {
      const media = window.matchMedia(query);
      
      const handleChange = () => {
        setMatches(media.matches);
      };
      
      // Set initial value
      handleChange();
      
      // Listen for changes
      media.addEventListener('change', handleChange);
      
      return () => {
        media.removeEventListener('change', handleChange);
      };
    }, [query]);
  
    return matches;
  }