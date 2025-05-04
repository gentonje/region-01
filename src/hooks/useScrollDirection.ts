
import { useState, useEffect } from 'react';

export enum ScrollDirection {
  UP = 'up',
  DOWN = 'down',
  NONE = 'none',
}

export function useScrollDirection(threshold = 10) {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(ScrollDirection.NONE);
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = Math.abs(currentScrollY - prevScrollY);
      
      // Set isAtTop flag
      setIsAtTop(currentScrollY < 10);
      
      // Check if we've scrolled more than the threshold
      if (scrollDifference < threshold) {
        return;
      }

      // Determine scroll direction
      const newScrollDirection = 
        currentScrollY > prevScrollY ? ScrollDirection.DOWN : ScrollDirection.UP;

      setScrollDirection(newScrollDirection);
      setPrevScrollY(currentScrollY);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [prevScrollY, threshold]);

  return { scrollDirection, isAtTop };
}
