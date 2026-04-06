import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Seo from '../components/Seo';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setStatus('success');
      setMessage(res.data.message);
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to send reset email');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#FFF8E1] to-[#FFF3C4] px-4">
      <Seo title="Forgot Password | Puja Samriddhi" />
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-5 sm:p-8 border border-[#FFE0A3]">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#333333] text-center mb-2">Forgot Password?</h2>
        <p className="text-[#333333]/78 text-center mb-2">
          Enter your email and we'll send you a reset link
        </p>
        <p className="text-xs text-stone-500 text-center mb-4">
          This works for both customer and admin accounts.
        </p>

        {status === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#333333]/78 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#FF6F00] focus:border-transparent"
              placeholder="your@email.com"
              disabled={status === 'loading'}
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-linear-to-r from-[#D84315] to-[#FF6F00] text-white py-3 rounded-lg font-semibold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link to="/login" className="block text-[#FF6F00] hover:text-[#D84315] font-medium">
            ← Back to Login
          </Link>
          <p className="text-sm text-stone-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#FF6F00] hover:text-[#D84315] font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;

