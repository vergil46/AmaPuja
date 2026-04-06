import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Seo from '../components/Seo';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(() => {
    const token = searchParams.get('token');
    return token ? 'verifying' : 'error';
  });
  const [message, setMessage] = useState(() => {
    const token = searchParams.get('token');
    return token ? '' : 'No verification token provided';
  });

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully!');
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Email verification failed');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#FFF8E1] to-[#FFF3C4] px-4">
      <Seo title="Verify Email | Puja Samriddhi" />
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-[#FFE0A3]">
        {status === 'verifying' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FFE0A3] border-t-[#FF6F00]" />
            </div>
            <h2 className="text-2xl font-bold text-[#333333] mb-2">Verifying Your Email</h2>
            <p className="text-[#333333]/78">Please wait while we verify your account...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center mb-6">
              <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">Email Verified! ✅</h2>
            <p className="text-[#333333]/78 mb-4">{message}</p>
            <p className="text-sm text-stone-500">Redirecting to login page...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-6">
              <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-700 mb-2">Verification Failed ❌</h2>
            <p className="text-stone-600 mb-6">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-linear-to-r from-[#D84315] to-[#FF6F00] text-white rounded-lg hover:brightness-110 transition"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage;

