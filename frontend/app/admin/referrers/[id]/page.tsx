'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { adminApi } from '@/lib/api/services/admin.api';
import { isAuthError } from '@/lib/types/errors';

interface ReferrerDetail {
  id: string;
  email: string;
  full_name: string;
  company: string;
  role: string;
  linkedin: string | null;
  phone_number: string | null;
  is_admin: boolean;
  createdAt: string;
  updatedAt: string;
  eoiCount: number;
}

export default function ReferrerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoggedIn } = useAuth();
  const [referrer, setReferrer] = useState<ReferrerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const referrerId = params?.id as string;

  useEffect(() => {
    async function loadReferrer() {
      if (!isLoggedIn) {
        router.push('/login');
        return;
      }

      if (!referrerId) {
        setError('Invalid referrer ID');
        setLoading(false);
        return;
      }

      try {
        const data = await adminApi.getReferrerById(referrerId);
        setReferrer(data.referrer);
      } catch (err) {
        if (err instanceof Error && isAuthError(err)) {
          router.push('/login');
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load referrer');
      } finally {
        setLoading(false);
      }
    }
    loadReferrer();
  }, [isLoggedIn, referrerId, router]);

  if (loading) {
    return (
      <div className="min-h-[calc(100dvh-4rem)] min-h-[calc(100vh-4rem)] p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="card">
            <div className="empty-state">
              <div className="spinner mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !referrer) {
    return (
      <div className="min-h-[calc(100dvh-4rem)] min-h-[calc(100vh-4rem)] p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/admin/referrers"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Referrers
          </Link>
          <div className="alert alert-error">{error || 'Referrer not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] min-h-[calc(100vh-4rem)] p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/admin/referrers"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6 min-h-[44px] items-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Referrers
        </Link>

        <div className="card overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">{referrer.full_name}</h1>
              {referrer.is_admin && (
                <span className="badge badge-orange !px-3 !py-1.5">Admin</span>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Email
                </label>
                <p className="text-slate-900">{referrer.email}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Company
                </label>
                <p className="text-slate-900">{referrer.company || '-'}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Role
                </label>
                <p className="text-slate-900">{referrer.role || '-'}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Phone Number
                </label>
                <p className="text-slate-900">{referrer.phone_number || '-'}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  LinkedIn
                </label>
                {referrer.linkedin ? (
                  <a
                    href={referrer.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    View Profile
                  </a>
                ) : (
                  <p className="text-slate-500">Not provided</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  EOIs Sent
                </label>
                <p className="text-slate-900 font-semibold">{referrer.eoiCount}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Joined
                </label>
                <p className="text-slate-900">{new Date(referrer.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Last Updated
                </label>
                <p className="text-slate-900">{new Date(referrer.updatedAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
