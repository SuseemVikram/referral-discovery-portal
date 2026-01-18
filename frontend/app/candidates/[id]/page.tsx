import Link from 'next/link';
import { candidatesApi } from '@/lib/api/services/candidates.api';
import SendInterestButton from './SendInterestButton';
import ContactDetailsNote from './ContactDetailsNote';

async function fetchCandidate(id: string) {
  try {
    return await candidatesApi.getCandidate(id);
  } catch (error) {
    if (error instanceof Error && (error as any).status === 404) {
      return null;
    }
    throw new Error('Failed to fetch candidate');
  }
}

export default async function CandidateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const candidate = await fetchCandidate(id);

  if (!candidate) {
    return (
      <div className="min-h-[calc(100dvh-4rem)] min-h-[calc(100vh-4rem)] p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          <Link 
            href="/candidates"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Candidates
          </Link>
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="empty-state-title">Candidate not found</p>
              <p className="empty-state-text">This candidate may have been removed</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const projects = candidate.projects as any;
  const projectsArray = Array.isArray(projects) ? projects : projects?.title ? [projects] : [];

  return (
    <div className="min-h-[calc(100dvh-4rem)] min-h-[calc(100vh-4rem)] p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <Link 
          href="/candidates"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Candidates
        </Link>

        {/* Profile Card */}
        <div className="card overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-semibold text-slate-600">
                  {candidate.first_name.charAt(0)}{candidate.last_name_initial}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-slate-900">
                  {candidate.first_name} {candidate.last_name_initial}.
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-slate-500">{candidate.location}</span>
                  {candidate.remote_ok && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-sm text-emerald-600 font-medium">Open to Remote</span>
                    </>
                  )}
                </div>
              </div>
              <span className={`px-4 py-1.5 text-sm font-medium rounded-full ${
                candidate.availability_status === 'Open'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {candidate.availability_status}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Target Roles */}
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Target Roles</h2>
              <div className="flex flex-wrap gap-2">
                {candidate.target_roles.map((role: string, idx: number) => (
                  <span key={idx} className="badge badge-gray !px-3 !py-1.5">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Primary Skills</h2>
              <div className="flex flex-wrap gap-2">
                {candidate.primary_skills.map((skill: string, idx: number) => (
                  <span key={idx} className="badge badge-green !px-3 !py-1.5">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Profile Summary */}
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">About</h2>
              <p className="text-slate-700 leading-relaxed">{candidate.short_profile}</p>
            </div>

            {/* Projects */}
            {projectsArray.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Projects</h2>
                <div className="space-y-4">
                  {projectsArray.map((project: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                      <h3 className="font-semibold text-slate-900 mb-3">
                        {project.title || 'Untitled Project'}
                      </h3>
                      {project.bullets && Array.isArray(project.bullets) && (
                        <ul className="space-y-2">
                          {project.bullets.map((bullet: string, bulletIdx: number) => (
                            <li key={bulletIdx} className="flex items-start gap-3 text-sm text-slate-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Send Interest Button */}
            <div className="pt-4 border-t border-slate-100">
              <div className="mb-3">
                <SendInterestButton candidateId={candidate.id} />
              </div>
              {/* Floating Notification - Only shown when logged in */}
              <ContactDetailsNote />
              <p className="text-xs text-slate-500 text-center mt-3">
                Clicking this will notify the candidate that you&apos;re interested in referring them
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
