'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { adminApi } from '@/lib/api/services/admin.api';
import { isAuthError } from '@/lib/types/errors';

interface AdminAvailabilitySelectProps {
  candidateId: string;
  availability: 'Open' | 'Paused';
  onChange?: (newStatus: 'Open' | 'Paused') => void;
}

export default function AdminAvailabilitySelect({
  candidateId,
  availability,
  onChange,
}: AdminAvailabilitySelectProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isLoggedIn } = useAuth();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as 'Open' | 'Paused';
    
    if (newStatus === availability) {
      return;
    }

    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    if (onChange) {
      onChange(newStatus);
    }

    try {
      await adminApi.updateCandidateAvailability(candidateId, newStatus);
    } catch (err) {
      if (err instanceof Error && isAuthError(err)) {
        router.push('/login');
        return;
      }
      setError('Update failed');
      if (onChange) {
        onChange(availability);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <select
        value={availability}
        onChange={handleChange}
        disabled={loading}
        className={`min-w-[80px] h-8 px-2 text-xs font-medium border rounded-lg cursor-pointer ${
          availability === 'Open'
            ? 'bg-orange-50 border-orange-200 text-orange-700'
            : 'bg-slate-50 border-slate-200 text-slate-600'
        } disabled:opacity-70 disabled:cursor-wait focus:outline-none focus:ring-2 focus:ring-blue-500`}
      >
        <option value="Open">Open</option>
        <option value="Paused">Paused</option>
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
