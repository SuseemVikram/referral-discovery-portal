'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/AuthContext';
import { adminApi } from '@/lib/api/services/admin.api';

interface AnalyticsData {
  summary: {
    totalEOIs: number;
    totalCandidates: number;
    totalReferrers: number;
    activeCandidates: number;
    periodEOIs: number;
    periodDays: number;
  };
  topCandidates: {
    id: string;
    name: string;
    roles: string[];
    skills: string[];
    availability: string;
    isActive: boolean;
    eoiCount: number;
  }[];
  topSkills: { skill: string; count: number }[];
  topRoles: { role: string; count: number }[];
  topReferrers: { id: string; name: string; company: string; eoiCount: number }[];
  eoiTrend: { date: string; count: number }[];
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30');
  const [exporting, setExporting] = useState(false);

  const loadAnalytics = async (days: string) => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await adminApi.getAnalytics(days);
      setData(result);
    } catch (err) {
      if (err instanceof Error && ((err as any).status === 401 || (err as any).status === 403)) {
        router.push('/login');
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics(dateRange);
  }, [dateRange, isLoggedIn]);

  const handleDateRangeChange = (days: string) => {
    setDateRange(days);
  };

  const handleExport = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    setExporting(true);

    try {
      const blob = await adminApi.exportAnalytics(dateRange);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Analytics report exported successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="page-title mb-6">Analytics</h1>
          <div className="card">
            <div className="empty-state">
              <div className="spinner mx-auto" />
              <p className="mt-4 text-slate-500 text-sm">Loading analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="page-title mb-6">Analytics</h1>
          <div className="alert alert-error">{error}</div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxSkillCount = Math.max(...data.topSkills.map((s) => s.count), 1);
  const maxRoleCount = Math.max(...data.topRoles.map((r) => r.count), 1);
  const maxTrendCount = Math.max(...data.eoiTrend.map((t) => t.count), 1);

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Analytics</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Time Range:</span>
              <select
                value={dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="input !w-auto !py-2"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="btn btn-primary"
            >
              {exporting ? (
                <>
                  <div className="spinner !w-4 !h-4 !border-white !border-t-transparent" />
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-5">
            <p className="text-sm text-slate-500 mb-1">Total EOIs</p>
            <p className="text-3xl font-bold text-slate-900">{data.summary.totalEOIs.toLocaleString()}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-slate-500 mb-1">Total Candidates</p>
            <p className="text-3xl font-bold text-slate-900">{data.summary.totalCandidates.toLocaleString()}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-slate-500 mb-1">Active Referrers</p>
            <p className="text-3xl font-bold text-slate-900">{data.summary.totalReferrers.toLocaleString()}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-slate-500 mb-1">EOIs ({data.summary.periodDays}d)</p>
            <p className="text-3xl font-bold text-slate-900">{data.summary.periodEOIs.toLocaleString()}</p>
          </div>
        </div>

        {/* EOI Trend Chart */}
        <div className="card p-6 mb-8">
          <h2 className="text-base font-semibold text-slate-900 mb-4">EOI Activity Trend</h2>
          <div className="h-48 flex items-end gap-1">
            {data.eoiTrend.map((day, idx) => {
              const height = maxTrendCount > 0 ? (day.count / maxTrendCount) * 100 : 0;
              const isRecent = idx >= data.eoiTrend.length - 7;
              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center group relative"
                >
                  <div
                    className={`w-full rounded-t transition-all ${
                      isRecent ? 'bg-orange-500 hover:bg-orange-600' : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap z-10">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {day.count} EOIs
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-3 text-xs text-slate-500">
            <span>{new Date(data.eoiTrend[0]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            <span>Today</span>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Top Skills */}
          <div className="card p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Top Skills in Demand</h2>
            {data.topSkills.length === 0 ? (
              <p className="text-slate-500 text-sm">No data available</p>
            ) : (
              <div className="space-y-3">
                {data.topSkills.map((item) => (
                  <div key={item.skill} className="flex items-center gap-3">
                    <span className="w-28 text-sm text-slate-700 truncate" title={item.skill}>
                      {item.skill}
                    </span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${(item.count / maxSkillCount) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-sm text-slate-500 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Roles */}
          <div className="card p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Top Roles in Demand</h2>
            {data.topRoles.length === 0 ? (
              <p className="text-slate-500 text-sm">No data available</p>
            ) : (
              <div className="space-y-3">
                {data.topRoles.map((item) => (
                  <div key={item.role} className="flex items-center gap-3">
                    <span className="w-28 text-sm text-slate-700 truncate" title={item.role}>
                      {item.role}
                    </span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all"
                        style={{ width: `${(item.count / maxRoleCount) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-sm text-slate-500 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Most Demanded Candidates */}
        <div className="card p-6 mb-8">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Most Demanded Candidates</h2>
          {data.topCandidates.length === 0 ? (
            <p className="text-slate-500 text-sm">No EOI data available</p>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="table">
                <thead>
                  <tr>
                    <th className="pl-6">Rank</th>
                    <th>Candidate</th>
                    <th>Roles</th>
                    <th>Skills</th>
                    <th className="text-center">Status</th>
                    <th className="text-center pr-6">EOIs</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topCandidates.map((candidate, idx) => (
                    <tr key={candidate.id}>
                      <td className="pl-6">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                          {idx + 1}
                        </span>
                      </td>
                      <td>
                        <span className="font-medium text-slate-900">{candidate.name}</span>
                        {!candidate.isActive && (
                          <span className="ml-2 text-xs text-slate-400">(Inactive)</span>
                        )}
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {candidate.roles.slice(0, 2).map((role, i) => (
                            <span key={i} className="badge badge-gray">{role}</span>
                          ))}
                          {candidate.roles.length > 2 && (
                            <span className="badge badge-gray">+{candidate.roles.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 3).map((skill, i) => (
                            <span key={i} className="badge badge-green">{skill}</span>
                          ))}
                          {candidate.skills.length > 3 && (
                            <span className="badge badge-gray">+{candidate.skills.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          candidate.availability === 'Open'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {candidate.availability}
                        </span>
                      </td>
                      <td className="text-center pr-6">
                        <span className="font-semibold text-slate-900">{candidate.eoiCount}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Referrers */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Most Active Referrers</h2>
          {data.topReferrers.length === 0 ? (
            <p className="text-slate-500 text-sm">No referrer data available</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-4">
              {data.topReferrers.map((referrer, idx) => (
                <div
                  key={referrer.id}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-sm text-slate-900 truncate">{referrer.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mb-2">{referrer.company}</p>
                  <p className="text-lg font-bold text-slate-900">{referrer.eoiCount} EOIs</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
