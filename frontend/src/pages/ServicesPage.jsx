import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PoojaCard from '../components/PoojaCard'
import Seo from '../components/Seo'
import api from '../services/api'

const normalizeTitle = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const normalizeLanguageKey = (value) => String(value || '').trim().toLowerCase()
const normalizedHindiExcludedTitles = new Set(
  [
    'Engagement Puja',
    'Namkaran Puja (Ekoisia)',
    'Lakshmi Puja',
    'Laxmi Puja',
  ].map(normalizeTitle)
)

const hindiCanonicalAliases = {
  'Lalitha Sahasranamam Puja': ['Lalitha Sahasranam Puja', 'Lalitha Sahasranamam Puja'],
  'Murti Pran Pratishta At Home': ['Murti Pran Pratishta At Home', 'Murti Pran Pratistha At Home'],
  'Yagnopavit Sanskar': ['Yagnopavit Sanskar', 'Yagnopavit Sanskar (Upanayan Sanskar)'],
}

const normalizedHindiCanonicalIndex = Object.entries(hindiCanonicalAliases).reduce((acc, [canonicalTitle, aliases]) => {
  const normalizedCanonical = normalizeTitle(canonicalTitle)
  aliases.forEach((alias) => {
    acc[normalizeTitle(alias)] = normalizedCanonical
  })
  return acc
}, {})

const odiaCanonicalAliases = {
  'Office/Shop Opening Puja': ['Office/Shop Opening Puja', 'Office Opening Puja', 'office/shop opening puja'],
}

const normalizedOdiaCanonicalIndex = Object.entries(odiaCanonicalAliases).reduce((acc, [canonicalTitle, aliases]) => {
  const normalizedCanonical = normalizeTitle(canonicalTitle)
  aliases.forEach((alias) => {
    acc[normalizeTitle(alias)] = normalizedCanonical
  })
  return acc
}, {})
const servicesListCacheKey = 'services_list_cache_v3'
const servicesListCacheTtlMs = 30 * 60 * 1000

const allowedPriestPreferences = new Set(['Hindi', 'Odia', 'Bengali'])
const allowedCities = new Set(['Bangalore', 'Bhubaneswar'])

