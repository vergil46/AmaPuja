import { useEffect, useMemo, useState } from 'react'
import PoojaCard from '../components/PoojaCard'
import Seo from '../components/Seo'
import api from '../services/api'

const normalizeTitle = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

const defaultPoojas = [
  'Annaprashan Puja',
  'Engagement Puja – Nirbandha',
  'Ganapathi Puja',
  'Griha Pravesh (Gruha Pratistha)',
  'Janma Chuti Poka (Mundan)',
  'Lakshmi Puja',
  'Namkaran Puja (Ekoisia)',
  'Office/Shop Opening Puja',
  'Saraswati Puja',
  'Satyanarayan Puja',
  'Vishwakarma Puja',
].map((title, index) => ({
  _id: `default-${index + 1}`,
  title,
  description: `${title} performed by experienced pandits with authentic rituals and personalized guidance.`,
  image: 'https://images.unsplash.com/photo-1542327897-d73f4005b533?auto=format&fit=crop&w=1200&q=80',
  startPrice: 3500 + index * 400,
  packages: [
    { name: 'Without Samagri', price: 3500 + index * 400, includesSamagri: false },
    { name: 'With Samagri', price: Math.round((3500 + index * 400) * 1.35), includesSamagri: true },
  ],
}))

const priestLanguagePoojas = {
  Odia: new Set(
    [
      'Annaprashan Puja',
      'Engagement Puja – Nirbandha',
      'Ganapathi Puja',
      'Griha Pravesh (Gruha Pratistha)',
      'Janma Chuti Poka (Mundan)',
      'Lakshmi Puja',
      'Namkaran Puja (Ekoisia)',
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

function ServicesPage() {
  const [poojas, setPoojas] = useState([])
  const [selectedCity, setSelectedCity] = useState('Bangalore')
  const [priestPreference, setPriestPreference] = useState('Odia')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false)

  const poojasWithNormalizedTitles = useMemo(
    () => poojas.map((pooja) => ({ ...pooja, normalizedTitle: normalizeTitle(pooja.title) })),
    [poojas]
  )

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

    const allowedTitles = priestLanguagePoojas[priestPreference]
    if (!allowedTitles) {
      return poojasWithNormalizedTitles
    }

    return poojasWithNormalizedTitles.filter((pooja) => allowedTitles.has(pooja.normalizedTitle))
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

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <Seo title="Ama Puja Services" description="Explore all available puja services and packages." />
      <div className="rounded-2xl border border-orange-100 bg-white p-5 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-semibold">Puja Services</h1>
        <p className="mt-2 text-stone-600">Choose from our curated rituals performed by experienced pandits.</p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-sm text-stone-700">Priest Preference</label>
            <select
              className="mt-1 w-full px-3 py-2 rounded border border-stone-300 bg-white"
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
            <label className="text-sm text-stone-700">Select City</label>
            <select
              className="mt-1 w-full px-3 py-2 rounded border border-stone-300 bg-white"
              value={selectedCity}
              onChange={(event) => setSelectedCity(event.target.value)}
            >
              <option value="Bangalore">Bangalore</option>
              <option value="Bhubaneswar">Bhubaneswar</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-stone-700">Search Pooja</label>
            <input
              className="mt-1 w-full px-3 py-2 rounded border border-stone-300 bg-white"
              placeholder="Type pooja name"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-orange-50 text-orange-700 px-3 py-1">{priestPreference} priest</span>
          <span className="rounded-full bg-stone-100 text-stone-700 px-3 py-1">{selectedCity}</span>
          <span className="rounded-full bg-stone-100 text-stone-700 px-3 py-1">{filteredPoojas.length} poojas</span>
        </div>
      </div>

      {isUsingFallbackData && (
        <p className="mt-2 text-sm text-orange-700">Showing fallback data because backend pooja data is unavailable.</p>
      )}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl border border-orange-100 p-4 animate-pulse">
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
          {filteredPoojas.map((pooja) => (
            <PoojaCard key={pooja._id} pooja={pooja} selectedCity={selectedCity} />
          ))}
        </div>
      )}
      {!isLoading && filteredPoojas.length === 0 && (
        <div className="mt-6 rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-stone-700">No pooja found for this filter.</p>
          <p className="text-sm text-stone-600 mt-1">Try changing priest preference or clear the search term.</p>
        </div>
      )}
    </section>
  )
}

export default ServicesPage
