'use client';

import { useEffect, useState, RefObject } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

function useIntersectionObserver(
  elementRef: RefObject<Element>,
  options: UseIntersectionObserverOptions = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  const {
    threshold = 0.1,
    root = null,
    rootMargin = '50px',
    freezeOnceVisible = true,
    ...restOptions
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // If already been visible and freeze is enabled, don't observe
    if (hasBeenVisible && freezeOnceVisible) {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        setIsIntersecting(isElementIntersecting);

        if (isElementIntersecting && !hasBeenVisible) {
          setHasBeenVisible(true);
        }
      },
      {
        threshold,
        root,
        rootMargin,
        ...restOptions
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, threshold, root, rootMargin, hasBeenVisible, freezeOnceVisible, restOptions]);

  return isIntersecting || (hasBeenVisible && freezeOnceVisible);
}

export default useIntersectionObserver;