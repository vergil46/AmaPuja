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
      <section
        className="relative flex min-h-[62vh] items-center overflow-hidden bg-cover bg-center sm:min-h-[74vh]"
        style={{
          backgroundImage:
            `linear-gradient(120deg, rgba(120,53,15,.88), rgba(217,119,6,.62), rgba(120,53,15,.52)), url(${homeBackground})`,
        }}
      >
        <div className="absolute inset-0 bg-linear-to-t from-stone-900/25 to-transparent animate-fade-in" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 text-white sm:py-24">
          <div className="max-w-4xl rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm animate-fade-up sm:p-8">
            <p className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 uppercase text-xs tracking-widest text-orange-100 border border-white/20">
              Sacred • Trusted • Professional
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl md:text-6xl">
              Book Trusted Pandits for Your Sacred Rituals
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-orange-50/95 sm:text-lg">
              Premium puja support for homes and temples with verified priests, transparent pricing, and smooth booking.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <span className="rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-orange-50">4.9/5 customer satisfaction</span>
              <span className="rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-orange-50">Secure online payment</span>
              <span className="rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-orange-50">Same-day support</span>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/services"
                className="inline-block w-full rounded-xl bg-linear-to-r from-orange-600 to-amber-600 px-5 py-3 text-center text-base font-semibold shadow-md hover:from-orange-700 hover:to-amber-700 sm:w-auto sm:px-6"
              >
                Book a Puja
              </Link>
              <a
                href="tel:+919000012345"
                className="inline-block w-full rounded-xl border border-white/35 bg-white/10 px-5 py-3 text-center text-base font-semibold text-white sm:w-auto sm:px-6"
              >
                Call for Guidance
              </a>
              <span className="rounded-xl border border-white/20 bg-white/15 px-3 py-2 text-sm text-orange-50 sm:px-4">
                Serving Bangalore & Bhubaneswar
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2.5">
                <p className="text-[11px] uppercase tracking-wide text-orange-100/90">Cities</p>
                <p className="text-base font-semibold sm:text-lg">2+</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2.5">
                <p className="text-[11px] uppercase tracking-wide text-orange-100/90">Verified Priests</p>
                <p className="text-base font-semibold sm:text-lg">Trusted</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2.5">
                <p className="text-[11px] uppercase tracking-wide text-orange-100/90">Packages</p>
                <p className="text-base font-semibold sm:text-lg">Transparent</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2.5">
                <p className="text-[11px] uppercase tracking-wide text-orange-100/90">Support</p>
                <p className="text-base font-semibold sm:text-lg">Quick</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <div className="flex items-end justify-between gap-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-semibold text-stone-900 sm:text-3xl">Why Families Choose Puja Samriddhi</h2>
          <Link to="/services" className="hidden text-sm font-semibold text-orange-700 hover:text-orange-800 sm:inline-flex">
            Explore Services →
          </Link>
        </div>

        <div className="mt-8 rounded-3xl border border-orange-100 bg-linear-to-br from-white via-orange-50/40 to-amber-50/60 p-6 shadow-sm sm:p-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            <article
              className="flex flex-col items-center rounded-2xl border border-orange-200 bg-linear-to-br from-orange-50 to-white p-6 text-center shadow-sm transition-shadow hover:shadow-md animate-fade-up"
              style={{ animationDelay: '0.18s' }}
            >
              <svg className="w-10 h-10 mb-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              <h3 className="mb-2 text-xl font-semibold text-stone-800">Verified Priests</h3>
              <p className="text-base leading-relaxed text-stone-600">Experienced priests for all major rituals in your preferred language.</p>
            </article>
            <article
              className="flex flex-col items-center rounded-2xl border border-amber-200 bg-linear-to-br from-amber-50 to-white p-6 text-center shadow-sm transition-shadow hover:shadow-md animate-fade-up"
              style={{ animationDelay: '0.28s' }}
            >
              <svg className="w-10 h-10 mb-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h3 className="mb-2 text-xl font-semibold text-stone-800">Transparent Packages</h3>
              <p className="text-base leading-relaxed text-stone-600">Simple and clear package prices with secure booking confirmation.</p>
            </article>
            <article
              className="flex flex-col items-center rounded-2xl border border-yellow-200 bg-linear-to-br from-yellow-50 to-white p-6 text-center shadow-sm transition-shadow hover:shadow-md animate-fade-up"
              style={{ animationDelay: '0.38s' }}
            >
              <svg className="w-10 h-10 mb-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h3 className="mb-2 text-xl font-semibold text-stone-800">City-Wise Service</h3>
              <p className="text-base leading-relaxed text-stone-600">Available in Bangalore and Bhubaneswar with timely support.</p>
            </article>
          </div>
        </div>
      </section>

      <WorkProofGallery />
    </>
  )
}

export default HomePage

