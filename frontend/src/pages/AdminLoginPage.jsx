import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Seo from '../components/Seo'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return
    setError('')
    setIsSubmitting(true)

    try {
      const res = await api.post('/auth/login', {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })

      if (res.data.user?.role !== 'admin') {
        setError('This account is not an admin account. Please use customer login.')
        return
      }

      login(res.data)
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="max-w-md mx-auto px-4 py-8 sm:py-10">
      <Seo title="Admin Login | PujaSamrddhi" description="Login as an admin to manage PujaSamrddhi operations." />
      <h1 className="text-2xl sm:text-3xl font-semibold">Admin Login</h1>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3 bg-white border border-stone-200 rounded-xl p-4 sm:p-5">
        <input className="w-full px-3 py-2 rounded border border-stone-300" type="email" placeholder="Admin Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <div>
          <input
            className="w-full px-3 py-2 rounded border border-stone-300"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <label className="mt-2 inline-flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(event) => setShowPassword(event.target.checked)}
            />
            Show password
          </label>
        </div>
        {error && <p className="text-red-700 text-sm">{error}</p>}
        <button className="w-full py-2 rounded-lg bg-stone-900 text-white disabled:opacity-60" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Admin Login'}
        </button>
      </form>
      <p className="text-sm mt-3 wrap-break-word">Customer account? <Link to="/login" className="text-orange-700">Go to customer login</Link></p>
    </section>
  )
}

export default AdminLoginPage
