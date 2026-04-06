import { Link, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import Seo from '../components/Seo'
import api from '../services/api'
import { slugify, titleFromSlug } from '../utils/slug'

const CITY_LABELS = {
  bangalore: 'Bangalore',
  bhubaneswar: 'Bhubaneswar',
}

function LocalServiceLandingPage() {
  const { city, service } = useParams()
  const [pooja, setPooja] = useState(null)

  const cityLabel = CITY_LABELS[String(city || '').toLowerCase()] || titleFromSlug(city)
  const serviceLabel = titleFromSlug(service)

  useEffect(() => {
    let ignore = false
    api
      .get('/poojas')
      .then((response) => {
        if (ignore) return
        const list = Array.isArray(response.data) ? response.data : []
        const found = list.find((item) => slugify(item?.title) === String(service || '').toLowerCase())
        setPooja(found || null)
      })
      .catch(() => {
        if (!ignore) setPooja(null)
      })

    return () => {
      ignore = true
    }
  }, [service])

  const pageTitle = `${serviceLabel} in ${cityLabel} | Puja Samriddhi`
  const pageDescription = `Book ${serviceLabel} in ${cityLabel} with verified priests, transparent pricing, and secure payments on Puja Samriddhi.`

  const faqItems = useMemo(
    () => [
      {
        question: `How much does ${serviceLabel} cost in ${cityLabel}?`,
        answer: pooja?.startPrice
          ? `The starting package for ${serviceLabel} in ${cityLabel} begins from ₹${pooja.startPrice}. Final cost depends on package and add-ons.`
          : `The final cost for ${serviceLabel} in ${cityLabel} depends on package, language preference, and add-ons.`,
      },
      {
        question: `Can I choose priest language for ${serviceLabel}?`,
        answer:
          'Yes, language preferences such as Odia, Hindi, Bengali, and Kannada are available based on service and location.',
      },
      {
        question: `How quickly is booking confirmation shared?`,
        answer:
          'Most requests are confirmed quickly through dashboard updates and notification channels after submission.',
      },
    ],
    [cityLabel, serviceLabel, pooja]
  )

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <Seo title={pageTitle} description={pageDescription} structuredData={faqSchema} />

      <div className="rounded-2xl border border-[#FFE0A3] bg-white p-6 sm:p-8 shadow-sm">
        <p className="text-xs font-semibold tracking-wide uppercase text-[#FF6F00]">Local Service Page</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-[#333333]">
          {serviceLabel} in {cityLabel}
        </h1>
        <p className="mt-3 text-[#333333]/78 leading-relaxed">{pageDescription}</p>

        <div className="mt-5 grid sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl border border-[#FFE0A3] bg-[#FFFDF5] p-3">
            <p className="text-stone-500">Location</p>
            <p className="font-semibold text-[#333333] mt-1">{cityLabel}</p>
          </div>
          <div className="rounded-xl border border-[#FFE0A3] bg-[#FFFDF5] p-3">
            <p className="text-stone-500">Service</p>
            <p className="font-semibold text-[#333333] mt-1">{serviceLabel}</p>
          </div>
          <div className="rounded-xl border border-[#FFE0A3] bg-[#FFFDF5] p-3">
            <p className="text-stone-500">Starting Price</p>
            <p className="font-semibold text-[#333333] mt-1">{pooja?.startPrice ? `₹${pooja.startPrice}` : 'Contact for pricing'}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link
            to={`/services/${pooja?._id || ''}?city=${encodeURIComponent(cityLabel)}`}
            className="px-4 py-2.5 rounded-lg bg-linear-to-r from-[#D84315] to-[#FF6F00] text-white text-sm font-medium hover:brightness-110"
          >
            Book This Service
          </Link>
          <Link
            to="/services"
            className="px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-[#333333] text-sm font-medium hover:bg-stone-50"
          >
            Explore All Services
          </Link>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-[#FFE0A3] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[#333333]">FAQs</h2>
        <div className="mt-4 space-y-4">
          {faqItems.map((item) => (
            <article key={item.question} className="rounded-xl border border-[#FFE0A3] p-4">
              <h3 className="font-semibold text-[#333333]">{item.question}</h3>
              <p className="mt-1 text-sm text-[#333333]/78 leading-relaxed">{item.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default LocalServiceLandingPage

