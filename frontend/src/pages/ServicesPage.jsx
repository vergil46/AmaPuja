import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PoojaCard from '../components/PoojaCard'
import Seo from '../components/Seo'
import api from '../services/api'

const normalizeTitle = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const normalizeLanguageKey = (value) => String(value || '').trim().toLowerCase()

const allowedPriestPreferences = new Set(['Hindi', 'Odia', 'Bengali', 'Kannada'])
const allowedCities = new Set(['Bangalore', 'Bhubaneswar'])

const defaultPoojas = [
  'Annaprashan Puja',
  'Engagement Puja',
  'Ganapathi Puja',
  'Griha Pravesh',
  'Janma Chuti Poka (Mundan)',
  'Lakshmi Puja',
  'Namkaran Puja (Ekoisia)',
  'Office/Shop Opening Puja',
  'Saraswati Puja',
  'Satyanarayan Puja',
  'Vishwakarma Puja',
].map((title, index) => {
  let startPrice = 3500 + index * 400;
  let packages = [
    { name: 'Without Samagri', price: startPrice, includesSamagri: false },
    { name: 'With Samagri', price: Math.round(startPrice * 1.35), includesSamagri: true },
  ];

  // Special case for Saraswati Puja: custom description, pricing, and packages
  if (title === 'Saraswati Puja') {
    return {
      _id: `default-${index + 1}`,
      title,
      description:
        'Mata Saraswati is the deity of intelligence, wisdom, arts, music, memory power, and other soft skills. This havan relieves people from mental pressure. It improves concentration, memory power, focus, and the ability to understand complex things.',
      image: 'https://images.unsplash.com/photo-1542327897-d73f4005b533?auto=format&fit=crop&w=1200&q=80',
      startPrice: 3500,
      pricing: {
        odia: {
          packages: [
            {
              name: 'With Samagri',
              price: 4300,
              pandits: '1 Panditji + Pooja Samagries',
              procedure: [
                'Ghata Sthapana',
                'Sankalpa',
                'Ganapathi Puja',
                'Panchdevata Puja',
                'Saraswati Devi Avahan',
                'Bhog Neivedhya',
                'Aarti',
                'Pushpanjali',
                'Prasad Sevan',
              ],
              inclusions: ['Dakshina', 'Puja Samagries'],
            },
          ],
          addOns: [
            { name: 'Flowers & Fruits', price: 1000 },
            { name: 'Havan', price: 1000 },
          ],
        },
        hindi: {
          packages: [
            {
              name: 'Standard',
              price: 3500,
              pandits: '1 Pandit + All Pooja Materials',
              procedure: [
                'Swasti vachanam',
                'Maha Sankalp',
                'Ganapathi Puja',
                'Saraswati Puja',
                'Aarti & Prasad Distribution',
              ],
              inclusions: ['Dakshina', 'All Puja Samagries'],
            },
            {
              name: 'Premium',
              price: 6500,
              pandits: '2 Panditji + All Puja Samagries',
              procedure: [
                'Swasti vachanam',
                'Maha Sankalp',
                'Ganapathi Puja',
                'Punyaha Vachanam',
                'Saraswati Puja',
                'Aarti & Prasad Distribution',
              ],
              inclusions: ['Dakshina', 'All Puja Samagries'],
            },
          ],
          addOns: [
            { name: 'Flowers & Fruits', price: 1000 },
            { name: 'Havan', price: 1000 },
          ],
        },
        bengali: {
          packages: [
            {
              name: 'Standard',
              price: 4500,
              pandits: '1 Pandit + All Pooja Materials',
              procedure: [
                'Swasti vachanam',
                'Maha Sankalp',
                'Ganapathi Puja',
                'Punyaha Vachanam',
                'Saraswati Puja',
                'Aarti & Prasad Distribution',
              ],
              inclusions: ['Dakshina', 'All Puja Samagries'],
            },
          ],
          addOns: [
            { name: 'Flowers & Fruits', price: 1000 },
            { name: 'Havan', price: 1000 },
          ],
        },
      },
    };
  }

  return {
    _id: `default-${index + 1}`,
    title,
    description: `${title} performed by experienced pandits with authentic rituals and personalized guidance.`,
    image: 'https://images.unsplash.com/photo-1542327897-d73f4005b533?auto=format&fit=crop&w=1200&q=80',
    startPrice,
    packages,
  };
})

