import { Link } from 'react-router-dom'
import homeBackground from '../assets/poojas/background-optimized.webp'
import Seo from '../components/Seo'
import WorkProofGallery from '../components/WorkProofGallery'

function HomePage() {
  return (
    <>
      <Seo
        title="Puja Samriddhi | Trusted Pandit Booking"
        description="Book trusted pandits for sacred rituals with transparent packages and secure online booking."
      />

      {/* ── Hero ── */}
      <section
        className="relative flex min-h-[65vh] items-center overflow-hidden bg-cover bg-center sm:min-h-[78vh]"
        style={{
          backgroundImage: `url(${homeBackground})`,
        }}
      >
        {/* Layered dark overlays for depth */}
        <div className="absolute inset-0 bg-linear-to-br from-[#1a1207]/95 via-[#2a1709]/75 to-[#3b220b]/55" />
        <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-[#2f1b09]/30" />

        {/* Subtle glow orb behind the card */}
        <div
          className="pointer-events-none absolute left-1/4 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #ea580c 0%, transparent 70%)' }}
        />

        <div className="relative mx-auto max-w-6xl px-4 py-14 text-white sm:py-24">
          <div className="max-w-4xl rounded-3xl border border-white/15 bg-white/8 p-6 shadow-2xl backdrop-blur-md animate-fade-up sm:p-10"
            style={{ boxShadow: '0 8px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)' }}
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/40 bg-orange-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-orange-200">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
              Sacred • Trusted • Professional
            </span>

            {/* Headline */}
            <h1
              className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl md:text-6xl"
              style={{ textShadow: '0 2px 20px rgba(0,0,0,0.7)' }}
            >
              Book Trusted Pandits for Your{' '}
              <span
                className="bg-linear-to-r from-orange-300 via-amber-200 to-yellow-300 bg-clip-text text-transparent"
                style={{ WebkitBackgroundClip: 'text' }}
              >
                Sacred Rituals
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-orange-50/85 sm:text-lg">
              Premium puja support for homes and temples — verified priests, transparent pricing, smooth booking.
            </p>

            {/* Trust pills */}
            <div className="mt-4 flex flex-wrap gap-2 text-xs sm:text-sm">
              {['⭐ 4.9/5 satisfaction', '🔒 Secure payment', '⚡ Same-day support'].map((label) => (
                <span key={label} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-orange-100">
                  {label}
                </span>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/services"
                className="inline-block w-full rounded-xl px-6 py-3.5 text-center text-base font-bold text-white shadow-lg transition hover:scale-[1.02] sm:w-auto"
                style={{
                  background: 'linear-gradient(135deg, #ea580c 0%, #d97706 100%)',
                  boxShadow: '0 4px 24px rgba(234,88,12,0.45)',
                }}
              >
                Book a Puja →
              </Link>
              <a
                href="tel:+919739362962"
                className="inline-block w-full rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-center text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/18 sm:w-auto"
              >
                📞 Call for Guidance
              </a>
            </div>

            {/* Stats row */}
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Cities', value: '2+' },
                { label: 'Languages', value: '4' },
                { label: 'Packages', value: 'Clear' },
                { label: 'Support', value: 'Quick' },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/15 bg-white/8 px-3 py-3 backdrop-blur-sm"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                >
                  <p className="text-[11px] uppercase tracking-widest text-orange-200/70">{label}</p>
                  <p className="mt-0.5 text-lg font-bold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Us ── */}
      <section className="bg-[#fdf8f3] px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between gap-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-500">Why choose us</p>
              <h2 className="mt-1 text-xl font-bold text-stone-900 sm:text-3xl">Why Families Choose Puja Samriddhi</h2>
            </div>
            <Link to="/services" className="hidden text-sm font-semibold text-orange-600 hover:text-orange-700 sm:inline-flex">
              Explore Services →
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            {[
              {
                delay: '0.18s',
                icon: (
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                iconBg: 'from-orange-500 to-red-500',
                title: 'Verified Priests',
                desc: 'Experienced pandits for all major rituals in your preferred language — Odia, Hindi, Bengali, Kannada.',
              },
              {
                delay: '0.28s',
                icon: (
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                iconBg: 'from-amber-500 to-yellow-500',
                title: 'Transparent Packages',
                desc: 'Clear prices, no hidden charges — choose Standard or Premium and book with full confidence.',
              },
              {
                delay: '0.38s',
                icon: (
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                iconBg: 'from-emerald-500 to-teal-500',
                title: 'City-Wise Service',
                desc: 'Available in Bangalore and Bhubaneswar with on-time arrival and dedicated support.',
              },
            ].map(({ delay, icon, iconBg, title, desc }) => (
              <article
                key={title}
                className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl animate-fade-up"
                style={{ animationDelay: delay }}
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${iconBg} shadow-md`}>
                  {icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-stone-900">{title}</h3>
                <p className="text-sm leading-relaxed text-stone-500">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <WorkProofGallery />
    </>
  )
}

export default HomePage

