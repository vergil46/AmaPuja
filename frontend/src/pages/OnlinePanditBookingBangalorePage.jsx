import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { getPoojaImage } from '../assets/poojaImageMap'
import ganeshPujaBangaloreImg from '../assets/poojas/ganesh-puja-bangalore.jpg'
import grihaPraveshBangaloreImg from '../assets/poojas/griha-pravesh-bangalore.jpg'
import onlinePanditBangaloreImg from '../assets/poojas/online-pandit-bangalore-1.jpg'

const SITE_URL = 'https://pujasamriddhi.com'
const PAGE_PATH = '/online-pandit-booking-bangalore'

const galleryItems = [
  {
    image: onlinePanditBangaloreImg,
    title: 'Online Pandit Booking Bangalore',
    caption: 'Trusted online pandit booking service for puja ceremonies across Bangalore homes.',
  },
  {
    title: 'Satyanarayan Puja',
    caption: 'Satyanarayan Puja service in Bangalore',
  },
  {
    image: grihaPraveshBangaloreImg,
    title: 'Griha Pravesh',
    caption: 'Griha Pravesh pandit booking for housewarming in Bangalore',
  },
  {
    image: ganeshPujaBangaloreImg,
    title: 'Ganesh Puja',
    caption: 'Ganesh Puja performed by experienced pandits in Bangalore',
  },
  {
    title: 'Lakshmi Puja',
    caption: 'Lakshmi Puja rituals for prosperity and blessings',
  },
  {
    title: 'Rudrabhishek Puja',
    caption: 'Traditional Rudrabhishek Puja with Vedic procedure',
  },
  {
    title: 'Namkaran Puja',
    caption: 'Namkaran and family rituals performed at home in Bangalore',
  },
]

const faqItems = [
  {
    question: 'How can I book an experienced pandit online in Bangalore?',
    answer:
      'You can book online by selecting a puja package, sharing preferred date and location, and confirming your booking through Puja Samriddhi.',
  },
  {
    question: 'Which puja services are available in Bangalore?',
    answer:
      'Popular services include Satyanarayan Puja, Griha Pravesh Puja, Ganesh Puja, Lakshmi Puja, Navagraha Puja, Rudrabhishek, Vastu Puja, wedding rituals, Namkaran, and Annaprashan.',
  },
  {
    question: 'Are rituals performed as per Vedic guidelines?',
    answer:
      'Yes, all rituals are performed by experienced pandits according to Hindu traditions and Vedic procedures.',
  },
]

function OnlinePanditBookingBangalorePage() {
  const canonical = `${SITE_URL}${PAGE_PATH}`

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: 'Online Pandit Booking Bangalore',
        provider: {
          '@type': 'Organization',
          name: 'Puja Samriddhi',
          url: SITE_URL,
        },
        areaServed: {
          '@type': 'City',
          name: 'Bangalore',
        },
        serviceType: 'Pandit Booking for Puja and Hindu Rituals',
        url: canonical,
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <Seo
        title="Online Pandit Booking Bangalore | Puja Samriddhi"
        description="Book experienced pandits online in Bangalore for Satyanarayan Puja, Griha Pravesh, Ganesh Puja, Lakshmi Puja, Navagraha, Rudrabhishek, Vastu and more with proper Vedic rituals."
        canonical={canonical}
        structuredData={structuredData}
      />

      <p className="text-xs font-semibold uppercase tracking-widest text-orange-700">Bangalore Pandit Booking</p>
      <h1 className="mt-2 text-3xl font-extrabold text-stone-900 sm:text-4xl">Book Experienced Pandit Online in Bangalore</h1>
      <p className="mt-4 max-w-4xl text-base leading-relaxed text-stone-700 sm:text-lg">
        Looking for a trusted pandit for puja in Bangalore? Puja Samriddhi makes it easy to book experienced
        Vedic pandits online for all types of Hindu rituals and ceremonies. Whether it is a housewarming ceremony,
        Satyanarayan Puja, Ganesh Puja, or any religious ritual, our knowledgeable pandits perform the puja with
        proper Vedic procedures and traditions.
      </p>
      <p className="mt-3 max-w-4xl text-base leading-relaxed text-stone-700 sm:text-lg">
        With our online pandit booking service in Bangalore, you can easily schedule a puja at your home without
        any hassle. Our pandits bring the required knowledge, guidance, and devotion to make your religious ceremony
        peaceful and successful.
      </p>

      <h2 className="mt-10 text-2xl font-bold text-stone-900 sm:text-3xl">Puja Services Available in Bangalore</h2>
      <p className="mt-3 max-w-4xl text-base leading-relaxed text-stone-700">
        We provide pandits for many types of pujas and rituals including:
      </p>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {[
          'Satyanarayan Puja',
          'Griha Pravesh Puja (Housewarming)',
          'Ganesh Puja',
          'Lakshmi Puja',
          'Navagraha Puja',
          'Rudrabhishek Puja',
          'Vastu Puja',
          'Wedding Puja rituals',
          'Naming ceremony (Namkaran)',
          'Annaprashan ceremony',
        ].map((service) => (
          <li key={service} className="rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-700 shadow-sm">
            {service}
          </li>
        ))}
      </ul>

      <p className="mt-5 text-base leading-relaxed text-stone-700">
        All rituals are performed according to Hindu traditions and Vedic guidelines.
      </p>

      <h2 className="mt-10 text-2xl font-bold text-stone-900 sm:text-3xl">Photos of Popular Puja Services</h2>
      <p className="mt-3 max-w-4xl text-base leading-relaxed text-stone-700">
        Explore photos of some of the most booked puja services in Bangalore. These ceremonies are performed with
        proper vidhi, devotion, and traditional guidance by experienced pandits.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {galleryItems.map((item, index) => (
          <article key={item.title} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <img
              src={item.image || getPoojaImage(item.title)}
              alt={`${item.title} in Bangalore by Puja Samriddhi`}
              loading={index < 2 ? 'eager' : 'lazy'}
              decoding="async"
              fetchpriority={index < 2 ? 'high' : 'low'}
              className="h-60 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="text-sm font-semibold text-stone-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">{item.caption}</p>
            </div>
          </article>
        ))}
      </div>

      <h2 className="mt-10 text-2xl font-bold text-stone-900 sm:text-3xl">Why Families Choose Puja Samriddhi</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-stone-900">Verified Pandits</h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">Experienced Vedic pandits for authentic rituals and clear guidance.</p>
        </article>
        <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-stone-900">Easy Home Booking</h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">Convenient online booking for puja at your home across Bangalore locations.</p>
        </article>
        <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-stone-900">Ritual Support</h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">Step-by-step puja support from sankalp to completion with traditional method.</p>
        </article>
      </div>

      <h2 className="mt-10 text-2xl font-bold text-stone-900 sm:text-3xl">Frequently Asked Questions</h2>
      <div className="mt-5 space-y-3">
        {faqItems.map((item) => (
          <article key={item.question} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-stone-900">{item.question}</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">{item.answer}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/services"
          className="rounded-xl bg-orange-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-800"
        >
          Browse Puja Services
        </Link>
        <Link
          to="/contact"
          className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-50"
        >
          Contact for Booking Help
        </Link>
      </div>
    </section>
  )
}

export default OnlinePanditBookingBangalorePage
