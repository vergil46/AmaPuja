import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Seo from '../components/Seo'
import { useAuth } from '../context/useAuth'
import api, { prewarmApi } from '../services/api'

function PanditLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isWarmingServer, setIsWarmingServer] = useState(true)
  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    let mounted = true
    prewarmApi().finally(() => {
      if (mounted) setIsWarmingServer(false)
    })
    return () => { mounted = false }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return
    setError('')
    setIsSubmitting(true)
    try {
      const response = await api.post('/auth/pandit-login', {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
      login(response.data)
      navigate('/pandit/dashboard')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Pandit login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="max-w-md mx-auto px-4 py-8 sm:py-10">
      <Seo title="Pandit Login | Puja Samriddhi" description="Login to the Puja Samriddhi Pandit dashboard." />
      <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Pandit workspace</p>
      <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-stone-900">Pandit Login</h1>
      <p className="mt-2 text-sm text-stone-600">Only approved Pandit accounts can access this dashboard.</p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-xl border border-orange-100 bg-white p-4 shadow-sm sm:p-5">
        <input className="w-full rounded border border-stone-300 px-3 py-2" type="email" placeholder="Pandit Email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        <div>
          <input className="w-full rounded border border-stone-300 px-3 py-2" type={showPassword ? 'text' : 'password'} placeholder="Password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          <label className="mt-2 inline-flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />
            Show password
          </label>
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        {!error && isWarmingServer && <p className="text-sm text-orange-700">Waking server... first login may take a few seconds.</p>}
        <button className="w-full rounded-lg bg-linear-to-r from-[#D84315] to-[#FF6F00] py-2 text-white disabled:opacity-60" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Pandit Login'}
        </button>
      </form>
      <p className="mt-3 text-sm">Not a Pandit? <Link to="/login" className="text-orange-700">Use general login</Link></p>
      <p className="mt-2 text-sm"><Link to="/join-as-pandit" className="text-orange-700">Apply to join as a Pandit</Link></p>
      <p className="mt-2 text-sm"><Link to="/forgot-password" className="text-orange-700">Forgot Password?</Link></p>
    </section>
  )
}

export default PanditLoginPage
