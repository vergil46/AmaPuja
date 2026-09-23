import { Link } from 'react-router-dom'
import { getPoojaImage } from '../assets/poojaImageMap'
import fallbackImage from '../assets/poojas/puja-ceremony.jpg'
import { slugify } from '../utils/slug'

function PoojaCard({ pooja, selectedCity, selectedLanguage }) {
  const customImage = getPoojaImage(pooja.title, pooja.image)
  const queryParams = new URLSearchParams()
  const isBengaliVivahCard =
    String(selectedLanguage || '').toLowerCase() === 'bengali' &&
    /vivah/i.test(String(pooja?.title || ''))

  if (selectedCity) {
    queryParams.set('city', selectedCity)
  }

  if (selectedLanguage) {
    queryParams.set('language', selectedLanguage)
  }

  const queryString = queryParams.toString()
  const cityQuery = queryString ? `?${queryString}` : ''
  const citySlug = String(selectedCity || '').trim().toLowerCase()
  const localPageLink = citySlug ? `/locations/${citySlug}/${slugify(pooja.title)}` : ''

  return (
    <article className="card group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative overflow-hidden">
        <img
          src={customImage}
          alt={pooja.title}
          loading="lazy"
          decoding="async"
          fetchpriority="low"
          width="600"
          height="600"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="aspect-square w-full max-h-150 object-cover object-center transition-transform duration-500 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.onerror = null
            event.currentTarget.src = fallbackImage
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/40 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-stone-900 sm:text-xl">🪔 {pooja.title}</h3>

        {!isBengaliVivahCard && (
          <p className="mt-3 text-base font-semibold text-orange-700 sm:text-lg">Starting ₹{pooja.startPrice}</p>
        )}

        <ul className="mt-3 space-y-2 text-sm text-stone-700 sm:text-base">
          <li>✓ Pandit included</li>
          <li>✓ Puja Samagri</li>
          <li>✓ Experienced Pandit</li>
        </ul>

        <Link
          to={`/services/${pooja._id}${cityQuery}`}
          className="mt-auto inline-block pt-5"
        >
          <span className="inline-block w-full rounded-xl bg-linear-to-r from-[#D84315] to-[#FF6F00] px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:brightness-105 sm:w-auto">
            Book Now
          </span>
        </Link>
        {localPageLink && (
          <Link to={localPageLink} className="mt-2 text-sm text-orange-700 hover:text-orange-800 hover:underline">
            {pooja.title} in {selectedCity}
          </Link>
        )}
      </div>
    </article>
  )
}

export default PoojaCard
