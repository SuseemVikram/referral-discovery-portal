'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { adminApi } from '@/lib/api/services/admin.api';
import { isAuthError } from '@/lib/types/errors';

interface AdminVisibilityToggleProps {
  candidateId: string;
  isActive: boolean;
  onChange?: (newState: boolean) => void;
}

export default function AdminVisibilityToggle({
  candidateId,
  isActive,
  onChange,
}: AdminVisibilityToggleProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await adminApi.updateCandidateVisibility(candidateId, !isActive);

      if (onChange) {
        onChange(!isActive);
      }
    } catch (err) {
      if (err instanceof Error && isAuthError(err)) {
        router.push('/login');
        return;
      }
      setError('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex flex-col">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`relative min-w-[72px] h-8 px-3 text-xs font-medium rounded-lg ${
          isActive
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-slate-100 text-slate-600'
        } disabled:cursor-wait`}
      >
        {/* Text - hidden during loading but keeps space */}
        <span className={loading ? 'invisible' : ''}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
        
        {/* Spinner - absolutely positioned in center */}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${
              isActive ? 'border-emerald-600' : 'border-slate-500'
            }`} />
          </span>
        )}
      </button>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
