import { useEffect, useState } from 'react'
import PoojaCard from '../components/PoojaCard'
import Seo from '../components/Seo'
import api from '../services/api'

const normalizeTitle = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

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
    { name: 'Basic', price: 3500 + index * 400, includesSamagri: false },
    { name: 'Standard', price: Math.round((3500 + index * 400) * 1.35), includesSamagri: true },
    { name: 'Premium', price: Math.round((3500 + index * 400) * 1.8), includesSamagri: true },
  ],
}))

const priestLanguagePoojas = {
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
      'Mundan or Chudakarana Ceremony',
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
      'Surya Puja',
      'Vastu Shanti Puja',
      'Vidyarambham (Patti Pujan)',
      'Vishwakarma Puja',
      'Vivah (Marriage)',
      'Yagnopavit Sanskar',
      'Ganapathi Puja',
      'Lakshmi Puja',
      'Office/Shop Opening Puja',
      'Griha Pravesh (Gruha Pratistha)',
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
  Kannada: new Set(
    [
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
      'Griha Pravesh (Gruha Pratistha)',
      'Annaprashan Puja',
      'Namkaran Puja (Ekoisia)',
    ].map(normalizeTitle)
  ),
}

function ServicesPage() {
  const [poojas, setPoojas] = useState([])
  const [selectedCity, setSelectedCity] = useState('Bangalore')
  const [priestPreference, setPriestPreference] = useState('Odia')
  const [isLoading, setIsLoading] = useState(true)
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false)

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

  const languageMatchedPoojas = poojas.filter((pooja) => {
    if (priestPreference === 'Odia') {
      return true
    }

    const allowedTitles = priestLanguagePoojas[priestPreference]
    if (!allowedTitles) {
      return true
    }

    return allowedTitles.has(normalizeTitle(pooja.title))
  })

  const filteredPoojas =
    priestPreference === 'Odia' || languageMatchedPoojas.length > 0 ? languageMatchedPoojas : poojas

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <Seo title="Ama Puja Services" description="Explore all available puja services and packages." />
      <h1 className="text-3xl font-semibold">Puja Services</h1>
      <p className="mt-2 text-stone-600">Choose from our curated rituals performed by experienced pandits.</p>
      {isUsingFallbackData && (
        <p className="mt-2 text-sm text-orange-700">Showing fallback data because backend pooja data is unavailable.</p>
      )}
      <div className="mt-4 max-w-sm">
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
      <div className="mt-4 max-w-sm">
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
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {filteredPoojas.map((pooja) => (
          <PoojaCard key={pooja._id} pooja={pooja} selectedCity={selectedCity} />
        ))}
      </div>
      {!isLoading && filteredPoojas.length === 0 && (
        <p className="mt-6 text-stone-600">
          No pooja found for {priestPreference} right now. Add matching pooja titles from Admin to show them here.
        </p>
      )}
    </section>
  )
}

export default ServicesPage
