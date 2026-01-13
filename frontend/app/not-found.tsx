import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-orange-50">
      <div className="text-center px-6">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-slate-200">404</h1>
          <h2 className="text-3xl font-semibold text-slate-900 mt-4">Page Not Found</h2>
          <p className="text-slate-600 mt-2 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Go Home
          </Link>
          <Link
            href="/candidates"
            className="px-6 py-3 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-all hover:-translate-y-0.5"
          >
            Browse Candidates
          </Link>
        </div>
      </div>
    </div>
  );
}
