import { Link } from 'react-router-dom'
import homeBackground from '../assets/poojas/background-optimized.webp'
import Seo from '../components/Seo'

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
          <div className="max-w-3xl rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-6 sm:p-8 animate-fade-up">
            <p className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 uppercase text-xs tracking-widest text-orange-100 border border-white/20">
              Sacred • Trusted • Professional
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mt-3 max-w-2xl leading-tight">
              Book Trusted Pandits for Your Sacred Rituals
            </h1>
            <p className="mt-4 max-w-xl text-orange-50/95">
              Premium puja support for homes and temples with verified priests, transparent pricing, and smooth booking.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/services"
                className="inline-block px-5 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-md text-sm sm:text-base font-medium"
              >
                Book a Puja
              </Link>
              <span className="text-xs sm:text-sm rounded-xl px-3 sm:px-4 py-2 bg-white/15 border border-white/20 text-orange-50">
                Serving Bangalore & Bhubaneswar
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10 sm:py-12">
        <div className="flex items-end justify-between gap-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl sm:text-2xl font-semibold">Why Families Choose Ama Puja</h2>
          <Link to="/services" className="hidden sm:inline-flex text-sm font-medium text-orange-700 hover:text-orange-800">
            Explore Services →
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <article
            className="rounded-2xl p-5 border border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-sm hover:shadow-md transition-shadow animate-fade-up"
            style={{ animationDelay: '0.18s' }}
          >
            <h3 className="font-semibold text-stone-800">Verified Priests</h3>
            <p className="mt-2 text-sm text-stone-600">Experienced priests for all major rituals in your preferred language.</p>
          </article>
          <article
            className="rounded-2xl p-5 border border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-sm hover:shadow-md transition-shadow animate-fade-up"
            style={{ animationDelay: '0.28s' }}
          >
            <h3 className="font-semibold text-stone-800">Transparent Packages</h3>
            <p className="mt-2 text-sm text-stone-600">Simple and clear package prices with secure booking confirmation.</p>
          </article>
          <article
            className="rounded-2xl p-5 border border-yellow-200 bg-gradient-to-br from-yellow-50 to-white shadow-sm hover:shadow-md transition-shadow animate-fade-up"
            style={{ animationDelay: '0.38s' }}
          >
            <h3 className="font-semibold text-stone-800">City-Wise Service</h3>
            <p className="mt-2 text-sm text-stone-600">Available in Bangalore and Bhubaneswar with timely support.</p>
          </article>
        </div>
      </section>
    </>
  )
}

export default HomePage
