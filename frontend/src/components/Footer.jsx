import { Link } from 'react-router-dom'
import api from '../services/api'
import { useState } from 'react'
import Logo from './Logo'

function Footer() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [message, setMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    await api.post('/enquiries', form)
    setMessage('Enquiry submitted successfully.')
    setForm({ name: '', email: '', phone: '', message: '' })
  }

  return (
    <footer className="mt-16 bg-gradient-to-b from-stone-900 to-stone-950 text-stone-100 border-t border-orange-900/50">
      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-12 grid md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-stone-700/70 bg-stone-900/70 p-5 animate-fade-up" style={{ animationDelay: '0.08s' }}>
          <div className="mb-3">
            <Logo variant="default" className="[&_path]:fill-orange-400 [&_circle]:fill-orange-300 [&_span]:text-orange-100" />
          </div>
          <p className="text-sm text-stone-300 leading-relaxed">
            Trusted priests, transparent packages, and smooth ritual booking for families.
          </p>
          <p className="mt-3 text-sm text-stone-300">Contact: +91 90000 12345</p>
          <p className="text-sm text-stone-300">Email: support@amapuja.com</p>
          <p className="text-sm text-stone-300">Website: www.amapuja.com</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <a href="#" className="rounded-lg border border-stone-700 px-3 py-1.5 hover:text-orange-300 hover:border-orange-400/60 transition-colors">
              Facebook
            </a>
            <a
              href="https://instagram.com/my_best_puja"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-stone-700 px-3 py-1.5 hover:text-orange-300 hover:border-orange-400/60 transition-colors"
            >
              Instagram
            </a>
            <a href="#" className="rounded-lg border border-stone-700 px-3 py-1.5 hover:text-orange-300 hover:border-orange-400/60 transition-colors">
              YouTube
            </a>
          </div>
        </div>
        <div className="rounded-2xl border border-stone-700/70 bg-stone-900/70 p-5 animate-fade-up" style={{ animationDelay: '0.16s' }}>
          <h4 className="text-lg font-semibold">Quick Links</h4>
          <div className="mt-4 flex flex-col gap-2 text-sm text-stone-300">
            <Link to="/refund-policy" className="rounded-lg px-3 py-2 hover:bg-stone-800 transition-colors">Refund Policy</Link>
            <Link to="/privacy-policy" className="rounded-lg px-3 py-2 hover:bg-stone-800 transition-colors">Privacy Policy</Link>
            <Link to="/terms-and-conditions" className="rounded-lg px-3 py-2 hover:bg-stone-800 transition-colors">Terms & Conditions</Link>
          </div>
        </div>
        <div className="rounded-2xl border border-stone-700/70 bg-stone-900/70 p-5 animate-fade-up" style={{ animationDelay: '0.24s' }}>
          <h4 className="text-lg font-semibold">Enquiry Form</h4>
          <form onSubmit={handleSubmit} className="mt-4 space-y-2.5">
            <input
              className="w-full px-3 py-2.5 rounded-lg bg-stone-800 border border-stone-700 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className="w-full px-3 py-2.5 rounded-lg bg-stone-800 border border-stone-700 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
              placeholder="Email"
              value={form.email}
              type="email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              className="w-full px-3 py-2.5 rounded-lg bg-stone-800 border border-stone-700 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <textarea
              className="w-full px-3 py-2.5 rounded-lg bg-stone-800 border border-stone-700 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
              placeholder="Message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3}
              required
            />
            <button className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 text-white text-sm font-medium hover:from-orange-700 hover:to-amber-700 transition-all">
              Send
            </button>
            {message && <p className="text-green-300 text-sm">{message}</p>}
          </form>
        </div>
      </div>
      <p className="text-center text-xs text-stone-400 border-t border-stone-800 py-3.5">
        © {new Date().getFullYear()} Ama Puja. All rights reserved.
      </p>
    </footer>
  )
}

export default Footer
