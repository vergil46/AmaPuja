import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { getPoojaImage } from '../assets/poojaImageMap'
import ganeshPujaBangaloreImg from '../assets/poojas/ganesh-puja-pandit-bangalore.jpg'
import grihaPraveshBangaloreImg from '../assets/poojas/griha-pravesh-puja-bangalore.jpg'
import lakshmiPujaBangaloreImg from '../assets/poojas/lakshmi-puja-bangalore.jpg'
import satyanarayanPujaBangaloreImg from '../assets/poojas/satyanarayan-puja-bangalore.jpg'

const SITE_URL = 'https://pujasamriddhi.com'
const PAGE_PATH = '/online-pandit-booking-bangalore'

const galleryItems = [
  {
    image: satyanarayanPujaBangaloreImg,
    title: 'Satyanarayan Puja',
    link: '/satyanarayan-puja',
    alt: 'Satyanarayan Puja ceremony performed by pandit in Bangalore',
    caption: 'Satyanarayan Puja service in Bangalore',
  },
  {
    image: grihaPraveshBangaloreImg,
    title: 'Griha Pravesh',
    link: '/griha-pravesh-puja',
    alt: 'Griha Pravesh housewarming puja setup in Bangalore',
    caption: 'Griha Pravesh pandit booking for housewarming in Bangalore',
  },
  {
    image: ganeshPujaBangaloreImg,
    title: 'Ganesh Puja',
    link: '/ganesh-puja',
    alt: 'Ganesh Puja ceremony performed by pandit in Bangalore',
    caption: 'Ganesh Puja performed by experienced pandits in Bangalore',
  },
  {
    image: lakshmiPujaBangaloreImg,
    title: 'Lakshmi Puja',
    link: '/lakshmi-puja',
    alt: 'Lakshmi Puja ritual for prosperity performed by pandit in Bangalore',
    caption: 'Lakshmi Puja rituals for prosperity and blessings',
  },
  {
    title: 'Rudrabhishek Puja',
    link: '/rudrabhishek',
    alt: 'Rudrabhishek Puja ritual performed by experienced pandit in Bangalore',
    caption: 'Traditional Rudrabhishek Puja with Vedic procedure',
  },
  {
    title: 'Namkaran Puja',
    link: '/services?search=Namkaran%20Puja',
    alt: 'Namkaran Puja naming ceremony performed at home by pandit in Bangalore',
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

      <p className="text-xs font-semibold uppercase tracking-widest text-[#FF6F00]">Bangalore Pandit Booking</p>
      <h1 className="mt-2 text-3xl font-extrabold text-[#333333] sm:text-4xl">Book Experienced Pandit Online in Bangalore</h1>
      <p className="mt-4 max-w-4xl text-base leading-relaxed text-[#333333]/78 sm:text-lg">
        Looking for a trusted pandit for puja in Bangalore? Puja Samriddhi makes it easy to book experienced
        Vedic pandits online for all types of Hindu rituals and ceremonies. Whether it is a housewarming ceremony,
        Satyanarayan Puja, Ganesh Puja, or any religious ritual, our knowledgeable pandits perform the puja with
        proper Vedic procedures and traditions.
      </p>
      <p className="mt-3 max-w-4xl text-base leading-relaxed text-[#333333]/78 sm:text-lg">
        With our online pandit booking service in Bangalore, you can easily schedule a puja at your home without
        any hassle. Our pandits bring the required knowledge, guidance, and devotion to make your religious ceremony
        peaceful and successful.
      </p>

      <h2 className="mt-10 text-2xl font-bold text-[#333333] sm:text-3xl">Puja Services Available in Bangalore</h2>
      <p className="mt-3 max-w-4xl text-base leading-relaxed text-[#333333]/78">
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
          <li key={service} className="rounded-xl border border-[#FFE0A3] bg-white p-4 text-sm text-[#333333]/82 shadow-sm">
            {service}
          </li>
        ))}
      </ul>

      <p className="mt-5 text-base leading-relaxed text-[#333333]/78">
        All rituals are performed according to Hindu traditions and Vedic guidelines.
      </p>

      <h2 className="mt-10 text-2xl font-bold text-[#333333] sm:text-3xl">Photos of Popular Puja Services</h2>
      <p className="mt-3 max-w-4xl text-base leading-relaxed text-[#333333]/78">
        Explore photos of some of the most booked puja services in Bangalore. These ceremonies are performed with
        proper vidhi, devotion, and traditional guidance by experienced pandits.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {galleryItems.map((item, index) => (
          <Link
            key={item.title}
            to={item.link}
            className="group overflow-hidden rounded-2xl border border-[#FFE0A3] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            aria-label={`Open ${item.title} service page`}
          >
            <article>
              <img
                src={item.image || getPoojaImage(item.title)}
                alt={item.alt}
                loading={index < 2 ? 'eager' : 'lazy'}
                decoding="async"
                fetchpriority={index < 2 ? 'high' : 'low'}
                className="h-60 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="p-4">
                <h3 className="text-sm font-semibold text-[#333333]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#333333]/78">{item.caption}</p>
                <span className="mt-3 inline-flex text-sm font-semibold text-[#FF6F00] transition group-hover:text-[#D84315]">
                  View service
                </span>
              </div>
            </article>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-2xl font-bold text-[#333333] sm:text-3xl">Why Families Choose Puja Samriddhi</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-[#FFE0A3] bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-[#333333]">Verified Pandits</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#333333]/78">Experienced Vedic pandits for authentic rituals and clear guidance.</p>
        </article>
        <article className="rounded-2xl border border-[#FFE0A3] bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-[#333333]">Easy Home Booking</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#333333]/78">Convenient online booking for puja at your home across Bangalore locations.</p>
        </article>
        <article className="rounded-2xl border border-[#FFE0A3] bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-[#333333]">Ritual Support</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#333333]/78">Step-by-step puja support from sankalp to completion with traditional method.</p>
        </article>
      </div>

      <h2 className="mt-10 text-2xl font-bold text-[#333333] sm:text-3xl">Frequently Asked Questions</h2>
      <div className="mt-5 space-y-3">
        {faqItems.map((item) => (
          <article key={item.question} className="rounded-xl border border-[#FFE0A3] bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-[#333333]">{item.question}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#333333]/78">{item.answer}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/services"
          className="rounded-xl bg-linear-to-r from-[#D84315] via-[#FF6F00] to-[#FF8F00] px-5 py-3 text-sm font-semibold text-white transition hover:from-[#C63B12] hover:via-[#F57C00] hover:to-[#FB8C00]"
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
