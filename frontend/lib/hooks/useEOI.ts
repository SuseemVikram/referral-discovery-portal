/**
 * useEOI Hook
 * Handles sending Expression of Interest
 */
'use client';

import { useState } from 'react';
import { eoiApi, SendEOIRequest } from '../api/services/eoi.api';

export function useEOI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendEOI = async (candidateIds: string[], filterRoles?: string[], filterSkills?: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const data: SendEOIRequest = { 
        candidate_ids: candidateIds,
        filter_roles: filterRoles && filterRoles.length > 0 ? filterRoles : undefined,
        filter_skills: filterSkills && filterSkills.length > 0 ? filterSkills : undefined,
      };
      const result = await eoiApi.sendEOI(data);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send EOI');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendEOI,
    loading,
    error,
  };
}

