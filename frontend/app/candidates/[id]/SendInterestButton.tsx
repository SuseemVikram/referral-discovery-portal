'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/AuthContext';
import { useEOI } from '@/lib/hooks/useEOI';
import { isProfileComplete, storeReturnPath } from '@/lib/utils/profile-complete';

interface SendInterestButtonProps {
  candidateId: string;
}

export default function SendInterestButton({ candidateId }: SendInterestButtonProps) {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const { sendEOI, loading: sending } = useEOI();
  const [sent, setSent] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSendInterest = () => {
    if (!isLoggedIn) {
      // Save this candidate for after login
      sessionStorage.setItem('pendingEOI', JSON.stringify([candidateId]));
      router.push('/login');
      return;
    }

    if (!isProfileComplete(user)) {
      storeReturnPath(`/candidates/${candidateId}`, [candidateId]);
      toast.error('Please complete your profile (company, role, LinkedIn, and contact number are required) before sending interest. Redirecting to account page...');
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
      await sendEOI([candidateId]);
      setSent(true);
      toast.success('Referral sent successfully! Your contact details have been shared with the candidate.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send interest');
    }
  };

  if (sent) {
    return (
      <button
        disabled
        className="w-full py-3 px-4 bg-emerald-100 text-emerald-700 font-medium rounded-xl flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Interest Sent!
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleSendInterest}
        disabled={sending || sent}
        className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition-colors disabled:bg-orange-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {sending ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Sending...
          </>
        ) : sent ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Interest Sent!
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Send Interest
          </>
        )}
      </button>

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
                  Send to this candidate?
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                Your contact details (name, company, role, email, LinkedIn) will be shared with the candidate. They can reach out to you directly to take the conversation forward.
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

