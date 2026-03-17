import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getPoojaImage } from '../assets/poojaImageMap'
import Seo from '../components/Seo'
import api from '../services/api'
import { PoojaDetailSkeleton } from '../components/LoadingSkeleton'
import { useAuth } from '../context/useAuth'

const FUNNEL_SESSION_KEY = 'pujasamriddhi_funnel_session'

const getFunnelSessionId = () => {
  if (typeof window === 'undefined') return ''
  const existing = localStorage.getItem(FUNNEL_SESSION_KEY)
  if (existing) return existing

  const generated = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  localStorage.setItem(FUNNEL_SESSION_KEY, generated)
  return generated
}

function DetailInfoCard({ icon, title, items }) {
  if (!Array.isArray(items) || items.length === 0) return null
  const isRequirements = String(title || '').toLowerCase() === 'requirements'

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20 text-lg" aria-hidden="true">
          {icon}
        </span>
        <h3 className="text-base font-semibold text-white sm:text-lg">{title}</h3>
      </div>
      <ul className="space-y-2 text-sm leading-relaxed text-white/70 sm:text-[15px]">
        {items.map((item) => (
          <li
            key={item}
            className={isRequirements ? 'rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 font-medium text-white/90' : 'flex items-start gap-2'}
          >
            {!isRequirements && (
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" aria-hidden="true" />
            )}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PoojaDetailPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { token } = useAuth()

  const languageQuery = String(
    searchParams.get('language') || ''
  )
    .trim()
    .toLowerCase()

  const selectedLanguageFromServices = {
    odia: 'Odia',
    hindi: 'Hindi',
    bengali: 'Bengali',
    kannada: 'Kannada',
  }[languageQuery] || 'Odia'

  const hasLanguageFromServicesQuery = ['odia', 'hindi', 'bengali', 'kannada'].includes(languageQuery)

  const selectedCityFromServices =
    searchParams.get('city') === 'Bhubaneswar'
      ? 'Bhubaneswar'
      : 'Bangalore'

  const [pooja, setPooja] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState('')
  const [selectedAddOns, setSelectedAddOns] = useState([])
  const [bookingMessage, setBookingMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFetchingLocation, setIsFetchingLocation] = useState(false)
  const [locationMessage, setLocationMessage] = useState('')
  const bookingPanelRef = useRef(null)
  const formStartedRef = useRef(false)

  const draftStorageKey = `pooja-booking-draft-${id || 'default'}`

  const trackFunnelEvent = useCallback(async (eventName, metadata = {}) => {
    try {
      await api.post('/analytics/track', {
        eventName,
        sessionId: getFunnelSessionId(),
        route: typeof window !== 'undefined' ? window.location.pathname : '',
        poojaId: id,
        metadata,
      })
    } catch (error) {
      console.warn('Funnel tracking failed:', error?.message || error)
    }
  }, [id])

  const scrollToBookingForm = () => {
    bookingPanelRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const normalizeName = (value) =>
    String(value || '')
      .trim()
      .toLowerCase()

  const parseAmount = (value) => {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0
    }

    const cleaned = String(value || '').replace(
      /[^\d.-]/g,
      ''
    )
    const parsed = Number(cleaned)
    return Number.isFinite(parsed) ? parsed : 0
  }

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: selectedCityFromServices,
    state: '',
    pincode: '',
    house: '',
    street: '',
    priestPreference:
      selectedLanguageFromServices,
    date: '',
    time: '',
    address: '',
    latitude: '',
    longitude: '',
    specialNotes: '',
    paymentOption: 'full',
  })

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const buildAddressFromParts = (values) => {
    return [
      values.house,
      values.street,
      values.city,
      values.state,
      values.pincode,
    ]
      .map((value) => String(value || '').trim())
      .filter(Boolean)
      .join(', ')
  }

  const parseGoogleAddress = (geocodeResult) => {
    const components = Array.isArray(geocodeResult?.address_components)
      ? geocodeResult.address_components
      : []

    const readComponent = (types) => {
      const found = components.find((component) =>
        Array.isArray(component.types) &&
        types.every((type) => component.types.includes(type))
      )
      return found?.long_name || ''
    }

    const streetNumber = readComponent(['street_number'])
    const route = readComponent(['route'])
    const locality =
      readComponent(['locality', 'political']) ||
      readComponent(['sublocality_level_1', 'sublocality', 'political']) ||
      readComponent(['administrative_area_level_2', 'political'])
    const state = readComponent(['administrative_area_level_1', 'political'])
    const postalCode = readComponent(['postal_code'])

    return {
      house: streetNumber,
      street: route,
      city: locality,
      state,
      pincode: postalCode,
      formattedAddress: String(geocodeResult?.formatted_address || '').trim(),
    }
  }

  const parseFallbackAddress = (payload) => {
    const address = payload?.localityInfo?.administrative || {}

    const city =
      String(payload?.city || '').trim() ||
      String(payload?.locality || '').trim() ||
      String(payload?.principalSubdivision || '').trim() ||
      String(address?.city || '').trim()

    const state =
      String(payload?.principalSubdivision || '').trim() ||
      String(address?.principalSubdivision || '').trim() ||
      String(address?.state || '').trim()

    return {
      house: '',
      street: String(payload?.locality || '').trim(),
      city,
      state,
      pincode: String(payload?.postcode || '').trim(),
      formattedAddress: String(payload?.locality || '').trim(),
    }
  }

  const fetchAddressFromFallback = async (
    latitude,
    longitude
  ) => {
    const fallbackUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    const fallbackResponse = await fetch(fallbackUrl)

    if (!fallbackResponse.ok) {
      throw new Error('Unable to fetch address from location coordinates.')
    }

    const fallbackPayload = await fallbackResponse.json()
    const parsedFallbackAddress = parseFallbackAddress(
      fallbackPayload
    )

    if (
      !parsedFallbackAddress.formattedAddress &&
      !parsedFallbackAddress.city &&
      !parsedFallbackAddress.state
    ) {
      throw new Error('No address found for your current location.')
    }

    return parsedFallbackAddress
  }

  const fetchAddressFromCoordinates = async (
    latitude,
    longitude
  ) => {
    if (googleMapsApiKey) {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsApiKey}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Unable to fetch address from location coordinates.')
      }

      const payload = await response.json()
      if (
        payload.status === 'OK' &&
        Array.isArray(payload.results) &&
        payload.results.length > 0
      ) {
        return parseGoogleAddress(payload.results[0])
      }
    }

    return fetchAddressFromFallback(latitude, longitude)
  }

  const handleUseCurrentLocation = async () => {
    setLocationMessage('')
    if (!navigator.geolocation) {
      setLocationMessage('Geolocation is not supported by your browser.')
      return
    }

    setIsFetchingLocation(true)

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        })
      })

      const latitude = Number(position.coords.latitude)
      const longitude = Number(position.coords.longitude)

      const parsedAddress = await fetchAddressFromCoordinates(
        latitude,
        longitude
      )

      setForm((previous) => {
        const merged = {
          ...previous,
          house: parsedAddress.house || previous.house,
          street: parsedAddress.street || previous.street,
          city: parsedAddress.city || previous.city,
          state: parsedAddress.state || previous.state,
          pincode: parsedAddress.pincode || previous.pincode,
          latitude: String(latitude),
          longitude: String(longitude),
        }

        const autoAddress =
          parsedAddress.formattedAddress ||
          buildAddressFromParts(merged)

        return {
          ...merged,
          address: autoAddress || previous.address,
        }
      })

      setLocationMessage('Location fetched and address auto-filled successfully.')
    } catch (error) {
      if (error?.code === 1) {
        setLocationMessage('Location permission denied. Please enter address manually.')
      } else if (error?.code === 2) {
        setLocationMessage('Location unavailable. Please enter address manually.')
      } else if (error?.code === 3) {
        setLocationMessage('Location request timed out. Please try again or enter address manually.')
      } else {
        setLocationMessage(error?.message || 'Failed to fetch location. Please enter address manually.')
      }
    } finally {
      setIsFetchingLocation(false)
    }
  }

  useEffect(() => {
    api.get(`/poojas/${id}`).then((res) => {
      setPooja(res.data)
      setSelectedPackage('')
      setSelectedAddOns([])
    })
  }, [id])

  useEffect(() => {
    if (!id) return
    trackFunnelEvent('service_view', { source: 'pooja_detail' })
  }, [id, trackFunnelEvent])

  useEffect(() => {
    if (!id || typeof window === 'undefined') return
    const raw = localStorage.getItem(draftStorageKey)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object') return

      setForm((previous) => {
        const draftValues = Object.fromEntries(
          Object.entries(parsed).filter(([, value]) => typeof value === 'string')
        )

        return {
          ...previous,
          ...draftValues,
          city: selectedCityFromServices,
          priestPreference: selectedLanguageFromServices,
        }
      })

      if (Array.isArray(parsed.selectedAddOns)) {
        setSelectedAddOns(parsed.selectedAddOns.filter(Boolean))
      }
      if (typeof parsed.selectedPackage === 'string' && parsed.selectedPackage.trim()) {
        setSelectedPackage(parsed.selectedPackage.trim())
      }
    } catch (error) {
      console.warn('Failed to load booking draft:', error)
    }
  }, [id, draftStorageKey, selectedCityFromServices, selectedLanguageFromServices])

  useEffect(() => {
    if (typeof window === 'undefined' || !id) return
    const draftPayload = {
      ...form,
      selectedPackage,
      selectedAddOns,
    }
    localStorage.setItem(draftStorageKey, JSON.stringify(draftPayload))
  }, [form, selectedPackage, selectedAddOns, draftStorageKey, id])

  const activeLanguageKey = useMemo(
    () =>
      String(form.priestPreference || '')
        .trim()
        .toLowerCase(),
    [form.priestPreference]
  )

  const activeLanguagePricing = useMemo(() => {
    if (
      !pooja?.pricing ||
      typeof pooja.pricing !== 'object' ||
      !activeLanguageKey
    ) {
      return null
    }

    return pooja.pricing[activeLanguageKey] || null
  }, [pooja, activeLanguageKey])

  const languageOptions = useMemo(() => {
    const available = Array.isArray(
      pooja?.availableLanguages
    )
      ? pooja.availableLanguages
      : []

    if (available.length === 0) {
      return [
        'Odia',
        'Hindi',
        'Bengali',
        'Kannada',
      ]
    }

    const normalizedAvailable = available.map((item) => {
      const value = String(item || '').trim()
      if (!value) return ''
      return (
        value.charAt(0).toUpperCase() +
        value.slice(1).toLowerCase()
      )
    }).filter(Boolean)

    if (
      hasLanguageFromServicesQuery &&
      !normalizedAvailable.some(
        (option) => option.toLowerCase() === selectedLanguageFromServices.toLowerCase()
      )
    ) {
      return [selectedLanguageFromServices, ...normalizedAvailable]
    }

    return normalizedAvailable
  }, [pooja, hasLanguageFromServicesQuery, selectedLanguageFromServices])

  useEffect(() => {
    if (!hasLanguageFromServicesQuery) return

    setForm((previous) => {
      if (
        String(previous.priestPreference || '').toLowerCase() ===
        selectedLanguageFromServices.toLowerCase()
      ) {
        return previous
      }

      return {
        ...previous,
        priestPreference: selectedLanguageFromServices,
      }
    })
  }, [hasLanguageFromServicesQuery, selectedLanguageFromServices])

  useEffect(() => {
    if (languageOptions.length === 0) return

    const hasCurrent = languageOptions.some(
      (option) =>
        option.toLowerCase() ===
        String(form.priestPreference || '')
          .toLowerCase()
    )

    if (!hasCurrent) {
      setForm((previous) => ({
        ...previous,
        priestPreference:
          languageOptions[0],
      }))
    }
  }, [languageOptions, form.priestPreference])

  const activePackages = useMemo(() => {
    if (
      activeLanguagePricing?.packages?.length > 0
    ) {
      return activeLanguagePricing.packages
    }

    return pooja?.packages || []
  }, [pooja, activeLanguagePricing])

  useEffect(() => {
    if (activePackages.length === 0) {
      if (selectedPackage) {
        setSelectedPackage('')
      }
      return
    }

    const hasSelected = activePackages.some(
      (pkg) => pkg.name === selectedPackage
    )

    if (!hasSelected) {
      setSelectedPackage(activePackages[0].name)
    }
  }, [activePackages, selectedPackage])

  const selectedPackageData = useMemo(() => {
    if (!selectedPackage) return null

    return (
      activePackages?.find(
        (pkg) => pkg.name === selectedPackage
      ) || null
    )
  }, [activePackages, selectedPackage])

  const availableAddOns = useMemo(() => {
    const candidates = [
      ...(Array.isArray(selectedPackageData?.addOns)
        ? selectedPackageData.addOns
        : []),
      ...(Array.isArray(activeLanguagePricing?.addOns)
        ? activeLanguagePricing.addOns
        : []),
      ...(Array.isArray(pooja?.addOns)
        ? pooja.addOns
        : []),
    ]

    const byName = new Map()
    candidates.forEach((addon) => {
      const name = String(addon?.name || '').trim()
      const key = normalizeName(name)
      if (!key) return

      if (!byName.has(key)) {
        byName.set(key, {
          name,
          price: parseAmount(addon?.price),
        })
      }
    })

    return Array.from(byName.values())
  }, [pooja, selectedPackageData, activeLanguagePricing])

  useEffect(() => {
    setSelectedAddOns([])
  }, [selectedPackage])

  // ✅ Dynamic Price Calculation
  const packagePrice = useMemo(() => {
    if (!selectedPackageData) return 0

    let total = parseAmount(selectedPackageData?.price)

    if (
      selectedAddOns.length > 0 &&
      availableAddOns.length > 0
    ) {
      selectedAddOns.forEach((addonName) => {
        const found = availableAddOns.find(
          (a) =>
            normalizeName(a.name) ===
            normalizeName(addonName)
        )
        if (found) total += parseAmount(found.price)
      })
    }

    return total
  }, [selectedPackageData, selectedAddOns, availableAddOns])

  const payableAmount = useMemo(() => {
    if (form.paymentOption === 'advance')
      return Math.round(packagePrice * 0.3)
    if (form.paymentOption === 'pay-after-pooja') return 0
    return packagePrice
  }, [form.paymentOption, packagePrice])

  const payableLabel = useMemo(() => {
    if (form.paymentOption === 'advance') {
      return 'Advance (30%)'
    }
    if (form.paymentOption === 'pay-after-pooja') {
      return 'Pay After Pooja'
    }
    return 'Full Payment'
  }, [form.paymentOption])

  const basePackagePrice = parseAmount(
    selectedPackageData?.price
  )
  const addOnTotal = Math.max(
    0,
    packagePrice - basePackagePrice
  )

  const normalizedPhone = String(form.phone || '').replace(/\D/g, '')
  const hasValidPhone = normalizedPhone.length >= 10
  const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(form.email || '').trim())
  const enquiryFlowTitle =
    activeLanguagePricing?.title ||
    pooja?.localizedTitle?.[
      activeLanguageKey
    ] ||
    pooja?.title ||
    ''
  const isBengaliVivahEnquiryOnly =
    activeLanguageKey === 'bengali' &&
    /vivah/i.test(String(enquiryFlowTitle || ''))

  const quickValidationMessage = useMemo(() => {
    if (form.phone && !hasValidPhone) return 'Enter a valid 10-digit phone number.'
    if (form.email && !hasValidEmail) return 'Enter a valid email address.'
    if (!isBengaliVivahEnquiryOnly && form.date) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const selected = new Date(form.date)
      if (!Number.isNaN(selected.getTime()) && selected < today) {
        return 'Please choose today or a future date.'
      }
    }
    return ''
  }, [form.phone, form.email, form.date, hasValidPhone, hasValidEmail, isBengaliVivahEnquiryOnly])

  const isPrimaryFormValid = hasValidPhone && hasValidEmail && !quickValidationMessage

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })

  const handleBook = async (event) => {
    event.preventDefault()
    setBookingMessage('')
    if (isSubmitting) return

    if (!token) {
      navigate('/login')
      return
    }

    if (!isPrimaryFormValid) {
      setBookingMessage(quickValidationMessage || 'Please correct highlighted fields before continuing.')
      return
    }

    const enquiryTitle =
      activeLanguagePricing?.title ||
      pooja?.localizedTitle?.[
        activeLanguageKey
      ] ||
      pooja?.title ||
      ''

    const isEnquiryOnly =
      activeLanguageKey === 'bengali' &&
      /vivah/i.test(String(enquiryTitle || ''))

    const requiredFields = [
      form.name,
      form.phone,
      form.email,
      form.city,
      form.address,
      ...(isEnquiryOnly ? [] : [form.date]),
    ]

    if (requiredFields.some((v) => !String(v || '').trim())) {
      setBookingMessage('Please fill all required fields.')
      return
    }

    setIsSubmitting(true)

    try {
      if (isEnquiryOnly) {
        trackFunnelEvent('booking_submitted', { flow: 'enquiry_only' })
        const enquiryLines = [
          `Priest Preference: ${form.priestPreference}`,
          `City: ${form.city}`,
          form.date
            ? `Preferred Date: ${form.date}`
            : '',
          form.time
            ? `Preferred Time: ${form.time}`
            : '',
            `Address: ${form.address || buildAddressFromParts(form)}`,
          form.specialNotes
            ? `Requirements: ${form.specialNotes}`
            : '',
        ].filter(Boolean)

        await api.post('/enquiries', {
          name: form.name,
          email: form.email,
          phone: form.phone,
          service: enquiryTitle,
          message: enquiryLines.join('\n'),
        })

        setBookingMessage(
          'Enquiry sent successfully. Our team will contact you with quotation details.'
        )
        return
      }

      const computedAddress =
        String(form.address || '').trim() ||
        buildAddressFromParts(form)

      const bookingRes = await api.post('/bookings', {
        poojaId: id,
        package: selectedPackage,
        selectedAddOns,
        addressDetails: {
          house: form.house,
          street: form.street,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          formattedAddress: computedAddress,
        },
        coordinates: {
          latitude: Number(form.latitude || 0) || null,
          longitude: Number(form.longitude || 0) || null,
        },
        ...form,
        address: computedAddress,
      })

      const booking = bookingRes.data
      trackFunnelEvent('booking_submitted', {
        flow: form.paymentOption,
        selectedPackage,
        payableAmount,
      })

      if (form.paymentOption === 'pay-after-pooja') {
        setBookingMessage('Booking placed successfully.')
        trackFunnelEvent('payment_success', { flow: 'pay-after-pooja' })
        if (typeof window !== 'undefined') {
          localStorage.removeItem(draftStorageKey)
        }
        return
      }

      const loaded = await loadRazorpayScript()
      if (!loaded) {
        setBookingMessage('Razorpay failed to load.')
        return
      }

      const orderRes = await api.post(
        '/payments/create-order',
        {
          bookingId: booking._id,
          finalAmount: packagePrice,
        }
      )

      const { order } = orderRes.data
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID

      if (!razorpayKey) {
        setBookingMessage('Payment is unavailable: missing Razorpay key configuration.')
        return
      }

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: 'Puja Samriddhi',
        description: `${displayTitle} Booking`,
        order_id: order.id,
        handler: async (response) => {
          await api.post('/payments/verify', response)
          setBookingMessage(
            'Booking and payment completed successfully.'
          )
          trackFunnelEvent('payment_success', { flow: form.paymentOption })
          if (typeof window !== 'undefined') {
            localStorage.removeItem(draftStorageKey)
          }
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
      }

      const rz = new window.Razorpay(options)
      rz.open()
    } catch (error) {
      setBookingMessage(
        error?.response?.data?.message ||
          'Booking failed. Try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!pooja) return <PoojaDetailSkeleton />

  const displayImage = getPoojaImage(
    pooja?.title,
    pooja?.image
  )

  const localizedDescription =
    activeLanguagePricing?.description
      ?.full ||
    pooja?.localizedDescription?.[
      activeLanguageKey
    ]?.full ||
    ''

  const displayTitle =
    enquiryFlowTitle || pooja?.title

  const displayDescription =
    localizedDescription ||
    pooja?.description

  const packageProcedure =
    selectedPackageData?.procedure?.filter(Boolean) ||
    []
  const packageInclusions =
    selectedPackageData?.inclusions?.filter(Boolean) ||
    []
  const packageNote =
    selectedPackageData?.note || ''

  const engagementTimingNote =
    'NOTE: Panditji will be there for maximum of 2 hours from your given time. After that, for extra hours ₹1000/hour will be charged.'

  const isEngagementService = /engagement|nischitartha|sagai|nirbandha|roka/i.test(
    String(displayTitle || '')
  )

  const descriptionPreview =
    String(displayDescription || '').length > 260
      ? `${String(displayDescription || '').slice(0, 257).trim()}...`
      : String(displayDescription || '')

  const benefitItems = packageInclusions.slice(0, 6)

  const ritualStepItems = packageProcedure.slice(0, 8)

  const requirementItems = [
    selectedPackageData?.pandits,
    packageNote,
    isEngagementService ? engagementTimingNote : '',
    selectedPackageData?.description,
  ]
    .filter(Boolean)
    .slice(0, 6)

  const fieldClass =
    'w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-3 text-base text-white placeholder:text-white/50 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 backdrop-blur-sm'

  return (
    <div className="min-h-screen bg-linear-to-b from-[#1a1207] via-[#2a1709] to-[#3b220b]">
      <Seo
        title={`${displayTitle} | Puja Samriddhi`}
        description={displayDescription}
      />

      {/* ── Hero ── */}
      <section className="relative mx-auto max-w-6xl overflow-hidden px-4 pt-8 pb-6 sm:pt-12">
        {/* Right-side image */}
        <div className="pointer-events-none absolute top-0 right-0 h-full w-1/2 overflow-hidden sm:w-2/5">
          <img
            src={displayImage}
            alt={displayTitle}
            loading="eager"
            fetchpriority="high"
            decoding="async"
            className="h-full w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-linear-to-r from-[#1a1207] via-[#1a1207]/70 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-[#1a1207]/80" />
        </div>

        {/* Title */}
        <div className="relative z-10 max-w-[62%] sm:max-w-[58%]">
          <h1
            className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl"
            style={{
              color: '#fff',
              textShadow: '0 2px 24px rgba(0,0,0,0.85), 0 1px 4px rgba(0,0,0,0.9)',
              WebkitTextStroke: '0.5px rgba(255,255,255,0.15)',
            }}
          >
            {displayTitle}
          </h1>
          <div className="mt-2 h-1 w-28 rounded-full bg-linear-to-r from-orange-500 via-amber-400 to-yellow-400" />
          {descriptionPreview && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/65 sm:text-base">
              {descriptionPreview}
            </p>
          )}
        </div>
      </section>

      {/* ── Package Cards ── */}
      <section className="mx-auto max-w-6xl px-4 pb-8">
        {isBengaliVivahEnquiryOnly ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/80 backdrop-blur-sm">
            <p className="font-semibold text-white">This service is available on custom quotation.</p>
            <p className="mt-2 leading-relaxed">Share your requirements and our team will contact you with package details, pandit availability, and final quote.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activePackages.map((pkg, index) => {
              const isSelected = selectedPackage === pkg.name
              const btnGradient = index === 0
                ? 'bg-linear-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400'
                : 'bg-linear-to-r from-orange-600 via-amber-500 to-orange-500 hover:from-orange-500 hover:via-amber-500 hover:to-orange-400'
              return (
                <div
                  key={pkg.name}
                  onClick={() => setSelectedPackage(pkg.name)}
                  className={`relative cursor-pointer rounded-2xl border p-5 transition backdrop-blur-sm ${
                    isSelected
                      ? 'border-white/30 bg-white/12 ring-2 ring-white/20'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="mb-2 text-xs font-bold uppercase tracking-widest text-white/45">
                    {pkg.name}
                  </div>
                  <div className="text-3xl font-extrabold text-white sm:text-4xl">
                    ₹{Number(pkg.price).toLocaleString('en-IN')}
                  </div>
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-white/55">
                    {pkg.description || descriptionPreview || 'Premium pooja service with experienced pandit'}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedPackage(pkg.name); scrollToBookingForm() }}
                    className={`mt-4 w-full rounded-xl py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition ${btnGradient}`}
                  >
                    Book Puja Now
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedPackage(pkg.name); scrollToBookingForm() }}
                    className="mt-2 w-full text-center text-xs text-white/45 underline underline-offset-2 hover:text-white/80 transition"
                  >
                    Enquire
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Add-ons */}
        {!isBengaliVivahEnquiryOnly && availableAddOns.length > 0 && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="mb-3 font-semibold text-white">Add-ons</div>
            <div className="flex flex-wrap gap-2">
              {availableAddOns.map((addon) => {
                const checked = selectedAddOns.some(
                  (item) => normalizeName(item) === normalizeName(addon.name)
                )
                return (
                  <label
                    key={addon.name}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition ${
                      checked
                        ? 'border-orange-400 bg-orange-500/20 text-orange-200'
                        : 'border-white/10 bg-white/5 text-white/65 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 accent-orange-500"
                      checked={checked}
                      onChange={() => {
                        const addonName = String(addon.name || '').trim()
                        const addonKey = normalizeName(addonName)
                        setSelectedAddOns((previous) => {
                          const exists = previous.some((item) => normalizeName(item) === addonKey)
                          if (exists) return previous.filter((item) => normalizeName(item) !== addonKey)
                          return [...previous, addonName]
                        })
                      }}
                    />
                    {addon.name}
                    <span className="text-white/40">+₹{addon.price}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}

        {/* Info cards: Benefits / Ritual Steps / Requirements */}
        {!isBengaliVivahEnquiryOnly && selectedPackageData && (
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <DetailInfoCard icon="✨" title="Benefits" items={benefitItems} />
            <DetailInfoCard icon="🪔" title="Ritual Steps" items={ritualStepItems} />
            <DetailInfoCard icon="📋" title="Requirements" items={requirementItems} />
          </div>
        )}

        {!isBengaliVivahEnquiryOnly && (
          <div className="mt-4 text-sm font-semibold text-green-400">
            Total Amount (Package + Add-ons): ₹{packagePrice.toLocaleString('en-IN')}
          </div>
        )}
      </section>

      {/* ── Booking Form ── */}
      <section ref={bookingPanelRef} className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl px-0 pb-16">
        {/* Blurred puja image behind form */}
        <div className="pointer-events-none absolute inset-0">
          <img src={displayImage} alt="" aria-hidden="true" className="h-full w-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-linear-to-b from-black/55 via-black/65 to-black/85" />
        </div>

        <div className="relative z-10 px-5 py-8 sm:px-8">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            {isBengaliVivahEnquiryOnly ? 'Send Enquiry' : 'Enter Your Details'}
          </h2>
          <p className="mt-1 text-sm text-white/60">
            {isBengaliVivahEnquiryOnly
              ? 'Share your event details and get a personalised quote.'
              : 'Secure your puja booking in just a few steps.'}
          </p>

          <div className="mt-3 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-300 sm:text-sm">
            Verified Priests • 1000+ Rituals Completed • Secure Payment
          </div>

          {!isBengaliVivahEnquiryOnly && (
            <div className="mt-3 flex flex-wrap gap-3">
              <div className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/80">
                Payable Now ({payableLabel}): <span className="font-bold text-white">₹{payableAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/55">
                Package ₹{basePackagePrice.toLocaleString('en-IN')} + Add-ons ₹{addOnTotal.toLocaleString('en-IN')} =
                <span className="font-semibold text-white/80"> ₹{packagePrice.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          <form
            onSubmit={handleBook}
            className="mt-5 space-y-4"
            onFocus={() => {
              if (!formStartedRef.current) {
                formStartedRef.current = true
                trackFunnelEvent('form_started', { source: 'booking_form' })
              }
            }}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-white/55">Full Name *</label>
                <input className={fieldClass} placeholder="Full Name" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-white/55">Phone Number *</label>
                <input className={fieldClass} placeholder="Phone Number" required value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>

            {quickValidationMessage && (
              <p className="text-xs text-red-400">{quickValidationMessage}</p>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-white/55">Email *</label>
              <input className={fieldClass} type="email" placeholder="Email Address" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isFetchingLocation}
              className="w-full rounded-xl border border-orange-400/40 bg-orange-500/15 px-3.5 py-2.5 text-sm font-semibold text-orange-300 transition hover:bg-orange-500/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isFetchingLocation ? 'Fetching your location…' : '📍 Use My Current Location'}
            </button>

            {locationMessage && (
              <p className={`text-xs ${
                locationMessage.toLowerCase().includes('successfully') ? 'text-green-400' : 'text-red-400'
              }`}>{locationMessage}</p>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-white/55">House / Flat No. *</label>
                <input className={fieldClass} placeholder="House / Flat No." required value={form.house}
                  onChange={(e) => setForm({ ...form, house: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-white/55">Street / Area *</label>
                <input className={fieldClass} placeholder="Street / Area" required value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-white/55">City *</label>
                <input className={fieldClass} placeholder="City" required value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-white/55">Pincode *</label>
                <input className={fieldClass} placeholder="Pincode" required value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-white/55">State *</label>
                <input className={fieldClass} placeholder="State" required value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-white/55">Priest Language</label>
                <select className={fieldClass} value={form.priestPreference}
                  onChange={(e) => setForm({ ...form, priestPreference: e.target.value })}>
                  <option value="" className="bg-[#2a1709]">Select Language</option>
                  {languageOptions.map((language) => (
                    <option key={language} value={language} className="bg-[#2a1709]">{language}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-white/55">Preferred Time</label>
                <input className={fieldClass} type="time" value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-white/55">Date *</label>
                <input className={fieldClass} type="date" required value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-white/55">Full Address *</label>
                <input className={fieldClass} placeholder="Full Address" required value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-white/55">Special Requirements (optional)</label>
              <textarea className={fieldClass} rows={3} placeholder="Special requirements…"
                value={form.specialNotes}
                onChange={(e) => setForm({ ...form, specialNotes: e.target.value })} />
            </div>

            {!isBengaliVivahEnquiryOnly && (
              <div>
                <label className="mb-1 block text-xs font-medium text-white/55">Payment Option</label>
                <select className={fieldClass} value={form.paymentOption}
                  onChange={(e) => setForm({ ...form, paymentOption: e.target.value })}>
                  <option value="full" className="bg-[#2a1709]">Full Payment</option>
                  <option value="advance" className="bg-[#2a1709]">Advance (30%)</option>
                  <option value="pay-after-pooja" className="bg-[#2a1709]">Pay After Pooja</option>
                </select>
              </div>
            )}

            <button
              className={`w-full rounded-2xl py-4 text-base font-extrabold uppercase tracking-wide text-white shadow-2xl transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isBengaliVivahEnquiryOnly
                  ? 'bg-linear-to-r from-orange-600 via-amber-500 to-orange-500 hover:from-orange-500 hover:via-amber-500 hover:to-orange-400'
                  : 'bg-linear-to-r from-orange-600 via-amber-500 to-orange-500 hover:from-orange-500 hover:via-amber-500 hover:to-orange-400'
              }`}
              disabled={isSubmitting || !isPrimaryFormValid}
            >
              {isSubmitting
                ? (isBengaliVivahEnquiryOnly ? 'Sending Enquiry…' : 'Booking…')
                : (isBengaliVivahEnquiryOnly ? 'Send Enquiry & Get Quote' : `Book ${displayTitle}`)}
            </button>
          </form>

          {bookingMessage && (
            <p className={`mt-3 text-sm font-medium ${
              bookingMessage.toLowerCase().includes('success') || bookingMessage.toLowerCase().includes('sent')
                ? 'text-green-400'
                : 'text-red-400'
            }`}>
              {bookingMessage}
            </p>
          )}
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <button
        type="button"
        onClick={scrollToBookingForm}
        className="md:hidden fixed bottom-20 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 rounded-2xl bg-linear-to-r from-orange-600 via-amber-500 to-orange-500 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition"
      >
        {isBengaliVivahEnquiryOnly ? 'Send Enquiry' : `Book Now • ₹${payableAmount.toLocaleString('en-IN')}`}
      </button>
    </div>
  )
}

export default PoojaDetailPage

