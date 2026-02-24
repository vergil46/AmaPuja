import { Link } from 'react-router-dom'
import homeBackground from '../assets/poojas/background-optimized.webp'
import Seo from '../components/Seo'
import WorkProofGallery from '../components/WorkProofGallery'

function HomePage() {
  return (
    <>
      <Seo
        title="Ama Puja | Trusted Pandit Booking"
        description="Book trusted pandits for sacred rituals with transparent packages and secure online booking."
      />
      <section
        className="relative min-h-[60vh] sm:min-h-[72vh] bg-cover bg-center flex items-center overflow-hidden"
        style={{
          backgroundImage:
            `linear-gradient(120deg, rgba(120,53,15,.88), rgba(217,119,6,.62), rgba(120,53,15,.52)), url(${homeBackground})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/25 to-transparent animate-fade-in" />
        <div className="relative max-w-6xl mx-auto px-4 py-14 sm:py-24 text-white">
          <div className="max-w-4xl rounded-3xl border border-white/20 bg-white/10 backdrop-blur-sm p-6 sm:p-8 animate-fade-up">
            <p className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 uppercase text-xs tracking-widest text-orange-100 border border-white/20">
              Sacred • Trusted • Professional
            </p>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-semibold mt-3 max-w-3xl leading-tight sm:leading-tight">
              Book Trusted Pandits for Your Sacred Rituals
            </h1>
            <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-orange-50/95">
              Premium puja support for homes and temples with verified priests, transparent pricing, and smooth booking.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/services"
                className="inline-block w-full sm:w-auto text-center px-5 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-md text-sm sm:text-base font-medium"
              >
                Book a Puja
              </Link>
              <span className="text-xs sm:text-sm rounded-xl px-3 sm:px-4 py-2 bg-white/15 border border-white/20 text-orange-50">
                Serving Bangalore & Bhubaneswar
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-orange-100/90">Cities</p>
                <p className="text-sm sm:text-lg font-semibold">2+</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-orange-100/90">Verified Priests</p>
                <p className="text-sm sm:text-lg font-semibold">Trusted</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-orange-100/90">Packages</p>
                <p className="text-sm sm:text-lg font-semibold">Transparent</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-orange-100/90">Support</p>
                <p className="text-sm sm:text-lg font-semibold">Quick</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10 sm:py-12">
        <div className="flex items-end justify-between gap-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg sm:text-2xl font-semibold">Why Families Choose Ama Puja</h2>
          <Link to="/services" className="hidden sm:inline-flex text-sm font-medium text-orange-700 hover:text-orange-800">
            Explore Services →
          </Link>
        </div>

        <div className="mt-8 rounded-3xl border border-orange-100 bg-gradient-to-br from-white via-orange-50/40 to-amber-50/60 p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <article
              className="rounded-2xl p-7 flex flex-col items-center text-center border border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-sm hover:shadow-md transition-shadow animate-fade-up"
              style={{ animationDelay: '0.18s' }}
            >
              <svg className="w-10 h-10 mb-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              <h3 className="font-semibold text-stone-800 text-lg mb-2">Verified Priests</h3>
              <p className="text-sm text-stone-600">Experienced priests for all major rituals in your preferred language.</p>
            </article>
            <article
              className="rounded-2xl p-7 flex flex-col items-center text-center border border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-sm hover:shadow-md transition-shadow animate-fade-up"
              style={{ animationDelay: '0.28s' }}
            >
              <svg className="w-10 h-10 mb-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h3 className="font-semibold text-stone-800 text-lg mb-2">Transparent Packages</h3>
              <p className="text-sm text-stone-600">Simple and clear package prices with secure booking confirmation.</p>
            </article>
            <article
              className="rounded-2xl p-7 flex flex-col items-center text-center border border-yellow-200 bg-gradient-to-br from-yellow-50 to-white shadow-sm hover:shadow-md transition-shadow animate-fade-up"
              style={{ animationDelay: '0.38s' }}
            >
              <svg className="w-10 h-10 mb-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h3 className="font-semibold text-stone-800 text-lg mb-2">City-Wise Service</h3>
              <p className="text-sm text-stone-600">Available in Bangalore and Bhubaneswar with timely support.</p>
            </article>
          </div>
        </div>
      </section>

      <WorkProofGallery />
    </>
  )
}

export default HomePage
