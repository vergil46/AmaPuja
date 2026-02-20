import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Seo from '../components/Seo'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      const res = await api.post('/auth/login', form)

      if (res.data.user?.role !== 'admin') {
        setError('This account is not an admin account. Please use customer login.')
        return
      }

      login(res.data)
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed')
    }
  }

  return (
    <section className="max-w-md mx-auto px-4 py-10">
      <Seo title="Admin Login | Ama Puja" description="Login as an admin to manage Ama Puja operations." />
      <h1 className="text-2xl font-semibold">Admin Login</h1>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3 bg-white border border-stone-200 rounded-xl p-5">
        <input className="w-full px-3 py-2 rounded border border-stone-300" type="email" placeholder="Admin Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="w-full px-3 py-2 rounded border border-stone-300" type="password" placeholder="Password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="text-red-700 text-sm">{error}</p>}
        <button className="w-full py-2 rounded-lg bg-stone-900 text-white">Admin Login</button>
      </form>
      <p className="text-sm mt-3">Customer account? <Link to="/login" className="text-orange-700">Go to customer login</Link></p>
    </section>
  )
}

export default AdminLoginPage
