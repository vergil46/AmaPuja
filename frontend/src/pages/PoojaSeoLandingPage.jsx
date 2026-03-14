import { Link } from 'react-router-dom'
import Seo from '../components/Seo'

const SITE_URL = 'https://pujasmarddhi.vercel.app'

const pageContent = {
  'satyanarayan-puja': {
    title: 'Satyanarayan Puja Booking | Puja Samrddhi',
    heading: 'Satyanarayan Puja',
    description:
      'Book experienced pandits for Satyanarayan Puja at home with complete guidance and authentic rituals.',
    highlights: [
      'Ideal for griha pravesh, birthdays, and family well-being',
      'Step-by-step ritual guidance in your preferred language',
      'Options with and without puja samagri',
    ],
  },
  'griha-pravesh-puja': {
    title: 'Griha Pravesh Puja Booking | Puja Samrddhi',
    heading: 'Griha Pravesh Puja',
    description:
      'Perform a peaceful housewarming ritual with verified pandits and transparent pricing for Griha Pravesh Puja.',
    highlights: [
      'Auspicious muhurat support and ritual planning',
      'Experienced pandits for vastu and griha shanti rituals',
      'Smooth online booking and call support',
    ],
  },
  'ganesh-puja': {
    title: 'Ganesh Puja Booking | Puja Samrddhi',
    heading: 'Ganesh Puja',
    description:
      'Book Ganesh Puja for new beginnings, office opening, and prosperity with trusted pandits near you.',
    highlights: [
      'Best for business openings and milestone events',
      'Proper vidhi with mantra and sankalp',
      'Fast booking with verified priest profiles',
    ],
  },
  rudrabhishek: {
    title: 'Rudrabhishek Puja Booking | Puja Samrddhi',
    heading: 'Rudrabhishek',
    description:
      'Schedule Rudrabhishek Puja with skilled pandits to seek divine blessings, peace, and protection.',
    highlights: [
      'Traditional abhishek procedure with Vedic chanting',
      'Suitable for health, peace, and spiritual upliftment',
      'Convenient slot booking with quick support',
    ],
  },
}

function PoojaSeoLandingPage({ slug }) {
  const content = pageContent[slug]

  if (!content) {
    return null
  }

  const canonical = `${SITE_URL}/${slug}`
  const servicesSearchLink = `/services?search=${encodeURIComponent(content.heading)}`

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <Seo title={content.title} description={content.description} canonical={canonical} />

      <p className="text-xs font-semibold uppercase tracking-widest text-orange-700">Sacred Ritual Service</p>
      <h1 className="mt-2 text-3xl font-extrabold text-stone-900 sm:text-4xl">{content.heading}</h1>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-stone-700 sm:text-lg">{content.description}</p>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        {content.highlights.map((item) => (
          <article key={item} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-sm leading-relaxed text-stone-700">{item}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to={servicesSearchLink}
          className="rounded-xl bg-orange-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-800"
        >
          View Packages
        </Link>
        <Link
          to="/services"
          className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-50"
        >
          Browse All Services
        </Link>
      </div>
    </section>
  )
}

export default PoojaSeoLandingPage
