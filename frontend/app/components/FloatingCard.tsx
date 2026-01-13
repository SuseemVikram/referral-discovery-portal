'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function FloatingCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          // Reset when out of view so it can animate again
          setIsVisible(false);
        }
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div ref={cardRef} className="max-w-4xl mx-auto relative">
      <div
        className={`
          bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 
          flex flex-col md:flex-row items-center justify-between gap-6
          transition-all duration-700 ease-out
          ${isVisible 
            ? 'opacity-100 translate-y-0 shadow-2xl' 
            : 'opacity-0 translate-y-12 shadow-none'
          }
        `}
        style={{
          // Floating shadow effect when visible
          boxShadow: isVisible 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)' 
            : 'none'
        }}
      >
        {/* Left side - For Referrers */}
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">Start Referring</span>
              <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">Free</span>
            </div>
            <div className="text-sm text-slate-500">Find verified candidates for your company</div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="hidden md:block w-px h-12 bg-slate-200" />
        
        {/* Right side - Quick Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/candidates"
            className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            Browse Candidates
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