const defaultPoojas = [
  'Annaprashan Puja',
  'Engagement Puja',
  'Ganapathi Puja',
  'Griha Pravesh',
  'Janma Chuti Poka (Mundan)',
  'Lakshmi Puja',
  'Namkaran Puja (Ekoisia)',
  'Office Opening Puja',
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

const getCachedServicesList = () => {
  try {
    const raw = sessionStorage.getItem(servicesListCacheKey)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    const timestamp = Number(parsed?.timestamp)
    const items = Array.isArray(parsed?.items) ? parsed.items : []

    const isFresh = Number.isFinite(timestamp) && Date.now() - timestamp < servicesListCacheTtlMs
    if (!isFresh || items.length === 0) {
      return []
    }

    return items
  } catch {
    return []
  }
}

const setCachedServicesList = (items) => {
  try {
    if (!Array.isArray(items) || items.length === 0) {
      return
    }

    sessionStorage.setItem(
      servicesListCacheKey,
      JSON.stringify({
        timestamp: Date.now(),
        items,
      })
    )
  } catch {
    // Ignore storage failures (private mode / quota), network fetch still works.
  }
}

const buildFetchFailureDiagnostics = (error, attempt) => {
  const status = Number(error?.response?.status)
  const requestUrl = [error?.config?.baseURL, error?.config?.url].filter(Boolean).join('')
  const isNetworkError = !error?.response
  const isTimeout = String(error?.code || '').toUpperCase() === 'ECONNABORTED'
  const isCorsOrBlocked =
    isNetworkError &&
    typeof window !== 'undefined' &&
    navigator.onLine &&
    String(error?.message || '').toLowerCase().includes('network error')

  return {
    attempt,
    status: Number.isFinite(status) ? status : null,
    code: error?.code || null,
    message: error?.message || 'Request failed',
    requestUrl: requestUrl || null,
    timeoutMs: Number(error?.config?.timeout) || null,
    isNetworkError,
    isTimeout,
    isCorsOrBlocked,
  }
}

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
      'Murti Pran Pratistha At Home',
      'Namkaran Puja',
      'New Vehicle Puja',
      'Office Opening Puja',
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
      'Yagnopavit Sanskar (Upanayan Sanskar)',
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
  'Laxmi Puja': ['Laxmi Puja', 'Lakshmi Puja', 'Mahalaxmi Puja'],
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
  const [fallbackMode, setFallbackMode] = useState(null)
  const [reloadNonce, setReloadNonce] = useState(0)

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
    let cancelled = false
    // Retry while Render wakes up from cold start.
    const retryDelaysMs = [0, 2000, 4000]

    const loadPoojas = async () => {
      const cachedPoojas = getCachedServicesList()
      const hasCachedPoojas = cachedPoojas.length > 0
      const failureDiagnostics = []

      if (hasCachedPoojas) {
        setPoojas(cachedPoojas)
        setIsUsingFallbackData(false)
        setFallbackMode(null)
        setIsLoading(false)
      } else {
        setIsLoading(true)
      }

      try {
        let res = null

        for (let attempt = 0; attempt < retryDelaysMs.length; attempt += 1) {
          const delay = retryDelaysMs[attempt]
          if (delay > 0) {
            await new Promise((resolve) => setTimeout(resolve, delay))
          }

          try {
            res = await api.get('/poojas/summary')
            break
          } catch (error) {
            const status = Number(error?.response?.status)
            const isSummaryNotAvailable = status === 404

            if (isSummaryNotAvailable) {
              try {
                res = await api.get('/poojas')
                break
              } catch (fallbackError) {
                failureDiagnostics.push(buildFetchFailureDiagnostics(fallbackError, attempt + 1))
                const isLastAttempt = attempt === retryDelaysMs.length - 1
                if (isLastAttempt) {
                  throw fallbackError
                }
                continue
              }
            }

            failureDiagnostics.push(buildFetchFailureDiagnostics(error, attempt + 1))

            const isLastAttempt = attempt === retryDelaysMs.length - 1
            if (isLastAttempt) {
              throw error
            }
          }
        }

        if (cancelled || !res) {
          return
        }

        const apiPoojas = Array.isArray(res.data) ? res.data : []
        const hasApiData = apiPoojas.length > 0
        setPoojas(hasApiData ? apiPoojas : defaultPoojas)
        setIsUsingFallbackData(false)
        setFallbackMode(null)
        if (hasApiData) {
          setCachedServicesList(apiPoojas)
        }
      } catch (error) {
        if (cancelled) {
          return
        }

        console.warn('[ServicesPage] Failed to load pooja services; showing fallback data.', {
          diagnostics: failureDiagnostics.length > 0
            ? failureDiagnostics
            : [buildFetchFailureDiagnostics(error, retryDelaysMs.length)],
          hasCachedPoojas,
        })

        if (hasCachedPoojas) {
          setPoojas(cachedPoojas)
          setIsUsingFallbackData(true)
          setFallbackMode('cached')
        } else {
          setPoojas(defaultPoojas)
          setIsUsingFallbackData(true)
          setFallbackMode('backup')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadPoojas()

    return () => {
      cancelled = true
    }
  }, [reloadNonce])

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
      if (!allowedTitles.has(pooja.normalizedTitle)) {
        return false
      }

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

      const hasAnyLanguageMetadata =
        availableLanguageKeys.length > 0 ||
        Boolean(
          pooja?.pricing &&
            typeof pooja.pricing === 'object' &&
            Object.values(pooja.pricing).some(
              (config) =>
                config &&
                Array.isArray(config.packages) &&
                config.packages.length > 0
            )
        )

      if (hasLanguageFromAvailability || hasLanguageFromPricing) {
        return true
      }

      // Only use title-based fallback when language metadata is missing.
      if (hasAnyLanguageMetadata) {
        return false
      }

      return allowedTitles.has(pooja.normalizedTitle)
    })
  }, [poojasWithNormalizedTitles, priestPreference])

  const filteredPoojas = useMemo(() => {
    const normalizedSearch = normalizeTitle(searchTerm)
    const languageAdjustedPoojas =
      priestPreference === 'Hindi'
        ? languageMatchedPoojas.filter((pooja) => !normalizedHindiExcludedTitles.has(pooja.normalizedTitle))
        : languageMatchedPoojas

    const searchedPoojas = !normalizedSearch
      ? languageAdjustedPoojas
      : languageAdjustedPoojas.filter((pooja) => pooja.normalizedTitle.includes(normalizedSearch))

    const uniquePoojas = []
    const seenTitles = new Set()

    const getLanguageScore = (pooja) => {
      const selectedLanguageKey = normalizeLanguageKey(priestPreference)
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

      return (hasLanguageFromAvailability ? 2 : 0) + (hasLanguageFromPricing ? 4 : 0) + (pooja?.serviceKey ? 1 : 0)
    }

    searchedPoojas.forEach((pooja) => {
      const dedupeKey =
        priestPreference === 'Hindi'
          ? normalizedHindiCanonicalIndex[pooja.normalizedTitle] || pooja.normalizedTitle
          : priestPreference === 'Odia'
            ? normalizedOdiaCanonicalIndex[pooja.normalizedTitle] || pooja.normalizedTitle
          : pooja.normalizedTitle

      if (!seenTitles.has(dedupeKey)) {
        seenTitles.add(dedupeKey)
        uniquePoojas.push(pooja)
        return
      }

      if (priestPreference === 'Hindi') {
        const existingIndex = uniquePoojas.findIndex((item) => {
          const existingKey = normalizedHindiCanonicalIndex[item.normalizedTitle] || item.normalizedTitle
          return existingKey === dedupeKey
        })

        if (existingIndex >= 0 && getLanguageScore(pooja) > getLanguageScore(uniquePoojas[existingIndex])) {
          uniquePoojas[existingIndex] = pooja
        }
      }
    })

    return uniquePoojas
  }, [languageMatchedPoojas, priestPreference, searchTerm])

  const displayPoojas = useMemo(() => {
    const selectedLanguageKey = String(priestPreference || '').toLowerCase()
    const sortedPoojas = [...filteredPoojas].sort((first, second) =>
      String(first?.title || '').localeCompare(String(second?.title || ''), undefined, {
        sensitivity: 'base',
        numeric: true,
      })
    )

    return sortedPoojas.map((pooja) => {
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
    <section className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <Seo title="Puja Samriddhi Services" description="Explore all available puja services and packages." />

      <div className="overflow-hidden rounded-3xl border border-[#FFE0A3] bg-linear-to-br from-white via-[#FFF8E1]/70 to-[#FFF3C4]/80 shadow-sm">
        <div className="px-5 py-7 sm:px-7 sm:py-8">
          <p className="text-sm font-medium uppercase tracking-widest text-[#FF6F00]">Sacred Services</p>
          <h1 className="mt-2 text-2xl font-semibold leading-tight text-[#333333] sm:text-4xl">Find the Right Puja in Seconds</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#333333]/78">
            Modern booking experience with verified priests, language preference, and city-wise availability.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-[#FFE0A3] bg-white/88 px-4 py-3.5">
              <p className="text-sm text-[#333333]/70">Available Services</p>
              <p className="mt-1 text-lg font-semibold text-[#333333]">{isLoading ? '...' : displayPoojas.length}</p>
            </div>
            <div className="rounded-xl border border-[#FFE0A3] bg-white/88 px-4 py-3.5">
              <p className="text-sm text-[#333333]/70">Selected City</p>
              <p className="mt-1 text-lg font-semibold text-[#333333]">{selectedCity}</p>
            </div>
            <div className="rounded-xl border border-[#FFE0A3] bg-white/88 px-4 py-3.5">
              <p className="text-sm text-[#333333]/70">Priest Language</p>
              <p className="mt-1 text-lg font-semibold text-[#333333]">{priestPreference}</p>
            </div>
            <div className="rounded-xl border border-[#FFE0A3] bg-white/88 px-4 py-3.5">
              <p className="text-sm text-[#333333]/70">Coverage</p>
              <p className="mt-1 text-lg font-semibold text-[#333333]">{selectedLanguageCount || 'All'} Poojas</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#FFF0C2] bg-white/88 px-5 py-5 sm:px-7">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-[#333333]/78">Priest Preference</label>
              <select
                className="mt-1 w-full min-h-11 rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base shadow-sm outline-none focus:border-[#FF6F00] focus:ring-2 focus:ring-[#FF6F00]/20"
                value={priestPreference}
                onChange={(event) => setPriestPreference(event.target.value)}
              >
                <option value="Hindi">Hindi</option>
                <option value="Odia">Odia</option>
                <option value="Bengali">Bengali</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#333333]/78">Select City</label>
              <select
                className="mt-1 w-full min-h-11 rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base shadow-sm outline-none focus:border-[#FF6F00] focus:ring-2 focus:ring-[#FF6F00]/20"
                value={selectedCity}
                onChange={(event) => setSelectedCity(event.target.value)}
              >
                <option value="Bangalore">Bangalore</option>
                <option value="Bhubaneswar">Bhubaneswar</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#333333]/78">Search Pooja</label>
              <input
                className="mt-1 w-full min-h-11 rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base shadow-sm outline-none focus:border-[#FF6F00] focus:ring-2 focus:ring-[#FF6F00]/20"
                placeholder="Type pooja name"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-[#FFF0C2] text-[#D84315] px-3 py-1">{priestPreference} priest</span>
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
        <div className="mt-3 flex flex-col gap-2 rounded-lg border border-[#FFE0A3] bg-[#FFF8E1] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#D84315]">
            {fallbackMode === 'cached'
              ? 'Unable to reach the server right now — showing cached service data.'
              : 'Unable to reach the server right now — showing backup service data.'}
          </p>
          <button
            type="button"
            onClick={() => setReloadNonce((value) => value + 1)}
            className="self-start rounded-md border border-[#FF6F00]/35 bg-white px-3 py-1.5 text-sm font-semibold text-[#FF6F00] transition-colors hover:bg-[#FFF3C4] sm:self-auto"
          >
            Retry now
          </button>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-[#FFE0A3] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#333333]">Need help choosing the right puja package?</p>
            <p className="text-sm text-[#333333]/78">Talk to our team for language, samagri, and timing guidance before booking.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="tel:+919739362962"
              className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-3.5 py-2 text-sm font-semibold text-[#333333] transition-colors hover:bg-stone-50"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-stone-300 bg-stone-50 text-stone-700" aria-hidden="true">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 4.75H8.3C8.78 4.75 9.19 5.09 9.28 5.56L9.88 8.7C9.96 9.14 9.8 9.58 9.46 9.86L7.93 11.13C9.2 13.93 11.44 16.17 14.24 17.44L15.51 15.91C15.79 15.57 16.23 15.41 16.67 15.49L19.81 16.09C20.28 16.18 20.62 16.59 20.62 17.07V20.37C20.62 20.86 20.23 21.25 19.74 21.25H18.5C10.49 21.25 3.99 14.75 3.99 6.74V5.5C3.99 5.01 4.38 4.62 4.87 4.62H5V4.75Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span>Call Now: +91 97393 62962</span>
            </a>
            <a
              href="https://wa.me/919739362962"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-[#D84315] to-[#FF6F00] px-3.5 py-2 text-sm font-semibold text-white transition hover:brightness-110"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20" aria-hidden="true">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.05 4.94A9.82 9.82 0 0 0 12.05 2a9.94 9.94 0 0 0-8.61 14.93L2 22l5.24-1.38A9.93 9.93 0 0 0 12.05 22 9.95 9.95 0 0 0 22 12.07a9.83 9.83 0 0 0-2.95-7.13ZM12.05 20.3a8.25 8.25 0 0 1-4.2-1.15l-.3-.18-3.1.81.83-3.02-.2-.31a8.25 8.25 0 1 1 6.97 3.85Zm4.52-6.2c-.25-.13-1.5-.74-1.73-.82-.23-.09-.4-.13-.56.12-.17.25-.65.82-.8.98-.15.17-.3.19-.56.06-.25-.12-1.08-.4-2.06-1.27-.76-.67-1.27-1.5-1.42-1.75-.15-.25-.02-.38.11-.5.11-.11.25-.3.38-.44.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.07-.13-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.42.06-.64.31-.22.25-.84.82-.84 2.01 0 1.19.86 2.35.98 2.51.12.17 1.69 2.58 4.08 3.62.57.25 1.02.4 1.37.51.58.18 1.1.15 1.52.09.46-.07 1.5-.61 1.71-1.2.21-.59.21-1.1.15-1.2-.06-.1-.23-.16-.48-.29Z" />
                </svg>
              </span>
              <span>WhatsApp Support</span>
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#333333] sm:text-2xl">Available Pooja Services</h2>
        <span className="text-sm text-stone-500">{isLoading ? 'Fetching services… please wait' : `${displayPoojas.length} found`}</span>
      </div>

      {isLoading ? (
        <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-2xl border border-[#FFE0A3] p-4 animate-pulse shadow-sm">
              <div className="h-44 rounded bg-stone-200" />
              <div className="h-5 w-2/3 mt-4 rounded bg-stone-200" />
              <div className="h-4 w-full mt-3 rounded bg-stone-200" />
              <div className="h-4 w-4/5 mt-2 rounded bg-stone-200" />
              <div className="h-9 w-28 mt-4 rounded bg-stone-200" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="mt-6 rounded-2xl border border-[#FFE0A3] bg-white p-6 text-center">
          <p className="text-[#333333] font-medium">No pooja found for this filter.</p>
          <p className="text-sm text-[#333333]/78 mt-1">Try changing priest preference or clear the search term.</p>
        </div>
      )}

    </section>
  )
}

export default ServicesPage

