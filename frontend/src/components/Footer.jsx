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
    <footer
      className="relative mt-16 overflow-hidden border-t border-white/8 text-stone-100"
      style={{ background: 'linear-gradient(135deg, #1a1207 0%, #2a1709 50%, #3b220b 100%)' }}
    >
      {/* Background glow orbs */}
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, #ea580c 0%, transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid gap-6 md:grid-cols-3">

          {/* ── Brand card ── */}
          <div
            className="rounded-2xl border border-white/10 p-5 backdrop-blur-sm sm:p-6"
            style={{ background: 'rgba(255,255,255,0.04)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)' }}
          >
            <Logo variant="default" className="[&_path]:fill-orange-400 [&_circle]:fill-orange-300 [&_span]:text-orange-100" />
            <p className="mt-4 text-sm leading-relaxed text-white/55">
              Trusted priests, transparent packages, and smooth ritual booking for families across Bangalore &amp; Bhubaneswar.
            </p>

            {/* Contact info */}
            <div className="mt-5 space-y-2.5 text-sm">
              <a href="tel:+919739362962" className="flex items-center gap-2.5 text-white/65 transition hover:text-orange-300">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-base">📞</span>
                9739362962
              </a>
              <a href="mailto:support@pujasamriddhi.com" className="flex items-center gap-2.5 text-white/65 transition hover:text-orange-300">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-base">✉️</span>
                support@pujasamriddhi.com
              </a>
              <a href="https://www.pujasamriddhi.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-white/65 transition hover:text-orange-300">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-base">🌐</span>
                www.pujasamriddhi.com
              </a>
            </div>

            {/* Social icons */}
            <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
              {[
                {
                  href: 'https://www.facebook.com/my_best_puja', label: 'Facebook',
                  hover: 'hover:border-blue-400/50 hover:bg-blue-500/10',
                  icon: <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24h11.495v-9.294H9.692v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0"/></svg>,
                },
                {
                  href: 'https://instagram.com/my_best_puja', label: 'Instagram',
                  hover: 'hover:border-pink-400/50 hover:bg-pink-500/10',
                  icon: <svg className="h-4 w-4 text-pink-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.567 5.782 2.295 7.148 2.233 8.414 2.175 8.794 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.363 3.678 1.344c-.98.98-1.213 2.092-1.272 3.373C2.013 5.668 2 6.077 2 12c0 5.923.013 6.332.072 7.613.059 1.281.292 2.393 1.272 3.373.98.98 2.092 1.213 3.373 1.272C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.281-.059 2.393-.292 3.373-1.272.98-.98 1.213-2.092 1.272-3.373.059-1.281.072-1.69.072-7.613 0-5.923-.013-6.332-.072-7.613-.059-1.281-.292-2.393-1.272-3.373-.98-.98-2.092-1.213-3.373-1.272C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>,
                },
                {
                  href: 'https://www.youtube.com/@my_best_puja', label: 'YouTube',
                  hover: 'hover:border-red-400/50 hover:bg-red-500/10',
                  icon: <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.354 3.5 12 3.5 12 3.5s-7.354 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 8.218 0 12 0 12s0 3.782.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.646 20.5 12 20.5 12 20.5s7.354 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 15.782 24 12 24 12s0-3.782-.502-5.814zM9.545 15.568V8.432l6.545 3.568-6.545 3.568z"/></svg>,
                },
                {
                  href: 'https://x.com/my_best_puja', label: 'Twitter / X',
                  hover: 'hover:border-sky-400/50 hover:bg-sky-500/10',
                  icon: <svg className="h-4 w-4 text-sky-400" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.59-2.47.7a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 8.99 4.07 7.13 1.64 4.15c-.37.64-.58 1.39-.58 2.19 0 1.51.77 2.84 1.94 3.62-.72-.02-1.39-.22-1.98-.55v.06c0 2.11 1.5 3.87 3.5 4.27-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.68 2.11 2.91 3.97 2.94A8.6 8.6 0 0 1 2 19.54c-.65 0-1.29-.04-1.92-.11A12.13 12.13 0 0 0 6.29 21.5c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0 0 24 4.59a8.36 8.36 0 0 1-2.54.7z"/></svg>,
                },
              ].map(({ href, label, hover, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white/60 transition hover:text-white ${hover}`}
                >
                  {icon}
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div
            className="rounded-2xl border border-white/10 p-5 backdrop-blur-sm sm:p-6"
            style={{ background: 'rgba(255,255,255,0.04)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)' }}
          >
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-purple-400">Navigate</p>
            <h4 className="text-base font-bold text-white sm:text-lg">Quick Links</h4>
            <div className="mt-5 space-y-1.5">
              {[
                { to: '/ratings', label: 'Ratings & Reviews', icon: '⭐' },
                { to: '/refund-policy', label: 'Refund Policy', icon: '↩️' },
                { to: '/privacy-policy', label: 'Privacy Policy', icon: '🔒' },
                { to: '/terms-and-conditions', label: 'Terms & Conditions', icon: '📄' },
              ].map(({ to, label, icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm text-white/60 transition hover:border-white/12 hover:bg-white/6 hover:text-white"
                >
                  <span className="text-base">{icon}</span>
                  {label}
                  <span className="ml-auto text-white/25">›</span>
                </Link>
              ))}
            </div>

            {/* Mini trust strip */}
            <div className="mt-6 rounded-xl border border-orange-400/20 p-4" style={{ background: 'rgba(234,88,12,0.07)' }}>
              <p className="text-xs font-semibold text-orange-300">Why families trust us</p>
              <ul className="mt-2 space-y-1.5 text-xs text-white/50">
                <li className="flex items-center gap-2"><span className="text-orange-400">✓</span> Verified &amp; experienced pandits</li>
                <li className="flex items-center gap-2"><span className="text-orange-400">✓</span> Transparent package pricing</li>
                <li className="flex items-center gap-2"><span className="text-orange-400">✓</span> Secure Razorpay payment</li>
              </ul>
            </div>
          </div>

          {/* ── Enquiry Form ── */}
          <div
            className="rounded-2xl border border-white/10 p-5 backdrop-blur-sm sm:p-6"
            style={{ background: 'rgba(255,255,255,0.04)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)' }}
          >
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-purple-400">Get in touch</p>
            <h4 className="text-base font-bold text-white sm:text-lg">Enquiry Form</h4>
            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              {[
                { key: 'name',  placeholder: 'Your Name',     type: 'text'  },
                { key: 'email', placeholder: 'Email Address', type: 'email' },
                { key: 'phone', placeholder: 'Phone Number',  type: 'text'  },
              ].map(({ key, placeholder, type }) => (
                <input
                  key={key}
                  type={type}
                  placeholder={placeholder}
                  required
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/6 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20"
                />
              ))}
              <textarea
                placeholder="How can we help you?"
                required
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/6 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20"
              />
              <button
                disabled={isSubmitting}
                className="w-full rounded-xl py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #ea580c 0%, #d97706 100%)', boxShadow: '0 4px 16px rgba(234,88,12,0.35)' }}
              >
                {isSubmitting ? 'Sending…' : 'Send Enquiry →'}
              </button>
              {submitStatus.text && (
                <p className={`text-xs font-medium ${submitStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {submitStatus.text}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8 py-4" style={{ background: 'rgba(0,0,0,0.3)' }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 sm:flex-row">
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} Puja Samriddhi. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

