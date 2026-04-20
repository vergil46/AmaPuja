import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import homeBackground from '../assets/poojas/background-optimized-1280.webp'
import Seo from '../components/Seo'
import WorkProofGallery from '../components/WorkProofGallery'
import GoogleBusinessCard from '../components/GoogleBusinessCard'
import Testimonials from '../components/Testimonials'

const MapPinIcon = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 21C12 21 19 14.8 19 10C19 6.13 15.87 3 12 3C8.13 3 5 6.13 5 10C5 14.8 12 21 12 21Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
  </svg>
)

const LanguageIcon = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4.75 6.5H19.25C19.94 6.5 20.5 7.06 20.5 7.75V15.75C20.5 16.44 19.94 17 19.25 17H11L7 20V17H4.75C4.06 17 3.5 16.44 3.5 15.75V7.75C3.5 7.06 4.06 6.5 4.75 6.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 11H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const DiyaIcon = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 4.5C12.9 5.68 13.43 6.62 13.43 7.6C13.43 8.56 12.73 9.34 12 9.34C11.27 9.34 10.57 8.56 10.57 7.6C10.57 6.62 11.1 5.68 12 4.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.5 14.25C5.66 12.24 8.47 10.75 12 10.75C15.53 10.75 18.34 12.24 19.5 14.25C18.34 16.26 15.53 17.75 12 17.75C8.47 17.75 5.66 16.26 4.5 14.25Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

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
              Verified priests • Same-day booking
            </p>
            <p className="mt-2 max-w-3xl text-base font-medium text-[#6a4223] sm:text-xl">
              Transparent pricing, direct confirmation support, and secure payment with pay-after-pooja option.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="https://wa.me/919739362962"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-14 items-center justify-center gap-2.5 rounded-2xl bg-linear-to-r from-green-600 to-green-500 px-7 py-3 text-base font-bold text-white shadow-[0_14px_28px_rgba(22,163,74,0.34)] transition hover:-translate-y-0.5 hover:brightness-105 sm:text-lg"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/16" aria-hidden="true">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.05 4.94A9.82 9.82 0 0 0 12.05 2a9.94 9.94 0 0 0-8.61 14.93L2 22l5.24-1.38A9.93 9.93 0 0 0 12.05 22 9.95 9.95 0 0 0 22 12.07a9.83 9.83 0 0 0-2.95-7.13ZM12.05 20.3a8.25 8.25 0 0 1-4.2-1.15l-.3-.18-3.1.81.83-3.02-.2-.31a8.25 8.25 0 1 1 6.97 3.85Zm4.52-6.2c-.25-.13-1.5-.74-1.73-.82-.23-.09-.4-.13-.56.12-.17.25-.65.82-.8.98-.15.17-.3.19-.56.06-.25-.12-1.08-.4-2.06-1.27-.76-.67-1.27-1.5-1.42-1.75-.15-.25-.02-.38.11-.5.11-.11.25-.3.38-.44.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.07-.13-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.42.06-.64.31-.22.25-.84.82-.84 2.01 0 1.19.86 2.35.98 2.51.12.17 1.69 2.58 4.08 3.62.57.25 1.02.4 1.37.51.58.18 1.1.15 1.52.09.46-.07 1.5-.61 1.71-1.2.21-.59.21-1.1.15-1.2-.06-.1-.23-.16-.48-.29Z" />
                  </svg>
                </span>
                <span>Book on WhatsApp Now</span>
              </a>
              <a
                href="tel:+919739362962"
                className="inline-flex min-h-14 items-center justify-center gap-2.5 rounded-2xl border border-[#d48a52] bg-white/90 px-7 py-3 text-base font-bold text-[#7a3c16] shadow-[0_10px_24px_rgba(122,60,22,0.18)] transition hover:-translate-y-0.5 hover:bg-white sm:text-lg"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#d9a179] bg-[#fff3e8]" aria-hidden="true">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 4.75H8.3C8.78 4.75 9.19 5.09 9.28 5.56L9.88 8.7C9.96 9.14 9.8 9.58 9.46 9.86L7.93 11.13C9.2 13.93 11.44 16.17 14.24 17.44L15.51 15.91C15.79 15.57 16.23 15.41 16.67 15.49L19.81 16.09C20.28 16.18 20.62 16.59 20.62 17.07V20.37C20.62 20.86 20.23 21.25 19.74 21.25H18.5C10.49 21.25 3.99 14.75 3.99 6.74V5.5C3.99 5.01 4.38 4.62 4.87 4.62H5V4.75Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>Call Pandit Instantly</span>
              </a>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#f4b37f] bg-[#fff3e8] px-4 py-1.5 text-sm font-semibold text-[#9a4e1f]">
                Available Today
              </span>
              <span className="rounded-full border border-[#f4b37f] bg-[#fff3e8] px-4 py-1.5 text-sm font-semibold text-[#9a4e1f]">
                Quick Booking in 30 Minutes
              </span>
              <span className="rounded-full border border-[#f4b37f] bg-[#fff3e8] px-4 py-1.5 text-sm font-semibold text-[#9a4e1f]">
                No Hidden Charges
              </span>
              <span className="rounded-full border border-[#f4b37f] bg-[#fff3e8] px-4 py-1.5 text-sm font-semibold text-[#9a4e1f]">
                Pay After Pooja Available
              </span>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="mt-8 rounded-3xl border border-[#e7d2bf] bg-white/80 p-4 shadow-[0_24px_60px_rgba(97,55,22,0.18)] backdrop-blur-md"
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                <label className="relative md:col-span-3">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" aria-hidden="true">
                    <MapPinIcon />
                  </span>
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
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" aria-hidden="true">
                    <LanguageIcon />
                  </span>
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
                  className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-xl bg-linear-to-r from-[#ec9b2f] to-[#e1841e] px-5 text-base font-semibold text-white shadow-[0_10px_22px_rgba(221,123,28,0.38)] transition hover:brightness-105 md:col-span-2 md:min-w-35"
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
                { label: '25+ Poojas', icon: <DiyaIcon className="h-5 w-5" /> },
                { label: city, icon: <MapPinIcon className="h-5 w-5" /> },
                { label: language, icon: <LanguageIcon className="h-5 w-5" /> },
              ].map(({ label, icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl border border-[#eadacc] bg-white/88 px-4 py-3 shadow-[0_10px_24px_rgba(95,56,27,0.12)] backdrop-blur"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e3c6ad] bg-[#fff3e8] text-[#a55b2a]" aria-hidden="true">{icon}</span>
                  <span className="text-xl font-medium text-[#332116]">{label}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-[#FFE0A3] bg-white/88 p-4 shadow-[0_12px_30px_rgba(95,56,27,0.1)]">
              <div className="grid gap-2 text-sm font-semibold text-[#333333] sm:grid-cols-3 sm:text-base">
                <p>Secure online payment</p>
                <p>Verified priest assignment</p>
                <p>Call support: +91 97393 62962</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WorkProofGallery />

      {/* ── Why Us ── */}
      <section className="bg-[#FFF8E1] px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between gap-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-[#FF6F00]">Why choose us</p>
              <h2 className="mt-1 text-xl font-bold text-[#333333] sm:text-3xl">Why Families Choose Puja Samriddhi</h2>
            </div>
            <Link to="/services" className="hidden text-sm font-semibold text-[#FF6F00] hover:text-[#D84315] sm:inline-flex">
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
                iconBg: 'from-[#D84315] to-[#FF6F00]',
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
                iconBg: 'from-[#FF6F00] to-[#FF8F00]',
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
                iconBg: 'from-[#FF8F00] to-[#F9A825]',
                title: 'City-Wise Service',
                desc: 'Available in Bangalore and Bhubaneswar with on-time arrival and dedicated support.',
              },
            ].map(({ delay, icon, iconBg, title, desc }) => (
              <article
                key={title}
                className="group flex flex-col rounded-2xl border border-[#FFE0A3] bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl animate-fade-up"
                style={{ animationDelay: delay }}
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${iconBg} shadow-md`}>
                  {icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-[#333333]">{title}</h3>
                <p className="text-base leading-relaxed text-[#333333]/78">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Google Business Profile ── */}
      <GoogleBusinessCard variant="full" />

      <Testimonials />
    </>
  )
}

export default HomePage

