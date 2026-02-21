import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Seo from '../components/Seo'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const res = await api.post('/auth/register', { ...form, role: 'user' })
      login(res.data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed')
    }
  }

  return (
    <section className="max-w-md mx-auto px-4 py-8 sm:py-10">
      <Seo title="Customer Signup | Ama Puja" description="Create your customer Ama Puja account." />
      <h1 className="text-2xl sm:text-3xl font-semibold">Customer Signup</h1>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3 bg-white border border-stone-200 rounded-xl p-4 sm:p-5">
        <input className="w-full px-3 py-2 rounded border border-stone-300" placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="w-full px-3 py-2 rounded border border-stone-300" type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="w-full px-3 py-2 rounded border border-stone-300" placeholder="Phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="w-full px-3 py-2 rounded border border-stone-300" type="password" placeholder="Password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="text-red-700 text-sm">{error}</p>}
        <button className="w-full py-2 rounded-lg bg-orange-700 text-white">Signup</button>
      </form>
      <p className="text-sm mt-3 wrap-break-word">Already have an account? <Link to="/login" className="text-orange-700">Login</Link></p>
      <p className="text-sm mt-2 wrap-break-word">Admin account? <Link to="/admin-login" className="text-stone-800">Admin login</Link></p>
    </section>
  )
}

export default SignupPage
