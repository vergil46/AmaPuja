import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Seo from '../components/Seo'
import api from '../services/api'

const passwordRules = [
  { label: '8 or more characters', test: (value) => value.length >= 8 },
  { label: 'One uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { label: 'One lowercase letter', test: (value) => /[a-z]/.test(value) },
  { label: 'One number', test: (value) => /\d/.test(value) },
]

function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [status, setStatus] = useState(token ? 'idle' : 'error')
  const [message, setMessage] = useState(token ? '' : 'This reset link is missing its token.')

  const strength = passwordRules.filter((rule) => rule.test(password)).length
  const strengthLabel = strength === 4 ? 'Strong password' : strength >= 2 ? 'Password could be stronger' : 'Weak password'
  const strengthColor = strength === 4 ? 'bg-green-600' : strength >= 2 ? 'bg-amber-500' : 'bg-red-500'

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!token) {
      setStatus('error')
      setMessage('This reset link is invalid or missing its token.')
      return
    }
    if (strength !== passwordRules.length) {
      setStatus('error')
      setMessage('Password must be at least 8 characters and include uppercase, lowercase, and a number.')
      return
    }
    if (password !== confirmPassword) {
      setStatus('error')
      setMessage('Passwords do not match.')
      return
    }

    setStatus('loading')
    setMessage('')
    try {
      const response = await api.post('/auth/reset-password', { token, password })
      setStatus('success')
      setMessage(response.data.message || 'Password reset successfully.')
    } catch (error) {
      setStatus('error')
      setMessage(error.response?.data?.message || 'Unable to reset your password. Please request a new link.')
    }
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-8 sm:py-10">
      <Seo title="Reset Password | Puja Samriddhi" description="Create a new Puja Samriddhi account password." />
      <div className="w-full rounded-2xl border border-[#FFE0A3] bg-white p-5 shadow-xl sm:p-8">
        <h1 className="text-2xl font-bold text-[#333333] sm:text-3xl">Reset Password</h1>
        <p className="mt-2 text-sm text-[#333333]/78">Create a new password for your account.</p>

        {status === 'success' ? (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm text-green-800">{message}</p>
            <Link to="/login" className="mt-4 inline-block rounded-lg bg-[#D84315] px-5 py-2.5 font-semibold text-white hover:bg-[#C63B12]">
              Login
            </Link>
          </div>
        ) : !token ? (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">{message}</p>
            <Link to="/forgot-password" className="mt-4 inline-block text-sm font-semibold text-[#D84315]">Request a new reset link</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-[#333333]/78">
              New password
              <div className="relative mt-1">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="new-password" className="w-full rounded-lg border border-stone-300 px-3 py-2 pr-20 focus:border-transparent focus:ring-2 focus:ring-[#FF6F00]" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 -translate-y-1/2 px-2 text-xs font-semibold text-[#D84315]">{showPassword ? 'Hide' : 'Show'}</button>
              </div>
            </label>

            <div aria-live="polite">
              <div className="flex items-center justify-between text-xs text-stone-600"><span>Password strength</span><span>{strengthLabel}</span></div>
              <div className="mt-1 flex gap-1">{passwordRules.map((rule, index) => <span key={rule.label} className={`h-1.5 flex-1 rounded ${index < strength ? strengthColor : 'bg-stone-200'}`} />)}</div>
              <ul className="mt-2 grid gap-1 text-xs text-stone-600 sm:grid-cols-2">{passwordRules.map((rule) => <li key={rule.label} className={rule.test(password) ? 'text-green-700' : ''}>{rule.test(password) ? '✓' : '○'} {rule.label}</li>)}</ul>
            </div>

            <label className="block text-sm font-medium text-[#333333]/78">
              Confirm password
              <div className="relative mt-1">
                <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required autoComplete="new-password" className="w-full rounded-lg border border-stone-300 px-3 py-2 pr-20 focus:border-transparent focus:ring-2 focus:ring-[#FF6F00]" />
                <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} className="absolute right-2 top-1/2 -translate-y-1/2 px-2 text-xs font-semibold text-[#D84315]">{showConfirmPassword ? 'Hide' : 'Show'}</button>
              </div>
            </label>

            {status === 'error' && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{message}</p>}
            <button type="submit" disabled={status === 'loading'} className="w-full rounded-lg bg-linear-to-r from-[#D84315] to-[#FF6F00] py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
              {status === 'loading' ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <Link to="/login" className="mt-6 block text-center text-sm font-medium text-[#FF6F00] hover:text-[#D84315]">Back to Login</Link>
      </div>
    </section>
  )
}

export default ResetPasswordPage
