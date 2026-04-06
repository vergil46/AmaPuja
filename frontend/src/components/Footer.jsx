import { Link } from 'react-router-dom'
import api from '../services/api'
import { useState } from 'react'
import Logo from './Logo'
import GoogleBusinessCard from './GoogleBusinessCard'

const StarIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 3.75L14.55 8.92L20.25 9.75L16.12 13.78L17.1 19.45L12 16.77L6.9 19.45L7.88 13.78L3.75 9.75L9.45 8.92L12 3.75Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const RefundIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M8 7H18C19.66 7 21 8.34 21 10V16C21 17.66 19.66 19 18 19H8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M11 4L8 7L11 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 15H14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const ShieldIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 3L19 6V11.5C19 16.1 15.95 20.35 12 21C8.05 20.35 5 16.1 5 11.5V6L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.25 12.25L11 14L14.75 10.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const DocumentIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M8 3H14L19 8V20H8C6.9 20 6 19.1 6 18V5C6 3.9 6.9 3 8 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 3V8H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.5 12H15.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M9.5 15.5H14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const PhoneIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M5 4.75H8.3C8.78 4.75 9.19 5.09 9.28 5.56L9.88 8.7C9.96 9.14 9.8 9.58 9.46 9.86L7.93 11.13C9.2 13.93 11.44 16.17 14.24 17.44L15.51 15.91C15.79 15.57 16.23 15.41 16.67 15.49L19.81 16.09C20.28 16.18 20.62 16.59 20.62 17.07V20.37C20.62 20.86 20.23 21.25 19.74 21.25H18.5C10.49 21.25 3.99 14.75 3.99 6.74V5.5C3.99 5.01 4.38 4.62 4.87 4.62H5V4.75Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const MailIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="3.75" y="5.75" width="16.5" height="12.5" rx="2.25" stroke="currentColor" strokeWidth="1.8" />
    <path d="M4.5 7L12 12.75L19.5 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const GlobeIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M3.9 12H20.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M12 3.5C14.4 5.73 15.77 8.78 15.77 12C15.77 15.22 14.4 18.27 12 20.5C9.6 18.27 8.23 15.22 8.23 12C8.23 8.78 9.6 5.73 12 3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          {/* ── Brand card ── */}
          <div
            className="rounded-2xl border border-white/10 p-5 backdrop-blur-sm sm:p-6"
            style={{ background: 'rgba(255,255,255,0.04)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)' }}
          >
            <Logo variant="default" theme="light" />
            <p className="mt-4 text-sm leading-relaxed text-white/72">
              Trusted priests, transparent packages, and smooth ritual booking for families across Bangalore &amp; Bhubaneswar.
            </p>

            {/* Contact info */}
            <div className="mt-5 space-y-2.5 text-sm">
              <a href="tel:+919739362962" className="group flex items-center gap-2.5 text-white/70 transition hover:text-orange-200">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-orange-300/20 bg-orange-500/12 text-orange-200 transition group-hover:border-orange-200/45 group-hover:bg-orange-400/20">
                  <PhoneIcon />
                </span>
                9739362962
              </a>
              <a href="mailto:support@pujasamriddhi.com" className="group flex items-center gap-2.5 text-white/70 transition hover:text-orange-200">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-orange-300/20 bg-orange-500/12 text-orange-200 transition group-hover:border-orange-200/45 group-hover:bg-orange-400/20">
                  <MailIcon />
                </span>
                support@pujasamriddhi.com
              </a>
              <a href="mailto:pujasamriddhi@gmail.com" className="group flex items-center gap-2.5 text-white/70 transition hover:text-orange-200">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-orange-300/20 bg-orange-500/12 text-orange-200 transition group-hover:border-orange-200/45 group-hover:bg-orange-400/20">
                  <MailIcon />
                </span>
                pujasamriddhi@gmail.com
              </a>
              <a href="https://www.pujasamriddhi.com" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2.5 text-white/70 transition hover:text-orange-200">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-orange-300/20 bg-orange-500/12 text-orange-200 transition group-hover:border-orange-200/45 group-hover:bg-orange-400/20">
                  <GlobeIcon />
                </span>
                www.pujasamriddhi.com
              </a>
            </div>

            {/* Social icons */}
            <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
              {[
                {
                  href: 'https://www.facebook.com/my_best_puja', label: 'Facebook',
                  hover: 'hover:border-blue-400/50 hover:bg-blue-500/10',
                  icon: <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24h11.495v-9.294H9.692v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0"/></svg>,
                },
                {
                  href: 'https://instagram.com/my_best_puja', label: 'Instagram',
                  hover: 'hover:border-pink-400/50 hover:bg-pink-500/10',
                  icon: <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.567 5.782 2.295 7.148 2.233 8.414 2.175 8.794 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.363 3.678 1.344c-.98.98-1.213 2.092-1.272 3.373C2.013 5.668 2 6.077 2 12c0 5.923.013 6.332.072 7.613.059 1.281.292 2.393 1.272 3.373.98.98 2.092 1.213 3.373 1.272C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.281-.059 2.393-.292 3.373-1.272.98-.98 1.213-2.092 1.272-3.373.059-1.281.072-1.69.072-7.613 0-5.923-.013-6.332-.072-7.613-.059-1.281-.292-2.393-1.272-3.373-.98-.98-2.092-1.213-3.373-1.272C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>,
                },
                {
                  href: 'https://www.youtube.com/@my_best_puja', label: 'YouTube',
                  hover: 'hover:border-red-400/50 hover:bg-red-500/10',
                  icon: <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.354 3.5 12 3.5 12 3.5s-7.354 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 8.218 0 12 0 12s0 3.782.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.646 20.5 12 20.5 12 20.5s7.354 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 15.782 24 12 24 12s0-3.782-.502-5.814zM9.545 15.568V8.432l6.545 3.568-6.545 3.568z"/></svg>,
                },
                {
                  href: 'https://x.com/my_best_puja', label: 'X',
                  hover: 'hover:border-white/45 hover:bg-white/10',
                  icon: <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2H21.5L14.42 10.02L22.75 22H16.23L11.13 14.72L4.7 22H1.44L9.01 13.43L1 2H7.69L12.3 8.69L18.244 2ZM17.1 20H18.9L6.73 3.89H4.78L17.1 20Z"/></svg>,
                },
              ].map(({ href, label, hover, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center gap-2.5 rounded-xl border border-white/12 bg-white/5 px-3 py-2.5 font-medium text-white/75 transition hover:text-white ${hover}`}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-black/20 text-white/90 transition group-hover:bg-black/30">
                    {icon}
                  </span>
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div
            className="rounded-2xl border border-white/10 p-5 backdrop-blur-sm sm:p-6"
            style={{ background: 'rgba(255,255,255,0.04)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)' }}
          >
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-amber-300">Navigate</p>
            <h4 className="text-base font-bold sm:text-lg" style={{ color: '#fff' }}>Quick Links</h4>
            <div className="mt-5 space-y-1.5">
              {[
                { to: '/ratings', label: 'Ratings & Reviews', icon: <StarIcon /> },
                { to: '/refund-policy', label: 'Refund Policy', icon: <RefundIcon /> },
                { to: '/privacy-policy', label: 'Privacy Policy', icon: <ShieldIcon /> },
                { to: '/terms-and-conditions', label: 'Terms & Conditions', icon: <DocumentIcon /> },
              ].map(({ to, label, icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm text-white/78 transition hover:border-white/20 hover:bg-white/8 hover:text-white"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-300/30 bg-amber-400/10 text-amber-200 transition group-hover:border-amber-200/60 group-hover:bg-amber-300/15 group-hover:text-amber-100">{icon}</span>
                  {label}
                  <span className="ml-auto text-white/35">›</span>
                </Link>
              ))}
            </div>

            {/* Mini trust strip */}
            <div className="mt-6 rounded-xl border border-orange-400/20 p-4" style={{ background: 'rgba(234,88,12,0.07)' }}>
              <p className="text-xs font-semibold text-orange-200">Why families trust us</p>
              <ul className="mt-2 space-y-1.5 text-xs text-white/72">
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
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-amber-300">Get in touch</p>
            <h4 className="text-base font-bold sm:text-lg" style={{ color: '#fff' }}>Enquiry Form</h4>
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
                  className="w-full rounded-xl border border-white/20 bg-white/8 px-3.5 py-2.5 text-sm text-white placeholder:text-white/65 outline-none transition focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/25"
                />
              ))}
              <textarea
                placeholder="How can we help you?"
                required
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full resize-none rounded-xl border border-white/20 bg-white/8 px-3.5 py-2.5 text-sm text-white placeholder:text-white/65 outline-none transition focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/25"
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

          {/* ── Google Business Profile ── */}
          <GoogleBusinessCard variant="compact" />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8 py-4" style={{ background: 'rgba(0,0,0,0.3)' }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 sm:flex-row">
          <p className="text-sm text-white/65">
            © {new Date().getFullYear()} Puja Samriddhi. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-sm text-white/60">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

