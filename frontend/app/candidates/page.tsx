'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/AuthContext';
import { useCandidates } from '@/lib/hooks/useCandidates';
import { useEOI } from '@/lib/hooks/useEOI';
import { candidatesApi, Candidate } from '@/lib/api/services/candidates.api';
import Filters from './components/Filters';

export default function CandidatesPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [filters, setFilters] = useState<{
    roles: string[];
    skills: string[];
    location: string;
    availability_status: '' | 'Open' | 'Paused';
  }>({
    roles: [],
    skills: [],
    location: '',
    availability_status: '',
  });

  // Convert filters to hook format (memoized to prevent unnecessary re-renders)
  const hookFilters = useMemo(() => ({
    roles: filters.roles.length > 0 ? filters.roles : undefined,
    skills: filters.skills.length > 0 ? filters.skills : undefined,
    location: filters.location || undefined,
    availability_status: filters.availability_status || undefined,
    page: 1,
    limit: 12, // Fixed limit for consistency
  }), [filters]);

  const { candidates, pagination, loading, error, updateFilters, refetch } = useCandidates(hookFilters);
  const { sendEOI, loading: sending } = useEOI();

  // Handler for filter changes
  const handleFiltersChange = (newFilters: {
    roles: string[];
    skills: string[];
    location: string;
    availability_status: '' | 'Open' | 'Paused';
  }) => {
    setFilters(newFilters);
  };

  // Restore pending EOI selection
  useEffect(() => {
    const pendingEOI = sessionStorage.getItem('pendingEOI');
    if (pendingEOI) {
      try {
        const savedIds = JSON.parse(pendingEOI);
        if (Array.isArray(savedIds) && savedIds.length > 0) {
          setSelectedIds(new Set(savedIds));
        }
      } catch (error) {
        // Silently fail - selection restoration is not critical
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to restore selection:', error);
        }
      }
    }
  }, []);

  // Update hook filters when local filters change (with debouncing for location)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilters({
        roles: filters.roles.length > 0 ? filters.roles : undefined,
        skills: filters.skills.length > 0 ? filters.skills : undefined,
        location: filters.location || undefined,
        availability_status: filters.availability_status || undefined,
        page: 1,
        limit: 12,
      });
      setCurrentPage(1);
      setAllCandidates([]);
    }, filters.location ? 500 : 0); // Debounce location input, immediate for others

    return () => clearTimeout(timeoutId);
  }, [filters, updateFilters]);

  // Update allCandidates when hook data changes (memoized to prevent unnecessary updates)
  useEffect(() => {
    if (candidates.length > 0 && currentPage === 1) {
      setAllCandidates(candidates);
    }
  }, [candidates, currentPage]);

  const handleLoadMore = async () => {
    // If not logged in, redirect to login
    if (!isLoggedIn) {
      // Save current selection before redirecting
      if (selectedIds.size > 0) {
        sessionStorage.setItem('pendingEOI', JSON.stringify(Array.from(selectedIds)));
      }
      router.push('/login');
      return;
    }

    if (!pagination?.hasMore || loadingMore) return;

    setLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const result = await candidatesApi.getCandidates({
        roles: filters.roles.length > 0 ? filters.roles : undefined,
        skills: filters.skills.length > 0 ? filters.skills : undefined,
        location: filters.location || undefined,
        availability_status: filters.availability_status || undefined,
        page: nextPage,
        limit: 12,
      });
      
      setAllCandidates(prev => [...prev, ...result.candidates]);
      setCurrentPage(nextPage);
    } catch (error) {
      // Error is already handled by toast in the component
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load more candidates:', error);
      }
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCheckboxChange = (candidateId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(candidateId)) {
        next.delete(candidateId);
      } else {
        next.add(candidateId);
      }
      return next;
    });
  };

  const handleClearAll = () => {
    setSelectedIds(new Set());
    sessionStorage.removeItem('pendingEOI');
  };

  const handleSendInterest = () => {
    if (!isLoggedIn) {
      if (selectedIds.size > 0) {
        sessionStorage.setItem('pendingEOI', JSON.stringify(Array.from(selectedIds)));
      }
      router.push('/login');
      return;
    }

    if (selectedIds.size === 0) {
      toast.error('Please select at least one candidate');
      return;
    }

    // Check if profile is incomplete
    if (!user?.company || !user?.role || user.company.trim() === '' || user.role.trim() === '') {
      toast.error('Please complete your profile (company and role are required) before sending interest. Redirecting to account page...');
      setTimeout(() => {
        router.push('/account');
      }, 1500);
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const handleConfirmSend = async () => {
    setShowConfirmModal(false);

    try {
      const result = await sendEOI(
        Array.from(selectedIds),
        filters.roles.length > 0 ? filters.roles : undefined,
        filters.skills.length > 0 ? filters.skills : undefined
      );
      toast.success(`Successfully sent referral to ${result.sent} candidate(s). Your contact details have been shared with them.`);
      setSelectedIds(new Set());
      sessionStorage.removeItem('pendingEOI');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send interest');
    }
  };

  const selectedCount = selectedIds.size;

  return (
    <>
      <div className="min-h-[calc(100vh-4rem)] p-6 pb-28">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="page-header">
            <h1 className="page-title">Browse Candidates</h1>
            <span className="text-sm text-slate-500">
              {loading ? '...' : pagination ? `Showing ${allCandidates.length} of ${pagination.total}` : `${allCandidates.length} candidates`}
            </span>
          </div>

          <div className="flex gap-6">
            {/* Sidebar Filters */}
            <div className="w-72 flex-shrink-0">
              <Filters 
                filters={filters} 
                onChange={handleFiltersChange} 
              />
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {loading ? (
                <div className="card">
                  <div className="empty-state">
                    <div className="spinner mx-auto" />
                    <p className="mt-4 text-slate-500 text-sm">Loading candidates...</p>
                  </div>
                </div>
              ) : allCandidates.length === 0 ? (
                <div className="card">
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="empty-state-title">No candidates found</p>
                    <p className="empty-state-text">Try adjusting your filters</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {allCandidates.map((candidate) => {
                      const isSelected = selectedIds.has(candidate.id);
                      return (
                        <div
                          key={candidate.id}
                          onClick={() => handleCheckboxChange(candidate.id)}
                          className={`group bg-white border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 ${
                            isSelected 
                              ? 'border-orange-500 bg-orange-50/30 shadow-lg shadow-orange-500/10' 
                              : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'
                          }`}
                        >
                          <div className="flex gap-4">
                            {/* Checkbox Column */}
                            <div className="flex items-start pt-0.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleCheckboxChange(candidate.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-5 h-5 rounded border-2 border-slate-300 text-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-0 cursor-pointer"
                              />
                            </div>
                            
                            {/* Avatar Column */}
                            <div className="flex-shrink-0">
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 border-2 border-orange-200 flex items-center justify-center shadow-sm">
                                <span className="text-base font-bold text-orange-700">
                                  {candidate.first_name.charAt(0)}{candidate.last_name_initial}
                                </span>
                              </div>
                            </div>
                            
                            {/* Main Content Column */}
                            <div className="flex-1 min-w-0">
                              {/* Header: Name, Location, Status */}
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <Link 
                                      href={`/candidates/${candidate.id}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="font-bold text-lg text-slate-900 hover:text-orange-600 transition-colors"
                                    >
                                      {candidate.first_name} {candidate.last_name_initial}.
                                    </Link>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="text-slate-500">{candidate.location}</span>
                                    {candidate.remote_ok && (
                                      <>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-emerald-600 font-medium">Remote OK</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {/* Status Badge */}
                                <span className={`flex-shrink-0 px-3 py-1 text-xs font-semibold rounded-full ${
                                  candidate.availability_status === 'Open'
                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}>
                                  {candidate.availability_status}
                                </span>
                              </div>
                              
                              {/* Roles */}
                              {candidate.target_roles.length > 0 && (
                                <div className="mb-3">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {candidate.target_roles.slice(0, 3).map((role: string, idx: number) => (
                                      <span 
                                        key={idx} 
                                        className="inline-flex px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-md border border-slate-200"
                                      >
                                        {role}
                                      </span>
                                    ))}
                                    {candidate.target_roles.length > 3 && (
                                      <span className="text-xs text-slate-400 font-medium">
                                        +{candidate.target_roles.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {/* Skills */}
                              {candidate.primary_skills.length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {candidate.primary_skills.slice(0, 5).map((skill: string, idx: number) => (
                                    <span 
                                      key={idx} 
                                      className="inline-flex px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                  {candidate.primary_skills.length > 5 && (
                                    <span className="text-xs text-slate-400 font-medium">
                                      +{candidate.primary_skills.length - 5} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Load More Section */}
                  {pagination && pagination.hasMore && (
                    <div className="mt-8 text-center">
                      <div className="mb-3 text-sm text-slate-500">
                        Showing {allCandidates.length} of {pagination.total} candidates
                      </div>
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="btn btn-secondary px-8 py-3"
                      >
                        {loadingMore ? (
                          <>
                            <div className="spinner !w-4 !h-4" />
                            Loading...
                          </>
                        ) : isLoggedIn ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            Load More Candidates
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            Sign in to see more
                          </>
                        )}
                      </button>
                      {!isLoggedIn && (
                        <p className="mt-2 text-xs text-slate-400">
                          Create a free account to browse all {pagination.total} candidates
                        </p>
                      )}
                    </div>
                  )}

                  {/* All loaded message */}
                  {pagination && !pagination.hasMore && allCandidates.length > 0 && (
                    <div className="mt-8 text-center text-sm text-slate-500">
                      You&apos;ve seen all {pagination.total} candidates
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selection Action Bar */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-orange-700">{selectedCount}</span>
                </div>
                <span className="font-medium text-slate-900">
                  candidate{selectedCount !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Floating Notification - Only show when logged in */}
                {isLoggedIn && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
                    <svg className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-blue-900 whitespace-nowrap">
                      <span className="font-semibold">Note:</span> Contact details will be shared
                    </p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleClearAll}
                    disabled={sending}
                    className="btn btn-secondary"
                  >
                    Clear selection
                  </button>
                  <button
                    onClick={handleSendInterest}
                    disabled={sending}
                    className="btn btn-primary"
                  >
                    {sending ? (
                      <>
                        <div className="spinner !w-4 !h-4 !border-white !border-t-transparent" />
                        Sending...
                      </>
                    ) : (
                      'Send Interest'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">Send Interest?</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Send to {selectedCount} candidate{selectedCount !== 1 ? 's' : ''}?
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                Your contact details (name, company, role, email, LinkedIn) will be shared with the selected candidate{selectedCount !== 1 ? 's' : ''}. They can reach out to you directly to take the conversation forward.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={sending}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSend}
                disabled={sending}
                className="flex-1 btn btn-primary"
              >
                {sending ? (
                  <>
                    <div className="spinner !w-4 !h-4 !border-white !border-t-transparent" />
                    Sending...
                  </>
                ) : (
                  'Send Interest'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
