'use client';

import { useState, useEffect } from 'react';
import { useScrollAnimation } from '@/lib/useScrollAnimation';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'reveal' | 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'fade';
  delay?: number;
  threshold?: number;
}

export default function AnimatedSection({
  children,
  className = '',
  animation = 'reveal',
  delay = 0,
  threshold = 0.1,
}: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold });

  const baseClasses = 'transition-all duration-600 ease-out';
  
  // Animations that feel natural when scrolling DOWN
  const animations = {
    'reveal': {
      // Subtle scale + fade - feels like content is revealing/appearing
      hidden: 'opacity-0 scale-[0.97]',
      visible: 'opacity-100 scale-100',
    },
    'fade-up': {
      // Content slides up slightly as it appears (subtle)
      hidden: 'opacity-0 translate-y-4',
      visible: 'opacity-100 translate-y-0',
    },
    'fade-down': {
      // Content drops down into place - natural for scrolling
      hidden: 'opacity-0 -translate-y-4',
      visible: 'opacity-100 translate-y-0',
    },
    'fade-left': {
      hidden: 'opacity-0 translate-x-6',
      visible: 'opacity-100 translate-x-0',
    },
    'fade-right': {
      hidden: 'opacity-0 -translate-x-6',
      visible: 'opacity-100 translate-x-0',
    },
    'scale': {
      hidden: 'opacity-0 scale-90',
      visible: 'opacity-100 scale-100',
    },
    'fade': {
      hidden: 'opacity-0',
      visible: 'opacity-100',
    },
  };

  const animState = isVisible ? animations[animation].visible : animations[animation].hidden;
  const delayStyle = delay > 0 ? { transitionDelay: `${delay}ms` } : {};

  return (
    <div
      ref={ref}
      className={`${baseClasses} ${animState} ${className}`}
      style={delayStyle}
    >
      {children}
    </div>
  );
}

// Animated counter component for stats
interface AnimatedCounterProps {
  end: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  end,
  suffix = '',
  duration = 2000,
  className = '',
}: AnimatedCounterProps) {
  const { ref, isVisible } = useScrollAnimation<HTMLSpanElement>({ threshold: 0.5 });
  
  return (
    <span ref={ref} className={className}>
      {isVisible ? (
        <CounterAnimation end={end} duration={duration} suffix={suffix} />
      ) : (
        '0' + suffix
      )}
    </span>
  );
}

function CounterAnimation({
  end,
  duration,
  suffix,
}: {
  end: number;
  duration: number;
  suffix: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));

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
  }, [end, duration]);

  return <>{count}{suffix}</>;
}

