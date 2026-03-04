import { Link } from 'react-router-dom'
import { getPoojaImage } from '../assets/poojaImageMap'
import { slugify } from '../utils/slug'

function PoojaCard({ pooja, selectedCity, selectedLanguage }) {
  const customImage = getPoojaImage(pooja.title, pooja.image)
  const selectedLanguageKey = String(selectedLanguage || '').trim().toLowerCase()
  const languagePackages =
    Array.isArray(pooja?.pricing?.[selectedLanguageKey]?.packages) && pooja.pricing[selectedLanguageKey].packages.length > 0
      ? pooja.pricing[selectedLanguageKey].packages
      : []
  const packageCandidates =
    languagePackages.length > 0
      ? languagePackages
      : Array.isArray(pooja?.packages)
        ? pooja.packages
        : []

  const hasBenefits = packageCandidates.some(
    (pkg) => Array.isArray(pkg?.inclusions) && pkg.inclusions.some((item) => String(item || '').trim())
  )
  const hasRitualSteps = packageCandidates.some(
    (pkg) => Array.isArray(pkg?.procedure) && pkg.procedure.some((item) => String(item || '').trim())
  )
  const hasRequirements = packageCandidates.some(
    (pkg) =>
      String(pkg?.pandits || '').trim() ||
      String(pkg?.note || '').trim() ||
      String(pkg?.description || '').trim()
  )

  const sectionBadges = [
    hasBenefits
      ? {
          key: 'benefits',
          icon: '✨',
          label: 'Benefits',
          className: 'border-orange-200 bg-orange-50 text-orange-800',
        }
      : null,
    hasRitualSteps
      ? {
          key: 'ritual-steps',
          icon: '🪔',
          label: 'Ritual Steps',
          className: 'border-amber-200 bg-amber-50 text-amber-800',
        }
      : null,
    hasRequirements
      ? {
          key: 'requirements',
          icon: '📋',
          label: 'Requirements',
          className: 'border-stone-300 bg-stone-100 text-stone-700',
        }
      : null,
  ].filter(Boolean)

  const shortDescription =
    String(pooja?.description || '').length > 120
      ? `${String(pooja?.description || '').slice(0, 117).trim()}...`
      : String(pooja?.description || '')
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
            event.currentTarget.src = pooja.image
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/40 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-stone-900 sm:text-xl">{pooja.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-stone-600 sm:text-base">{shortDescription}</p>

        {sectionBadges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {sectionBadges.map((badge) => (
              <span
                key={badge.key}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${badge.className}`}
              >
                <span aria-hidden="true">{badge.icon}</span>
                {badge.label}
              </span>
            ))}
          </div>
        )}

        {!isBengaliVivahCard && (
          <p className="mt-3 text-base font-semibold text-orange-700 sm:text-lg">Starting ₹{pooja.startPrice}</p>
        )}
        <Link
          to={`/services/${pooja._id}${cityQuery}`}
          className="mt-auto inline-block pt-4"
        >
          <span className="inline-block w-full rounded-lg bg-linear-to-r from-stone-900 to-stone-700 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm group-hover:shadow-md sm:w-auto">
            View Details
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
