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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 px-4">
      <Seo title="Verify Email | Ama Puja" />
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-stone-800 mb-2">Verifying Your Email</h2>
            <p className="text-stone-600">Please wait while we verify your account...</p>
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
            <p className="text-stone-600 mb-4">{message}</p>
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
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
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
