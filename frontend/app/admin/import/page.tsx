'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/AuthContext';
import { adminApi } from '@/lib/api/services/admin.api';

export default function AdminImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    total: number;
    created: number;
    updated: number;
    failed: number;
  } | null>(null);

  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSummary(null);
    }
  };

  const handleDownloadSample = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    setDownloading(true);

    try {
      const blob = await adminApi.downloadSampleCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sample-candidates-import.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Sample CSV downloaded successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to download sample');
    } finally {
      setDownloading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const result = await adminApi.importCandidates(file);
      setSummary(result);
      setFile(null);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      toast.success(`Successfully imported ${result.created} candidate(s). Refresh the candidates page to see updated filters.`);
    } catch (err) {
      if (err instanceof Error && 'status' in err && (err.status === 401 || err.status === 403)) {
        router.push('/login');
        return;
      }
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] min-h-[calc(100vh-4rem)] p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="page-title mb-6">Import Candidates</h1>
        
        {/* Sample CSV Section */}
        <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 mb-1">Need a template?</h2>
              <p className="text-sm text-slate-500">Download a sample CSV with the correct format and example data.</p>
            </div>
            <button
              onClick={handleDownloadSample}
              disabled={downloading}
              className="btn btn-secondary flex-shrink-0"
            >
              {downloading ? (
                <>
                  <div className="spinner !w-4 !h-4" />
                  Downloading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Sample
                </>
              )}
            </button>
          </div>
        </div>

        {/* Upload Section */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Upload CSV File</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm 
                    file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 
                    file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 
                    hover:file:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
              {file && (
                <p className="mt-2 text-sm text-slate-500">
                  Selected: <span className="font-medium text-slate-700">{file.name}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="btn btn-primary w-full py-3"
            >
              {loading ? (
                <>
                  <div className="spinner !w-4 !h-4 !border-white !border-t-transparent" />
                  Uploading...
                </>
              ) : (
                'Upload CSV'
              )}
            </button>
          </form>

          {error && (
            <div className="alert alert-error mt-4">{error}</div>
          )}

          {summary && (
            <div className="mt-6 p-4 sm:p-5 bg-emerald-50 border border-emerald-100 rounded-xl">
              <h3 className="font-semibold text-emerald-800 mb-4">Import Complete</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{summary.total}</div>
                  <div className="text-xs text-slate-500 mt-1">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{summary.created}</div>
                  <div className="text-xs text-slate-500 mt-1">Created</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{summary.updated}</div>
                  <div className="text-xs text-slate-500 mt-1">Updated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
                  <div className="text-xs text-slate-500 mt-1">Failed</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Required Columns Info */}
        <div className="mt-6 card p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Required Columns</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div className="text-slate-600"><code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">candidate_id</code> Unique ID</div>
            <div className="text-slate-600"><code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">first_name</code> First name</div>
            <div className="text-slate-600"><code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">last_name</code> OR <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">last_name_initial</code> Last name (auto-converts to initial) or initial</div>
            <div className="text-slate-600"><code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">target_roles</code> Comma-separated</div>
            <div className="text-slate-600"><code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">primary_skills</code> Comma-separated</div>
            <div className="text-slate-600"><code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">location</code> City/Region</div>
            <div className="text-slate-600"><code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">remote_ok</code> true/false</div>
            <div className="text-slate-600"><code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">availability_status</code> Open/Paused</div>
            <div className="text-slate-600"><code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">short_profile</code> Bio text</div>
            <div className="text-slate-600"><code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">candidate_email</code> Email</div>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mt-5 mb-3">Optional Columns</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div className="text-slate-600"><code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">project1_title</code> Project name</div>
            <div className="text-slate-600"><code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">project1_bullets</code> Pipe-separated (|)</div>
            <div className="text-slate-600"><code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">project2_title</code> Project name</div>
            <div className="text-slate-600"><code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">project2_bullets</code> Pipe-separated (|)</div>
            <div className="text-slate-600"><code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">cohort</code> Cohort name</div>
            <div className="text-slate-600"><code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">projects</code> JSON format (legacy)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