const priestLanguagePoojas = {
  Odia: new Set(
    [
      'Annaprashan Puja',
      'Engagement Puja',
      'Ganapathi Puja',
      'Griha Pravesh',
      'Janma Chuti Poka (Mundan)',
      'Lakshmi Puja',
      'Namkaran Puja (Ekoisia)',
      'Office Opening Puja',
      'Office/Shop Opening Puja',
      'Saraswati Puja',
      'Satyanarayan Puja',
      'Vishwakarma Puja',
    ].map(normalizeTitle)
  ),
  Hindi: new Set(
    [
      'Annaprashan Puja',
      'Bhoomi Puja',
      'Brihaspati Vrat Udyapan Puja',
      'Durga Puja',
      'Ekadashi Vrat Udyapan Puja',
      'Engagement Puja - Sagai',
      'Fix Your Muhurat',
      'Gand Mool Nakshatra Shanti Puja',
      'Ganesh Puja',
      'Godh Bharai Puja (Baby Shower)',
      'Graha Shanti Puja',
      'Griha Pravesh',
      'Haldi Ceremony',
      'Janamdin Puja - Birthday Puja',
      'Kuber Upasana Puja',
      'Lalitha Sahasranam Puja',
      'Mahalaxmi Puja',
      'Mundan Or Chudakarana Ceremony',
      'Murti Pran Pratishta At Home',
      'Namkaran Puja',
      'New Vehicle Puja',
      'Office Opening Puja',
      'Office/Shop Opening Puja',
      'Punsavan Sanskar',
      'Roka Ceremony',
      'Rudrabhishek Puja',
      'Saraswati Puja',
      'Satyanarayan Puja',
      'Shuddhikaran Puja',
      'Solah Somvar Udyapan Puja',
      'Solah Somvar Puja',
      'Surya Puja',
      'Vastu Shanti Puja',
      'Vidyarambham (Patti Pujan)',
      'Vishwakarma Puja',
      'Vivah (Marriage)',
      'Yagnopavit Sanskar',
    ].map(normalizeTitle)
  ),
  Bengali: new Set(
    [
      'Bhoomi Puja',
      'Durga Puja',
      'Ganesh Puja',
      'Griho Probesh',
      'Laxmi Puja',
      'Onnoprashon (Mukhe Bhaat)',
      'Saraswati Puja',
      'Satyanarayan Puja',
      'Upanayan',
      'Vivah (Marriage)',
      'Lakshmi Puja',
      'Annaprashan Puja',
      'Griha Pravesh (Gruha Pratistha)',
      'Ganapathi Puja',
    ].map(normalizeTitle)
  ),
  Kannada: new Set(),
}

const kannadaDisplayOrder = [
  'Aksharabhyasa',
  'Annaprasana',
  'Bhima Ratha Shanti (70th Birthday)',
  'Chaula or Chudakarma',
  'Devata Kalyanotsavam',
  'Fix Your Muhurtha',
  'Gruhapravesha Pooja',
  'Karna Vedhana',
  'Marriage',
  'Namakarana',
  'Nischitartha',
  'Sashtiapthapoorthi (60th Birthday)',
  'Sathabhishekam (80th birthday)',
  'Seemantha',
  'Upakarma',
  'Upanayana',
]

const kannadaTitleAliases = {
  Aksharabhyasa: ['Aksharabhyasa', 'Vidyarambham (Patti Pujan)'],
  Annaprasana: ['Annaprasana', 'Annaprashan Puja'],
  'Bhima Ratha Shanti (70th Birthday)': ['Bhima Ratha Shanti (70th Birthday)'],
  'Chaula or Chudakarma': ['Chaula or Chudakarma', 'Mundan Or Chudakarana Ceremony'],
  'Devata Kalyanotsavam': ['Devata Kalyanotsavam'],
  'Fix Your Muhurtha': ['Fix Your Muhurtha', 'Fix Your Muhurat'],
  'Gruhapravesha Pooja': ['Gruhapravesha Pooja', 'Griha Pravesh', 'Griha Pravesh (Gruha Pratistha)'],
  'Karna Vedhana': ['Karna Vedhana'],
  Marriage: ['Marriage', 'Vivah (Marriage)'],
  Namakarana: ['Namakarana', 'Namkaran Puja', 'Namkaran Puja (Ekoisia)'],
  Nischitartha: ['Nischitartha', 'Engagement Puja - Sagai', 'Engagement Puja – Nirbandha'],
  'Sashtiapthapoorthi (60th Birthday)': ['Sashtiapthapoorthi (60th Birthday)'],
  'Sathabhishekam (80th birthday)': ['Sathabhishekam (80th birthday)'],
  Seemantha: ['Seemantha', 'Godh Bharai Puja (Baby Shower)'],
  Upakarma: ['Upakarma'],
  Upanayana: ['Upanayana', 'Yagnopavit Sanskar', 'Upanayan'],
}

