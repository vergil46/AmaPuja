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
    <footer className="bg-stone-900 text-stone-100 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-12 grid md:grid-cols-3 gap-8">
        <div>
          <div className="mb-4">
            <Logo variant="default" className="[&_path]:fill-orange-400 [&_circle]:fill-orange-300 [&_span]:text-orange-100" />
          </div>
          <p className="mt-3 text-sm text-stone-300">Contact: +91 90000 12345</p>
          <p className="text-sm text-stone-300">Email: support@amapuja.com</p>
          <p className="text-sm text-stone-300">Website: www.amapuja.com</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <a href="#" className="hover:text-orange-300">
              Facebook
            </a>
            <a href="#" className="hover:text-orange-300">
              Instagram
            </a>
            <a href="#" className="hover:text-orange-300">
              YouTube
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-lg font-medium">Quick Links</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-stone-300">
            <Link to="/refund-policy" className="py-1">Refund Policy</Link>
            <Link to="/privacy-policy" className="py-1">Privacy Policy</Link>
            <Link to="/terms-and-conditions" className="py-1">Terms & Conditions</Link>
          </div>
        </div>
        <div>
          <h4 className="text-lg font-medium">Enquiry Form</h4>
          <form onSubmit={handleSubmit} className="mt-3 space-y-2">
            <input
              className="w-full px-3 py-2.5 rounded bg-stone-800 border border-stone-700"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className="w-full px-3 py-2.5 rounded bg-stone-800 border border-stone-700"
              placeholder="Email"
              value={form.email}
              type="email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              className="w-full px-3 py-2.5 rounded bg-stone-800 border border-stone-700"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <textarea
              className="w-full px-3 py-2.5 rounded bg-stone-800 border border-stone-700"
              placeholder="Message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3}
              required
            />
            <button className="w-full sm:w-auto px-4 py-2.5 bg-orange-700 rounded text-white text-sm">Send</button>
            {message && <p className="text-green-300 text-sm">{message}</p>}
          </form>
        </div>
      </div>
      <p className="text-center text-xs text-stone-400 border-t border-stone-700 py-3">© {new Date().getFullYear()} Ama Puja. All rights reserved.</p>
    </footer>
  )
}

export default Footer
