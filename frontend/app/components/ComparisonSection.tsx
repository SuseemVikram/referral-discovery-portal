'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function ComparisonSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [ourProgress, setOurProgress] = useState(0);
  const [othersProgress, setOthersProgress] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          
          // Animate our progress to 100% (faster)
          let ourCurrent = 0;
          const ourInterval = setInterval(() => {
            ourCurrent += 2.5;
            if (ourCurrent >= 100) {
              ourCurrent = 100;
              clearInterval(ourInterval);
            }
            setOurProgress(ourCurrent);
          }, 16);

          // Animate others progress to 68% (slower)
          let othersCurrent = 0;
          const othersInterval = setInterval(() => {
            othersCurrent += 0.85;
            if (othersCurrent >= 68) {
              othersCurrent = 68;
              clearInterval(othersInterval);
            }
            setOthersProgress(othersCurrent);
          }, 25);
        }
      },
      { threshold: 0.2 }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasAnimated]);

  return (
    <section ref={sectionRef} className="py-12 bg-[#0a0a12] relative overflow-hidden flex items-center justify-center min-h-[300px]">
      <div className="max-w-md mx-auto px-6 w-full">
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xl animate-float">
          {/* Header */}
          <div className="mb-3">
            <h2 className="text-base font-bold text-slate-900 mb-0.5">
              Placement Success Rate
            </h2>
            <p className="text-slate-500 text-[10px]">
              Verified vs traditional sources
            </p>
          </div>

          {/* Comparison Bars */}
          <div className="space-y-2.5 mb-3">
            {/* Our Platform */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-sm shadow-orange-500/30">
                    <span className="text-white font-bold text-[8px]">R</span>
                  </div>
                  <span className="text-slate-900 font-medium text-[11px]">Our Platform</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-pink-500 font-medium">
                    Verified
                  </span>
                  <svg className="w-2.5 h-2.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                  </svg>
                </div>
              </div>
              <div className="relative h-2 bg-slate-100 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-orange-500 to-orange-600 rounded transition-all duration-1000 ease-out"
                  style={{ width: `${ourProgress}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-end pr-1">
                  <span className="text-[8px] font-semibold text-slate-700">
                    {Math.round(ourProgress)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Others */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-slate-300 flex items-center justify-center">
                    <span className="text-slate-600 font-semibold text-[8px]">O</span>
                  </div>
                  <span className="text-slate-600 font-medium text-[11px]">Other Sources</span>
                </div>
                <span className="text-[9px] text-slate-500">
                  Unverified
                </span>
              </div>
              <div className="relative h-2 bg-slate-100 rounded overflow-hidden">
                <div
                  className="h-full bg-slate-300 rounded transition-all duration-1500 ease-out"
                  style={{ width: `${othersProgress}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-end pr-1">
                  <span className="text-[8px] font-semibold text-slate-500">
                    {Math.round(othersProgress)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Link
              href="/candidates"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-medium rounded-md transition-all hover:scale-105 hover:shadow-md hover:shadow-orange-500/30"
            >
              Browse Candidates
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

