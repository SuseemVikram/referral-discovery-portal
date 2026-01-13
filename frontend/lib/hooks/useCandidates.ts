/**
 * useCandidates Hook
 * Fetches candidates with filters and pagination
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { candidatesApi, CandidateFilters, CandidatesResponse } from '../api/services/candidates.api';

export function useCandidates(initialFilters: CandidateFilters = {}) {
  const [data, setData] = useState<CandidatesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<CandidateFilters>(initialFilters);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await candidatesApi.getCandidates(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch candidates'));
      setData(null); // Clear data on error
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const updateFilters = useCallback((newFilters: Partial<CandidateFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const refetch = useCallback(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  return {
    data,
    candidates: data?.candidates || [],
    pagination: data?.pagination,
    loading,
    error,
    filters,
    updateFilters,
    refetch,
  };
}

