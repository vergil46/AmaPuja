import { Link } from 'react-router-dom'
import api from '../services/api'
import { useState } from 'react'
import Logo from './Logo'

function Footer() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitStatus, setSubmitStatus] = useState({ type: '', text: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setSubmitStatus({ type: '', text: '' })

    try {
      await api.post('/enquiries', form)
      setSubmitStatus({ type: 'success', text: 'Enquiry submitted successfully.' })
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch (error) {
      const apiMessage = error?.response?.data?.message
      setSubmitStatus({
        type: 'error',
        text: apiMessage || 'Unable to send enquiry right now. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer className="mt-16 rounded-t-3xl sm:rounded-none overflow-hidden bg-linear-to-br from-orange-950 via-stone-900 to-rose-950 text-stone-100 border-t border-orange-500/30">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-4 py-8 sm:py-12 grid md:grid-cols-3 gap-4 sm:gap-6">
        <div className="order-2 md:order-1 rounded-2xl border border-orange-400/25 bg-linear-to-br from-stone-900/90 to-orange-950/50 p-4 sm:p-5 animate-fade-up shadow-lg shadow-orange-900/20 backdrop-blur-sm" style={{ animationDelay: '0.08s' }}>
          <div className="mb-2 sm:mb-3">
            <Logo variant="default" className="[&_path]:fill-orange-400 [&_circle]:fill-orange-300 [&_span]:text-orange-100" />
          </div>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
            Trusted priests, transparent packages, and smooth ritual booking for families.
          </p>
          <p className="mt-3 text-sm sm:text-base text-stone-300">Contact: 9739362962</p>
          <p className="text-sm sm:text-base text-stone-300">Email: support@pujasamrddhi.com</p>
          <p className="text-sm sm:text-base text-stone-300">Website: www.pujasamrddhi.com</p>
          <div className="mt-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
            <a
              href="https://www.facebook.com/my_best_puja"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-stone-700/80 bg-stone-900/70 px-2.5 sm:px-3 py-2 sm:py-1.5 flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 hover:text-orange-200 hover:border-blue-400/70 hover:bg-blue-500/10 transition-colors"
            >
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24h11.495v-9.294H9.692v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0"/></svg>
              Facebook
            </a>
            <a
              href="https://instagram.com/my_best_puja"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-stone-700/80 bg-stone-900/70 px-2.5 sm:px-3 py-2 sm:py-1.5 flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 hover:text-orange-200 hover:border-pink-400/70 hover:bg-pink-500/10 transition-colors"
            >
              <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.567 5.782 2.295 7.148 2.233 8.414 2.175 8.794 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.363 3.678 1.344c-.98.98-1.213 2.092-1.272 3.373C2.013 5.668 2 6.077 2 12c0 5.923.013 6.332.072 7.613.059 1.281.292 2.393 1.272 3.373.98.98 2.092 1.213 3.373 1.272C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.281-.059 2.393-.292 3.373-1.272.98-.98 1.213-2.092 1.272-3.373.059-1.281.072-1.69.072-7.613 0-5.923-.013-6.332-.072-7.613-.059-1.281-.292-2.393-1.272-3.373-.98-.98-2.092-1.213-3.373-1.272C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>
              Instagram
            </a>
            <a
              href="https://www.youtube.com/@my_best_puja"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-stone-700/80 bg-stone-900/70 px-2.5 sm:px-3 py-2 sm:py-1.5 flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 hover:text-orange-200 hover:border-red-400/70 hover:bg-red-500/10 transition-colors"
            >
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.354 3.5 12 3.5 12 3.5s-7.354 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 8.218 0 12 0 12s0 3.782.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.646 20.5 12 20.5 12 20.5s7.354 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 15.782 24 12 24 12s0-3.782-.502-5.814zM9.545 15.568V8.432l6.545 3.568-6.545 3.568z"/></svg>
              YouTube
            </a>
            <a
              href="https://x.com/my_best_puja"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-stone-700/80 bg-stone-900/70 px-2.5 sm:px-3 py-2 sm:py-1.5 flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 hover:text-orange-200 hover:border-cyan-400/70 hover:bg-cyan-500/10 transition-colors"
            >
              <svg className="w-5 h-5 text-sky-500" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.59-2.47.7a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 8.99 4.07 7.13 1.64 4.15c-.37.64-.58 1.39-.58 2.19 0 1.51.77 2.84 1.94 3.62-.72-.02-1.39-.22-1.98-.55v.06c0 2.11 1.5 3.87 3.5 4.27-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.68 2.11 2.91 3.97 2.94A8.6 8.6 0 0 1 2 19.54c-.65 0-1.29-.04-1.92-.11A12.13 12.13 0 0 0 6.29 21.5c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0 0 24 4.59a8.36 8.36 0 0 1-2.54.7z"/></svg>
              Twitter
            </a>
          </div>
        </div>
        <div className="order-1 md:order-2 rounded-2xl border border-orange-300/45 md:border-orange-400/25 bg-linear-to-br from-orange-950/35 to-fuchsia-950/45 md:from-stone-900/90 md:to-fuchsia-950/35 p-4 sm:p-5 animate-fade-up shadow-lg shadow-fuchsia-900/20 backdrop-blur-sm" style={{ animationDelay: '0.16s' }}>
          <h4 className="text-base sm:text-lg font-semibold">Quick Links</h4>
          <div className="mt-3 sm:mt-4 flex flex-col gap-1.5 sm:gap-2 text-sm sm:text-base text-stone-300">
            <Link to="/ratings" className="rounded-lg px-3 py-2 text-sm sm:text-base bg-stone-900/40 sm:bg-transparent border border-stone-700/60 sm:border-transparent hover:bg-orange-500/15 hover:text-orange-200 hover:border-orange-400/35 transition-colors">Ratings & Reviews</Link>
            <Link to="/refund-policy" className="rounded-lg px-3 py-2 text-sm sm:text-base bg-stone-900/40 sm:bg-transparent border border-stone-700/60 sm:border-transparent hover:bg-orange-500/15 hover:text-orange-200 hover:border-orange-400/35 transition-colors">Refund Policy</Link>
            <Link to="/privacy-policy" className="rounded-lg px-3 py-2 text-sm sm:text-base bg-stone-900/40 sm:bg-transparent border border-stone-700/60 sm:border-transparent hover:bg-orange-500/15 hover:text-orange-200 hover:border-orange-400/35 transition-colors">Privacy Policy</Link>
            <Link to="/terms-and-conditions" className="rounded-lg px-3 py-2 text-sm sm:text-base bg-stone-900/40 sm:bg-transparent border border-stone-700/60 sm:border-transparent hover:bg-orange-500/15 hover:text-orange-200 hover:border-orange-400/35 transition-colors">Terms & Conditions</Link>
          </div>
        </div>
        <div className="order-3 md:order-3 rounded-2xl border border-orange-400/25 bg-linear-to-br from-stone-900/90 to-amber-950/40 p-4 sm:p-5 animate-fade-up shadow-lg shadow-amber-900/20 backdrop-blur-sm" style={{ animationDelay: '0.24s' }}>
          <h4 className="text-base sm:text-lg font-semibold">Enquiry Form</h4>
          <form onSubmit={handleSubmit} className="mt-3 sm:mt-4 space-y-2.5">
            <input
              className="w-full text-sm sm:text-base px-3 py-2.5 rounded-lg bg-stone-800/90 border border-stone-700 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className="w-full text-sm sm:text-base px-3 py-2.5 rounded-lg bg-stone-800/90 border border-stone-700 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
              placeholder="Email"
              value={form.email}
              type="email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              className="w-full text-sm sm:text-base px-3 py-2.5 rounded-lg bg-stone-800/90 border border-stone-700 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <textarea
              className="w-full text-sm sm:text-base px-3 py-2.5 rounded-lg bg-stone-800/90 border border-stone-700 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
              placeholder="Message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3}
              required
            />
            <button
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-linear-to-r from-orange-500 via-amber-500 to-rose-500 text-white text-sm font-medium shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:via-amber-600 hover:to-rose-600 transition-all disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Sending...' : 'Send'}
            </button>
            {submitStatus.text && (
              <p className={`text-sm ${submitStatus.type === 'success' ? 'text-green-300' : 'text-rose-300'}`}>
                {submitStatus.text}
              </p>
            )}
          </form>
        </div>
      </div>
      <p className="text-center text-xs sm:text-sm text-stone-300 border-t border-orange-500/20 bg-stone-950/40 py-3 sm:py-3.5">
        © {new Date().getFullYear()} PujaSamrddhi. All rights reserved.
      </p>
    </footer>
  )
}

export default Footer
