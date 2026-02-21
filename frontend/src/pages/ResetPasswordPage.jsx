import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import Seo from '../components/Seo';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setTimeout(() => {
        setStatus('error');
        setMessage('Reset token is missing');
      }, 0);
    } else {
      setTimeout(() => setToken(tokenParam), 0);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await api.post('/auth/reset-password', {
        token,
        newPassword,
      });
      setStatus('success');
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Password reset failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 to-amber-50 px-4">
      <Seo title="Reset Password | Ama Puja" />
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-5 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 text-center mb-2">Reset Password</h2>
        <p className="text-stone-600 text-center mb-6">Enter your new password</p>

        {status === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{message}</p>
            <p className="text-green-700 text-sm mt-2">Redirecting to login...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{message}</p>
          </div>
        )}

        {!token && status === 'error' ? (
          <div className="text-center">
            <Link
              to="/forgot-password"
              className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
            >
              Request New Reset Link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-stone-700 mb-1">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter new password"
                disabled={status === 'loading' || status === 'success'}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Confirm new password"
                disabled={status === 'loading' || status === 'success'}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-orange-600 hover:text-orange-700 font-medium">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