const normalizedKannadaAliasSet = new Set(
  Object.values(kannadaTitleAliases)
    .flat()
    .map(normalizeTitle)
)

const kannadaDisplayOrderIndex = Object.fromEntries(
  kannadaDisplayOrder.map((title, index) => [normalizeTitle(title), index])
)

const normalizedKannadaAliasOrderIndex = Object.entries(kannadaTitleAliases).reduce((acc, [canonicalTitle, aliases]) => {
  const displayIndex = kannadaDisplayOrderIndex[normalizeTitle(canonicalTitle)]
  aliases.forEach((aliasTitle) => {
    acc[normalizeTitle(aliasTitle)] = displayIndex
  })
  return acc
}, {})

const normalizedKannadaAliasCanonicalIndex = Object.entries(kannadaTitleAliases).reduce((acc, [canonicalTitle, aliases]) => {
  const normalizedCanonicalTitle = normalizeTitle(canonicalTitle)
  aliases.forEach((aliasTitle) => {
    acc[normalizeTitle(aliasTitle)] = normalizedCanonicalTitle
  })
  return acc
}, {})

const bengaliDisplayOrder = [
  'Bhoomi Puja',
  'Durga Puja',
  'Ganesh Puja',
  'Griho Probesh',
  'Laxmi Puja',
  'Onnoprashon (Mukhe Bhaat)',
  'Saraswati Puja',
  'Satyanarayan Puja',
  'Upanayan',
  'Vivah (Marriage)',
]

const bengaliTitleAliases = {
  'Bhoomi Puja': ['Bhoomi Puja'],
  'Durga Puja': ['Durga Puja'],
  'Ganesh Puja': ['Ganesh Puja'],
  'Griho Probesh': ['Griho Probesh', 'Griha Pravesh', 'Griha Pravesh (Gruha Pratistha)'],
  'Laxmi Puja': ['Laxmi Puja', 'Lakshmi Puja'],
  'Onnoprashon (Mukhe Bhaat)': ['Onnoprashon (Mukhe Bhaat)', 'Annaprashan Puja'],
  'Saraswati Puja': ['Saraswati Puja'],
  'Satyanarayan Puja': ['Satyanarayan Puja'],
  Upanayan: ['Upanayan', 'Yagnopavit Sanskar (Upanayan Sanskar)', 'Upanayana', 'Yagnopavit Sanskar (Bratabandha)'],
  'Vivah (Marriage)': ['Vivah (Marriage)', 'Marriage'],
}

const normalizedBengaliAliasSet = new Set(
  Object.values(bengaliTitleAliases)
    .flat()
    .map(normalizeTitle)
)

const bengaliDisplayOrderIndex = Object.fromEntries(
  bengaliDisplayOrder.map((title, index) => [normalizeTitle(title), index])
)

const normalizedBengaliAliasOrderIndex = Object.entries(bengaliTitleAliases).reduce((acc, [canonicalTitle, aliases]) => {
  const displayIndex = bengaliDisplayOrderIndex[normalizeTitle(canonicalTitle)]
  aliases.forEach((aliasTitle, aliasIndex) => {
    acc[normalizeTitle(aliasTitle)] = {
      displayIndex,
      aliasIndex,
    }
  })
  return acc
}, {})

const normalizedBengaliAliasCanonicalIndex = Object.entries(bengaliTitleAliases).reduce((acc, [canonicalTitle, aliases]) => {
  const normalizedCanonicalTitle = normalizeTitle(canonicalTitle)
  aliases.forEach((aliasTitle) => {
    acc[normalizeTitle(aliasTitle)] = normalizedCanonicalTitle
  })
  return acc
}, {})

