import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import homeBackground from '../assets/poojas/background-optimized-1280.webp'
import Seo from '../components/Seo'
import WorkProofGallery from '../components/WorkProofGallery'

function HomePage() {
  const navigate = useNavigate()
  const [city, setCity] = useState('Bangalore')
  const [language, setLanguage] = useState('Odia')
  const [searchTerm, setSearchTerm] = useState('')

  const quickSuggestions = ['Satyanarayan Puja', 'Griha Pravesh', 'Ganesh Puja']

  const goToServices = (overrideTerm = '') => {
    const nextParams = new URLSearchParams()
    const normalizedSearch = String(overrideTerm || searchTerm).trim()

    if (city && city !== 'Bangalore') {
      nextParams.set('city', city)
    }

    if (language && language !== 'Odia') {
      nextParams.set('priest', language)
    }

    if (normalizedSearch) {
      nextParams.set('search', normalizedSearch)
    }

    const queryString = nextParams.toString()
    navigate(queryString ? `/services?${queryString}` : '/services')
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    goToServices()
  }

  return (
    <>
      <Seo
        title="Puja Samriddhi | Trusted Pandit Booking"
        description="Book trusted pandits for sacred rituals with transparent packages and secure online booking."
      />

      <section className="relative overflow-hidden border-b border-orange-100/80">
        <img
          src={homeBackground}
          alt=""
          aria-hidden="true"
          loading="eager"
          fetchpriority="high"
          decoding="async"
          width="1280"
          height="853"
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-br from-[#f7efe8]/92 via-[#f8ece2]/68 to-[#c78851]/44" />
        <div className="absolute inset-0 bg-linear-to-t from-[#5f3416]/30 via-[#7a4a20]/8 to-transparent" />

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-12 sm:pb-20 sm:pt-16">
          <div className="max-w-4xl animate-fade-up">
            <h1 className="text-4xl font-semibold leading-tight text-[#291a11] sm:text-5xl md:text-[60px]">
              Book Trusted Pandit Ji in Minutes
            </h1>
            <p className="mt-4 text-lg font-medium text-[#5b3c24] sm:text-[38px] sm:leading-tight">
              500+ successful poojas • Verified priests • Same-day booking
            </p>

            <form
              onSubmit={handleSearchSubmit}
              className="mt-8 rounded-3xl border border-[#e7d2bf] bg-white/80 p-4 shadow-[0_24px_60px_rgba(97,55,22,0.18)] backdrop-blur-md"
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                <label className="relative md:col-span-3">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-orange-500">📍</span>
                  <select
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    className="h-12 w-full rounded-xl border border-[#eadbcc] bg-white pl-10 pr-3 text-lg text-stone-800 outline-none transition focus:border-orange-300"
                  >
                    <option value="Bangalore">Bangalore</option>
                    <option value="Bhubaneswar">Bhubaneswar</option>
                  </select>
                </label>

                <label className="relative md:col-span-3">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-orange-500">💬</span>
                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="h-12 w-full rounded-xl border border-[#eadbcc] bg-white pl-10 pr-3 text-lg text-stone-800 outline-none transition focus:border-orange-300"
                  >
                    <option value="Odia">Odia</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Bengali">Bengali</option>
                  </select>
                </label>

                <label className="md:col-span-4">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search Pooja"
                    className="h-12 w-full rounded-xl border border-[#eadbcc] bg-white px-4 text-lg text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-orange-300"
                  />
                </label>

                <button
                  type="submit"
                  className="h-12 rounded-xl bg-linear-to-r from-[#ec9b2f] to-[#e1841e] px-6 text-xl font-semibold text-white shadow-[0_10px_22px_rgba(221,123,28,0.38)] transition hover:brightness-105 md:col-span-2"
                >
                  Find Puja
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {quickSuggestions.map((term, index) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchTerm(term)
                      goToServices(term)
                    }}
                    className="rounded-full border border-[#eadbcf] bg-[#fef5ec] px-4 py-1.5 text-base text-[#5b3b25] transition hover:bg-[#fdebd9]"
                  >
                    {index === 0 ? '🔥 ' : ''}
                    {term}
                  </button>
                ))}
              </div>
            </form>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: '11 Services', icon: '🪔' },
                { label: city, icon: '📍' },
                { label: language, icon: '💬' },
                { label: '12 Packages', icon: '📦' },
              ].map(({ label, icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl border border-[#eadacc] bg-white/88 px-4 py-3 shadow-[0_10px_24px_rgba(95,56,27,0.12)] backdrop-blur"
                >
                  <span className="text-xl" aria-hidden="true">{icon}</span>
                  <span className="text-xl font-medium text-[#332116]">{label}</span>
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

