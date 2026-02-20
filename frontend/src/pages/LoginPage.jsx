import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Seo from '../components/Seo'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const res = await api.post('/auth/login', form)

      if (res.data.user?.role === 'admin') {
        setError('Admin account detected. Please use the Admin Login page.')
        return
      }

      login(res.data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <section className="max-w-md mx-auto px-4 py-10">
      <Seo title="Customer Login | Ama Puja" description="Login to your customer Ama Puja account." />
      <h1 className="text-2xl font-semibold">Customer Login</h1>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3 bg-white border border-stone-200 rounded-xl p-5">
        <input className="w-full px-3 py-2 rounded border border-stone-300" type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="w-full px-3 py-2 rounded border border-stone-300" type="password" placeholder="Password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="text-red-700 text-sm">{error}</p>}
        <button className="w-full py-2 rounded-lg bg-orange-700 text-white">Login</button>
      </form>
      <p className="text-sm mt-3">No customer account? <Link to="/signup" className="text-orange-700">Sign up</Link></p>
      <p className="text-sm mt-2">Admin account? <Link to="/admin-login" className="text-stone-800">Admin login</Link></p>
      <p className="text-sm mt-2"><Link to="/forgot-password" className="text-orange-700">Forgot Password?</Link></p>
    </section>
  )
}

export default LoginPage