function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const getInitialPriestPreference = () => {
    const fromSession = String(sessionStorage.getItem('services_priestPreference') || '').trim()
    if (allowedPriestPreferences.has(fromSession)) {
      return fromSession
    }

    const fromQuery = String(searchParams.get('priest') || '').trim()
    if (allowedPriestPreferences.has(fromQuery)) {
      return fromQuery
    }

    return 'Odia'
  }

  const getInitialSelectedCity = () => {
    const fromSession = String(sessionStorage.getItem('services_selectedCity') || '').trim()
    if (allowedCities.has(fromSession)) {
      return fromSession
    }

    const fromQuery = String(searchParams.get('city') || '').trim()
    if (allowedCities.has(fromQuery)) {
      return fromQuery
    }

    return 'Bangalore'
  }

  const getInitialSearchTerm = () => {
    const fromSession = String(sessionStorage.getItem('services_searchTerm') || '')
    if (fromSession) {
      return fromSession
    }

    const fromQuery = String(searchParams.get('search') || '')
    if (fromQuery) {
      return fromQuery
    }

    return ''
  }

  const [poojas, setPoojas] = useState([])
  const [selectedCity, setSelectedCity] = useState(getInitialSelectedCity)
  const [priestPreference, setPriestPreference] = useState(getInitialPriestPreference)
  const [searchTerm, setSearchTerm] = useState(getInitialSearchTerm)
  const [isLoading, setIsLoading] = useState(true)
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false)

  const selectedLanguageCount = priestPreference === 'Bengali'
    ? bengaliDisplayOrder.length
    : priestLanguagePoojas[priestPreference]?.size

  const poojasWithNormalizedTitles = useMemo(
    () => poojas.map((pooja) => ({ ...pooja, normalizedTitle: normalizeTitle(pooja.title) })),
    [poojas]
  )

  useEffect(() => {
    sessionStorage.setItem('services_selectedCity', selectedCity)
    sessionStorage.setItem('services_priestPreference', priestPreference)
    sessionStorage.setItem('services_searchTerm', searchTerm)

    const nextParams = new URLSearchParams()

    if (selectedCity && selectedCity !== 'Bangalore') {
      nextParams.set('city', selectedCity)
    }

    if (priestPreference && priestPreference !== 'Odia') {
      nextParams.set('priest', priestPreference)
    }

    if (String(searchTerm || '').trim()) {
      nextParams.set('search', searchTerm)
    }

    const current = searchParams.toString()
    const next = nextParams.toString()

    if (current !== next) {
      setSearchParams(nextParams, { replace: true })
    }
  }, [selectedCity, priestPreference, searchTerm, searchParams, setSearchParams])

  useEffect(() => {
    const loadPoojas = async () => {
      setIsLoading(true)
      try {
        const res = await api.get('/poojas')
        const apiPoojas = Array.isArray(res.data) ? res.data : []
        const hasApiData = apiPoojas.length > 0
        setPoojas(hasApiData ? apiPoojas : defaultPoojas)
        setIsUsingFallbackData(!hasApiData)
      } catch {
        setPoojas(defaultPoojas)
        setIsUsingFallbackData(true)
      } finally {
        setIsLoading(false)
      }
    }

    loadPoojas()
  }, [])

  const languageMatchedPoojas = useMemo(() => {
    if (priestPreference === 'Kannada') {
      const matchedKannadaPoojas = poojasWithNormalizedTitles.filter((pooja) =>
        normalizedKannadaAliasSet.has(pooja.normalizedTitle)
      )

      const orderedKannadaPoojas = [...matchedKannadaPoojas].sort((first, second) => {
        const firstOrder = normalizedKannadaAliasOrderIndex[first.normalizedTitle] ?? Number.MAX_SAFE_INTEGER
        const secondOrder = normalizedKannadaAliasOrderIndex[second.normalizedTitle] ?? Number.MAX_SAFE_INTEGER
        return firstOrder - secondOrder
      })

      const uniqueKannadaPoojas = []
      const seenKannadaCanonicalTitles = new Set()

      orderedKannadaPoojas.forEach((pooja) => {
        const canonicalTitle = normalizedKannadaAliasCanonicalIndex[pooja.normalizedTitle] || pooja.normalizedTitle
        if (!seenKannadaCanonicalTitles.has(canonicalTitle)) {
          seenKannadaCanonicalTitles.add(canonicalTitle)
          uniqueKannadaPoojas.push(pooja)
        }
      })

      return uniqueKannadaPoojas
    }

    if (priestPreference === 'Bengali') {
      const matchedBengaliPoojas = poojasWithNormalizedTitles.filter((pooja) =>
        normalizedBengaliAliasSet.has(pooja.normalizedTitle)
      )

      const orderedBengaliPoojas = [...matchedBengaliPoojas].sort((first, second) => {
        const firstMeta = normalizedBengaliAliasOrderIndex[first.normalizedTitle] || {
          displayIndex: Number.MAX_SAFE_INTEGER,
          aliasIndex: Number.MAX_SAFE_INTEGER,
        }
        const secondMeta = normalizedBengaliAliasOrderIndex[second.normalizedTitle] || {
          displayIndex: Number.MAX_SAFE_INTEGER,
          aliasIndex: Number.MAX_SAFE_INTEGER,
        }

        if (firstMeta.displayIndex !== secondMeta.displayIndex) {
          return firstMeta.displayIndex - secondMeta.displayIndex
        }

        return firstMeta.aliasIndex - secondMeta.aliasIndex
      })

      const uniqueBengaliPoojas = []
      const seenBengaliCanonicalTitles = new Set()

      orderedBengaliPoojas.forEach((pooja) => {
        const canonicalTitle = normalizedBengaliAliasCanonicalIndex[pooja.normalizedTitle] || pooja.normalizedTitle
        if (!seenBengaliCanonicalTitles.has(canonicalTitle)) {
          seenBengaliCanonicalTitles.add(canonicalTitle)
          uniqueBengaliPoojas.push(pooja)
        }
      })

      return uniqueBengaliPoojas
    }

    const allowedTitles = priestLanguagePoojas[priestPreference]
    if (!allowedTitles) {
      return poojasWithNormalizedTitles
    }

    const selectedLanguageKey = normalizeLanguageKey(priestPreference)

    return poojasWithNormalizedTitles.filter((pooja) => {
      const availableLanguageKeys = Array.isArray(pooja?.availableLanguages)
        ? pooja.availableLanguages.map(normalizeLanguageKey).filter(Boolean)
        : []

      const hasLanguageFromAvailability = availableLanguageKeys.includes(selectedLanguageKey)
      const hasLanguageFromPricing = Boolean(
        pooja?.pricing &&
          typeof pooja.pricing === 'object' &&
          pooja.pricing[selectedLanguageKey] &&
          Array.isArray(pooja.pricing[selectedLanguageKey].packages) &&
          pooja.pricing[selectedLanguageKey].packages.length > 0
      )

      if (hasLanguageFromAvailability || hasLanguageFromPricing) {
        return true
      }

      return allowedTitles.has(pooja.normalizedTitle)
    })
  }, [poojasWithNormalizedTitles, priestPreference])

  const filteredPoojas = useMemo(() => {
    const normalizedSearch = normalizeTitle(searchTerm)
    const searchedPoojas = !normalizedSearch
      ? languageMatchedPoojas
      : languageMatchedPoojas.filter((pooja) => pooja.normalizedTitle.includes(normalizedSearch))

    const uniquePoojas = []
    const seenTitles = new Set()
    searchedPoojas.forEach((pooja) => {
      if (!seenTitles.has(pooja.normalizedTitle)) {
        seenTitles.add(pooja.normalizedTitle)
        uniquePoojas.push(pooja)
      }
    })

    return uniquePoojas
  }, [languageMatchedPoojas, searchTerm])

  const displayPoojas = useMemo(() => {
    const selectedLanguageKey = String(priestPreference || '').toLowerCase()

    return filteredPoojas.map((pooja) => {
      const languagePackages =
        Array.isArray(pooja?.pricing?.[selectedLanguageKey]?.packages)
          ? pooja.pricing[selectedLanguageKey].packages
          : []

      const languagePackagePrices = languagePackages
        .map((pkg) => Number(pkg?.price))
        .filter((price) => Number.isFinite(price) && price > 0)

      const languageStartPrice =
        languagePackagePrices.length > 0
          ? Math.min(...languagePackagePrices)
          : pooja.startPrice

      return {
        ...pooja,
        startPrice: languageStartPrice,
      }
    })
  }, [filteredPoojas, priestPreference])

  return (
    <section className="max-w-6xl mx-auto px-4 py-7 sm:py-10">
      <Seo title="PujaSamrddhi Services" description="Explore all available puja services and packages." />

      <div className="rounded-3xl overflow-hidden border border-orange-100 bg-linear-to-br from-white via-orange-50/40 to-amber-50/60 shadow-sm">
        <div className="px-5 py-7 sm:px-7 sm:py-8">
          <p className="text-xs tracking-widest uppercase text-orange-700 font-medium">Sacred Services</p>
          <h1 className="mt-2 text-xl sm:text-4xl font-semibold text-stone-900 leading-tight">Find the Right Puja in Seconds</h1>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-stone-600 max-w-2xl">
            Modern booking experience with verified priests, language preference, and city-wise availability.
          </p>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-orange-200/70 bg-white/80 px-4 py-3">
              <p className="text-xs text-stone-500">Available Services</p>
              <p className="mt-1 text-base sm:text-lg font-semibold text-stone-900">{isLoading ? '...' : displayPoojas.length}</p>
            </div>
            <div className="rounded-xl border border-orange-200/70 bg-white/80 px-4 py-3">
              <p className="text-xs text-stone-500">Selected City</p>
              <p className="mt-1 text-base sm:text-lg font-semibold text-stone-900">{selectedCity}</p>
            </div>
            <div className="rounded-xl border border-orange-200/70 bg-white/80 px-4 py-3">
              <p className="text-xs text-stone-500">Priest Language</p>
              <p className="mt-1 text-base sm:text-lg font-semibold text-stone-900">{priestPreference}</p>
            </div>
            <div className="rounded-xl border border-orange-200/70 bg-white/80 px-4 py-3">
              <p className="text-xs text-stone-500">Coverage</p>
              <p className="mt-1 text-base sm:text-lg font-semibold text-stone-900">{selectedLanguageCount || 'All'} Poojas</p>
            </div>
          </div>
        </div>

        <div className="border-t border-orange-100 bg-white/85 px-5 py-5 sm:px-7">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-stone-700">Priest Preference</label>
              <select
                className="mt-1 w-full min-h-11 px-3 py-2 rounded-lg border border-stone-300 bg-white shadow-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                value={priestPreference}
                onChange={(event) => setPriestPreference(event.target.value)}
              >
                <option value="Hindi">Hindi</option>
                <option value="Odia">Odia</option>
                <option value="Bengali">Bengali</option>
                <option value="Kannada">Kannada</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700">Select City</label>
              <select
                className="mt-1 w-full min-h-11 px-3 py-2 rounded-lg border border-stone-300 bg-white shadow-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                value={selectedCity}
                onChange={(event) => setSelectedCity(event.target.value)}
              >
                <option value="Bangalore">Bangalore</option>
                <option value="Bhubaneswar">Bhubaneswar</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700">Search Pooja</label>
              <input
                className="mt-1 w-full min-h-11 px-3 py-2 rounded-lg border border-stone-300 bg-white shadow-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                placeholder="Type pooja name"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-orange-100 text-orange-800 px-3 py-1">{priestPreference} priest</span>
            <span className="rounded-full bg-stone-100 text-stone-700 px-3 py-1">{selectedCity}</span>
            <span className="rounded-full bg-stone-100 text-stone-700 px-3 py-1">{displayPoojas.length} poojas</span>
            {(searchTerm || selectedCity !== 'Bangalore' || priestPreference !== 'Odia') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCity('Bangalore')
                  setPriestPreference('Odia')
                }}
                className="ml-auto rounded-full border border-stone-300 px-3 py-1.5 text-stone-700 hover:bg-stone-100 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {isUsingFallbackData && (
        <p className="mt-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm text-orange-700">
          Showing fallback data because backend pooja data is unavailable.
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <h2 className="text-base sm:text-xl font-semibold text-stone-900">Available Pooja Services</h2>
        <span className="text-sm text-stone-500">{isLoading ? 'Loading services...' : `${displayPoojas.length} found`}</span>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-2xl border border-orange-100 p-4 animate-pulse shadow-sm">
              <div className="h-44 rounded bg-stone-200" />
              <div className="h-5 w-2/3 mt-4 rounded bg-stone-200" />
              <div className="h-4 w-full mt-3 rounded bg-stone-200" />
              <div className="h-4 w-4/5 mt-2 rounded bg-stone-200" />
              <div className="h-9 w-28 mt-4 rounded bg-stone-200" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {displayPoojas.map((pooja) => (
            <PoojaCard
              key={pooja._id}
              pooja={pooja}
              selectedCity={selectedCity}
              selectedLanguage={priestPreference}
            />
          ))}
        </div>
      )}

      {!isLoading && displayPoojas.length === 0 && (
        <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 text-center">
          <p className="text-stone-800 font-medium">No pooja found for this filter.</p>
          <p className="text-sm text-stone-600 mt-1">Try changing priest preference or clear the search term.</p>
        </div>
      )}
    </section>
  )
}

export default ServicesPage
