'use client';

import { useAuth } from '@/lib/AuthContext';

export default function ContactDetailsNote() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full mb-3">
      <svg className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-xs text-blue-900 whitespace-nowrap">
        <span className="font-semibold">Note:</span> Contact details will be shared
      </p>
    </div>
  );
}
