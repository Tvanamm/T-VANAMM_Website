
import React, { useState, useEffect, useRef } from 'react';

interface CountingNumberProps {
  target: number;
  suffix?: string;
  duration?: number;
  isDecimal?: boolean;
}

const CountingNumber: React.FC<CountingNumberProps> = ({ 
  target, 
  suffix = '', 
  duration = 3000, // Increased from 2000 to 3000ms
  isDecimal = false 
}) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true);
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of the element is visible
        rootMargin: '0px 0px -50px 0px' // Trigger a bit before the element is fully visible
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentCount = target * easeOutCubic;
      
      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [target, duration, hasStarted]);

  const formatNumber = (num: number) => {
    if (isDecimal) {
      return num.toFixed(1);
    }
    return Math.floor(num).toLocaleString();
  };

  return (
    <span ref={elementRef} className="tabular-nums">
      {formatNumber(count)}{suffix}
    </span>
  );
};

export default CountingNumber;
