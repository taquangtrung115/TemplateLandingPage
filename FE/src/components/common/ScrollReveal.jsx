import React, { useEffect, useRef, useState } from 'react';
import { getAnimationClass } from '../../utils/animationConstants';

export const ScrollReveal = ({
  animation = 'fade-up',
  delay = 0,
  duration = 750,
  threshold = 0.1,
  className = '',
  children,
  style = {},
  fallbackDelay = 500,
}) => {
  const [isVisible, setIsVisible] = useState(animation === 'none');
  const domRef = useRef(null);

  useEffect(() => {
    if (animation === 'none') {
      setIsVisible(true);
      return;
    }

    // Fallback timer đảm bảo preview trong container cuộn không bị trắng/mất chữ
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, fallbackDelay);

    let observer;
    try {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              clearTimeout(timer);
              if (domRef.current && observer) {
                observer.unobserve(domRef.current);
              }
            }
          });
        },
        {
          threshold,
          rootMargin: '0px 0px -30px 0px',
        }
      );

      if (domRef.current) {
        observer.observe(domRef.current);
      }
    } catch {
      setIsVisible(true);
    }

    return () => {
      clearTimeout(timer);
      if (observer && domRef.current) {
        observer.unobserve(domRef.current);
      }
    };
  }, [animation, threshold, fallbackDelay]);

  const animClass = getAnimationClass(animation, isVisible);

  return (
    <div
      ref={domRef}
      className={`reveal-transition ${animClass} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
        animationDelay: `${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
