import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import Seo from '../components/Seo'
import api from '../services/api'

function OverviewMetricCard({ title, value, caption, className = 'rounded-xl border border-[#FFE0A3] bg-white p-4 shadow-sm' }) {
  return (
    <div className={className}>
      <p className="text-sm text-[#333333]/75">{title}</p>
      <p className="mt-1 text-4xl font-bold text-[#333333]">{value}</p>
      <p className="mt-1 text-xs">{caption}</p>
    </div>
  )
}

function DetailFieldCard({
  label,
  value,
  className = 'rounded-xl border border-[#FFE0A3] bg-white p-3.5',
  valueClassName = 'text-2xl font-medium text-[#333333] mt-1',
}) {
  return (
    <div className={className}>
      <p className="text-xs text-[#333333]/65">{label}</p>
      <p className={valueClassName}>{value || '-'}</p>
    </div>
  )
}

function AdminPage() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    revenue: 0,
    totalEnquiries: 0,
    totalPayments: 0,
    conversionRate: 0,
    topServices: [],
    dropOffStage: { stage: 'Requested → Confirmed', dropped: 0 },
    funnel: {
      service_view: 0,
      form_started: 0,
      booking_submitted: 0,
      payment_success: 0,
    },
    funnelRates: {
      formToBooking: 0,
      bookingToPayment: 0,
    },
  })
  const [analyticsRange, setAnalyticsRange] = useState('30d')
  const [poojas, setPoojas] = useState([])
  const [galleryItems, setGalleryItems] = useState([])
  const [bookings, setBookings] = useState([])
  const [recentBookings, setRecentBookings] = useState([])
  const [enquiries, setEnquiries] = useState([])
  const [payments, setPayments] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [feedbackActionMessage, setFeedbackActionMessage] = useState('')
  const [deletingFeedbackById, setDeletingFeedbackById] = useState({})
  const [refreshingDashboard, setRefreshingDashboard] = useState(false)
  const [refreshingRecent, setRefreshingRecent] = useState(false)
  const [packageFilter, setPackageFilter] = useState('all')
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all')
  const [bookingSearch, setBookingSearch] = useState('')
  const [reviewRequestLoadingById, setReviewRequestLoadingById] = useState({})
  const [reviewRequestMessage, setReviewRequestMessage] = useState('')
  const [panditMessageLoadingById, setPanditMessageLoadingById] = useState({})
  const [panditMessageStatus, setPanditMessageStatus] = useState('')
  const [rowDensity, setRowDensity] = useState('comfortable')
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null)
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null)
  const [detailsBookingStatus, setDetailsBookingStatus] = useState('pending')
  const [updatingDetailsStatus, setUpdatingDetailsStatus] = useState(false)
  const [twilioTestForm, setTwilioTestForm] = useState({ to: '', body: '', contentSid: '', contentVariables: '' })
  const [twilioTesting, setTwilioTesting] = useState(false)
  const [twilioTestResult, setTwilioTestResult] = useState(null)
  const [twilioTestError, setTwilioTestError] = useState('')
  const [form, setForm] = useState({ title: '', description: '', image: '', startPrice: 0 })
  const [proofUploadState, setProofUploadState] = useState({ uploading: false, message: '', error: '' })
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    category: 'Ganesh Puja',
    location: '',
    date: '',
    image: '',
  })
  const [galleryEditId, setGalleryEditId] = useState(null)
  const [galleryEditForm, setGalleryEditForm] = useState({
    title: '',
    category: 'Ganesh Puja',
    location: '',
    date: '',
    image: '',
  })
  const [galleryUploadState, setGalleryUploadState] = useState({ uploading: false, message: '', error: '' })
  const [activeSidebarSection, setActiveSidebarSection] = useState('dashboard')
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('admin_dark_mode') === 'on'
  })
  const dashboardSectionRef = useRef(null)
  const bookingsSectionRef = useRef(null)
  const servicesSectionRef = useRef(null)
  const paymentsSectionRef = useRef(null)
  const enquiriesSectionRef = useRef(null)
  const settingsSectionRef = useRef(null)

  const normalizeBookingStatus = (status) => {
    const normalized = String(status || '').toLowerCase()
    if (normalized === 'confirmed' || normalized === 'completed' || normalized === 'cancelled') {
      return normalized
    }
    return 'pending'
  }

  const graphMetrics = useMemo(() => {
    const workDone = bookings.filter((booking) => normalizeBookingStatus(booking.bookingStatus) === 'completed').length
    const rejected = bookings.filter((booking) => normalizeBookingStatus(booking.bookingStatus) === 'cancelled').length
    const pending = bookings.filter((booking) => normalizeBookingStatus(booking.bookingStatus) === 'pending').length

    const metrics = [
      { label: 'Earning (₹)', value: Number(stats.revenue) || 0, tone: 'bg-[#D84315]' },
      { label: 'Work Done', value: workDone, tone: 'bg-green-600' },
      { label: 'Rejected', value: rejected, tone: 'bg-red-600' },
      { label: 'Pending', value: pending, tone: 'bg-[#FF6F00]' },
    ]

    const maxValue = Math.max(...metrics.map((item) => item.value), 1)
    return metrics.map((item) => ({
      ...item,
      width: `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 8 : 0)}%`,
    }))
  }, [bookings, stats.revenue])

  const packageOptions = useMemo(() => {
    const values = Array.from(
      new Set(
        bookings
          .map((booking) => String(booking.package || '').trim())
          .filter(Boolean)
      )
    )
    return values.sort((left, right) => left.localeCompare(right))
  }, [bookings])

  const filteredBookings = useMemo(() => {
    const normalizedQuery = bookingSearch.trim().toLowerCase()

    return bookings.filter((booking) => {
      const packageMatches = packageFilter === 'all' || booking.package === packageFilter
      const statusMatches =
        bookingStatusFilter === 'all' ||
        normalizeBookingStatus(booking.bookingStatus) === bookingStatusFilter

      if (!normalizedQuery) {
        return packageMatches && statusMatches
      }

      const haystack = [
        booking.name,
        booking.phone,
        booking.email,
        booking.poojaId?.title,
      ]
        .map((value) => String(value || '').toLowerCase())
        .join(' ')

      return packageMatches && statusMatches && haystack.includes(normalizedQuery)
    })
  }, [bookings, packageFilter, bookingStatusFilter, bookingSearch])

  const filteredRecentBookings = useMemo(() => {
    return recentBookings
  }, [recentBookings])

  const loadStats = useCallback(async (range) => {
    const statsRes = await api.get('/dashboard/admin/stats', {
      params: { range },
    })
    setStats(statsRes.data)
  }, [])

  const loadData = async () => {
    const [poojaRes, galleryRes, bookingRes, recentBookingRes, enquiryRes, paymentRes, feedbackRes] = await Promise.all([
      api.get('/poojas'),
      api.get('/gallery'),
      api.get('/bookings/admin/all'),
      api.get('/bookings/admin/recent?limit=10'),
      api.get('/enquiries'),
      api.get('/payments/admin/all'),
      api.get('/feedback/admin/all?limit=500'),
    ])
    setPoojas(poojaRes.data)
    setGalleryItems(Array.isArray(galleryRes.data) ? galleryRes.data : [])
    setBookings(bookingRes.data)
    setRecentBookings(recentBookingRes.data)
    setEnquiries(enquiryRes.data)
    setPayments(paymentRes.data)
    setFeedbacks(feedbackRes.data)
    setLastUpdatedAt(new Date())
  }

  const refreshDashboard = async () => {
    setRefreshingDashboard(true)
    try {
      await Promise.all([loadData(), loadStats(analyticsRange)])
    } finally {
      setRefreshingDashboard(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadStats(analyticsRange)
  }, [analyticsRange, loadStats])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('admin_dark_mode', isDarkMode ? 'on' : 'off')
  }, [isDarkMode])

  const createPooja = async (event) => {
    event.preventDefault()
    await api.post('/poojas', {
      ...form,
      packages: [
        { name: 'Without Samagri', price: Number(form.startPrice), includesSamagri: false },
        { name: 'With Samagri', price: Math.round(Number(form.startPrice) * 1.35), includesSamagri: true },
      ],
    })
    setForm({ title: '', description: '', image: '', startPrice: 0 })
    loadData()
  }

  const handleProofUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const formData = new FormData()
    formData.append('image', file)

    try {
      setProofUploadState({ uploading: true, message: '', error: '' })
      const response = await api.post('/admin/upload-proof', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setProofUploadState({
        uploading: false,
        message: `Uploaded: ${response.data.fileName}`,
        error: '',
      })
      event.target.value = ''
    } catch (error) {
      const message = error?.response?.data?.message || 'Upload failed. Please try again.'
      setProofUploadState({ uploading: false, message: '', error: message })
    }
  }

  const handleGalleryImageUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const formData = new FormData()
    formData.append('image', file)

    try {
      setGalleryUploadState({ uploading: true, message: '', error: '' })
      const response = await api.post('/gallery/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (galleryEditId) {
        setGalleryEditForm((current) => ({ ...current, image: response.data.url }))
      } else {
        setGalleryForm((current) => ({ ...current, image: response.data.url }))
      }

      setGalleryUploadState({
        uploading: false,
        message: `Image uploaded: ${response.data.fileName}`,
        error: '',
      })
      event.target.value = ''
    } catch (error) {
      const message = error?.response?.data?.message || 'Gallery image upload failed. Please try again.'
      setGalleryUploadState({ uploading: false, message: '', error: message })
    }
  }

  const updateGalleryField = (field, value) => {
    if (galleryEditId) {
      setGalleryEditForm((current) => ({ ...current, [field]: value }))
      return
    }

    setGalleryForm((current) => ({ ...current, [field]: value }))
  }

  const createGalleryPhoto = async (event) => {
    event.preventDefault()

    if (!galleryForm.image) {
      setGalleryUploadState({ uploading: false, message: '', error: 'Please upload a gallery image before saving.' })
      return
    }

    try {
      const response = await api.post('/gallery', {
        ...galleryForm,
        sortOrder: 0,
      })

      const newGalleryPhoto = response.data
      setGalleryItems((current) => [newGalleryPhoto, ...current])
      setGalleryForm({ title: '', category: 'Ganesh Puja', location: '', date: '', image: '' })
      setGalleryUploadState({ uploading: false, message: 'Gallery photo added successfully.', error: '' })
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to save gallery photo.'
      setGalleryUploadState({ uploading: false, message: '', error: message })
    }
  }

  const openGalleryEditor = (item) => {
    setGalleryEditId(item._id)
    setGalleryEditForm({
      title: item.title,
      category: item.category,
      location: item.location,
      date: item.date,
      image: item.image,
    })
    setGalleryUploadState({ uploading: false, message: '', error: '' })
  }

  const cancelGalleryEdit = () => {
    setGalleryEditId(null)
    setGalleryEditForm({ title: '', category: 'Ganesh Puja', location: '', date: '', image: '' })
    setGalleryUploadState({ uploading: false, message: '', error: '' })
  }

  const saveGalleryEdit = async (event) => {
    event.preventDefault()

    if (!galleryEditId || !galleryEditForm.image) {
      setGalleryUploadState({ uploading: false, message: '', error: 'Please upload a gallery image before saving.' })
      return
    }

    try {
      const response = await api.put(`/gallery/${galleryEditId}`, {
        ...galleryEditForm,
        sortOrder: 0,
      })

      setGalleryItems((current) => current.map((item) => (item._id === galleryEditId ? response.data : item)))
      cancelGalleryEdit()
      setGalleryUploadState({ uploading: false, message: 'Gallery photo updated successfully.', error: '' })
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to update gallery photo.'
      setGalleryUploadState({ uploading: false, message: '', error: message })
    }
  }

  const deleteGalleryPhoto = async (id) => {
    try {
      await api.delete(`/gallery/${id}`)
      setGalleryItems((current) => current.filter((item) => item._id !== id))
      if (galleryEditId === id) {
        cancelGalleryEdit()
      }
      setGalleryUploadState({ uploading: false, message: 'Gallery photo deleted successfully.', error: '' })
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to delete gallery photo.'
      setGalleryUploadState({ uploading: false, message: '', error: message })
    }
  }

  const updateBookingStatus = async (id, bookingStatus) => {
    await api.patch(`/bookings/${id}/status`, { bookingStatus })
    loadData()
  }

  const deletePooja = async (id) => {
    await api.delete(`/poojas/${id}`)
    loadData()
  }

  const refreshRecentBookings = async () => {
    setRefreshingRecent(true)
    try {
      const recentBookingRes = await api.get('/bookings/admin/recent?limit=10')
      setRecentBookings(recentBookingRes.data)
    } finally {
      setRefreshingRecent(false)
    }
  }

  const resendReviewRequest = async (bookingId) => {
    setReviewRequestMessage('')
    setReviewRequestLoadingById((prev) => ({ ...prev, [bookingId]: true }))
    try {
      await api.post(`/bookings/${bookingId}/resend-review`)
      setReviewRequestMessage('Review request sent successfully.')
    } catch (error) {
      setReviewRequestMessage(error.response?.data?.message || 'Failed to send review request.')
    } finally {
      setReviewRequestLoadingById((prev) => ({ ...prev, [bookingId]: false }))
    }
  }

  const deleteFeedback = async (feedbackId) => {
    if (!feedbackId) return

    const shouldDelete = window.confirm('Delete this review permanently? This cannot be undone.')
    if (!shouldDelete) return

    setFeedbackActionMessage('')
    setDeletingFeedbackById((prev) => ({ ...prev, [feedbackId]: true }))

    try {
      await api.delete(`/feedback/${feedbackId}`)
      setFeedbacks((prev) => prev.filter((feedback) => feedback._id !== feedbackId))
      setFeedbackActionMessage('Review deleted successfully.')
    } catch (error) {
      setFeedbackActionMessage(error.response?.data?.message || 'Failed to delete review.')
    } finally {
      setDeletingFeedbackById((prev) => ({ ...prev, [feedbackId]: false }))
    }
  }

  const moderateFeedback = async (feedbackId, action) => {
    try {
      const response = await api.patch(`/feedback/${feedbackId}/${action}`)
      setFeedbacks((prev) => prev.map((feedback) => feedback._id === feedbackId ? response.data : feedback))
      setFeedbackActionMessage(`Review ${action === 'approve' ? 'approved' : 'rejected'} successfully.`)
    } catch (error) {
      setFeedbackActionMessage(error.response?.data?.message || `Failed to ${action} review.`)
    }
  }

  const buildPanditMessageFromBooking = (booking) => {
    const poojaName = String(booking?.poojaId?.title || 'Pooja Service').trim()
    const bookingId = String(booking?._id || '').trim()
    const customerName = String(booking?.name || '').trim() || 'N/A'
    const customerPhone = String(booking?.phone || '').trim() || 'N/A'
    const poojaDate = String(booking?.date || '').trim() || 'N/A'
    const poojaTime = String(booking?.time || '').trim() || 'N/A'
    const address = String(booking?.address || '').trim() || 'N/A'
    const selectedPackage = String(booking?.package || '').trim() || 'N/A'
    const addOns =
      Array.isArray(booking?.selectedAddOns) && booking.selectedAddOns.length > 0
        ? booking.selectedAddOns.join(', ')
        : 'None'
    const specialNotes = String(booking?.specialNotes || '').trim()

    const lines = [
      '📿 New Puja Booking',
      '',
      `Booking ID: ${bookingId}`,
      '',
      `Puja: ${poojaName}`,
      `Date: ${poojaDate}`,
      `Time: ${poojaTime}`,
      '',
      `Customer Name: ${customerName}`,
      `Phone: ${customerPhone}`,
      `Location: ${address}`,
      '',
      `Package: ${selectedPackage}`,
      `Add-ons: ${addOns}`,
    ]

    if (specialNotes) {
      lines.push(`Special Notes: ${specialNotes}`)
    }

    lines.push('', 'Please confirm your availability for this booking.', 'Thank you 🙏')
    return lines.join('\n')
  }

  const copyPanditBookingMessage = async (booking) => {
    const bookingId = booking?._id
    if (!bookingId) {
      setPanditMessageStatus('Booking details not available.')
      return
    }

    setPanditMessageStatus('')
    setPanditMessageLoadingById((prev) => ({ ...prev, [bookingId]: true }))

    try {
      const message = buildPanditMessageFromBooking(booking)

      if (!message) {
        setPanditMessageStatus('No message generated for this booking.')
        return
      }

      let copied = false

      if (navigator?.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(message)
          copied = true
        } catch {
          copied = false
        }
      }

      if (!copied) {
        const textArea = document.createElement('textarea')
        textArea.value = message
        textArea.setAttribute('readonly', '')
        textArea.style.position = 'fixed'
        textArea.style.top = '0'
        textArea.style.left = '-9999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
          copied = Boolean(document.execCommand('copy'))
        } catch {
          copied = false
        }

        document.body.removeChild(textArea)
      }

      if (copied) {
        setPanditMessageStatus('Pandit WhatsApp message copied.')
      } else {
        window.prompt('Copy message manually:', message)
        setPanditMessageStatus('Clipboard blocked. Message opened for manual copy.')
      }
    } catch (error) {
      setPanditMessageStatus(error.response?.data?.message || 'Failed to generate message.')
    } finally {
      setPanditMessageLoadingById((prev) => ({ ...prev, [bookingId]: false }))
    }
  }

  const openPanditWhatsApp = async (booking) => {
    const bookingId = booking?._id
    if (!bookingId) {
      setPanditMessageStatus('Booking details not available.')
      return
    }

    setPanditMessageStatus('')
    setPanditMessageLoadingById((prev) => ({ ...prev, [bookingId]: true }))

    try {
      const message = buildPanditMessageFromBooking(booking)
      const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`

      if (!whatsappShareUrl) {
        setPanditMessageStatus('WhatsApp link could not be generated.')
        return
      }

      window.open(whatsappShareUrl, '_blank', 'noopener,noreferrer')
      setPanditMessageStatus('Opened WhatsApp message.')
    } catch (error) {
      setPanditMessageStatus(error.response?.data?.message || 'Failed to open WhatsApp message.')
    } finally {
      setPanditMessageLoadingById((prev) => ({ ...prev, [bookingId]: false }))
    }
  }

  const formatCurrency = (value) => `₹ ${Number(value || 0).toLocaleString('en-IN')}`

  const getPaymentTypeLabel = (paymentOption) => {
    if (paymentOption === 'advance') return '30% Advance'
    if (paymentOption === 'full') return 'Full Payment'
    if (paymentOption === 'pay-after-pooja') return 'Pay After Pooja'
    return 'N/A'
  }

  const analyticsRangeLabel = analyticsRange === '7d'
    ? 'Last 7 Days'
    : analyticsRange === '30d'
      ? 'Last 30 Days'
      : 'All Time'

  const tableDensityClass = rowDensity === 'compact'
    ? '[&_thead_th]:!py-2 [&_tbody_td]:!py-1.5'
    : '[&_thead_th]:!py-2.5 [&_tbody_td]:!py-2.5'

  const getPaymentStatusView = (booking) => {
    const normalizedStatus = String(booking.paymentStatus || '').toLowerCase()
    const isPaid = normalizedStatus === 'paid'

    if (isPaid) {
      return {
        label: 'Paid',
        icon: '✅',
        badgeClass: 'bg-green-50 text-green-700 border-green-200',
      }
    }

    return {
      label: 'Pending',
      icon: '❌',
      badgeClass: 'bg-[#FFF8E1] text-[#D84315] border-[#FFE0A3]',
    }
  }

  const getBookingStatusView = (bookingStatus) => {
    const normalizedStatus = String(bookingStatus || '').toLowerCase()

    if (normalizedStatus === 'completed') {
      return {
        label: 'Completed',
        badgeClass: 'bg-green-50 text-green-700 border-green-200',
      }
    }

    if (normalizedStatus === 'confirmed') {
      return {
        label: 'Confirmed',
        badgeClass: 'bg-[#FFF0C2] text-[#FF6F00] border-[#FFE0A3]',
      }
    }

    if (normalizedStatus === 'cancelled') {
      return {
        label: 'Cancelled',
        badgeClass: 'bg-red-50 text-red-700 border-red-200',
      }
    }

    return {
      label: 'Pending',
      badgeClass: 'bg-[#FFF8E1] text-[#D84315] border-[#FFE0A3]',
    }
  }

  const isPendingFollowUp = (booking) => {
    const status = normalizeBookingStatus(booking?.bookingStatus)
    if (status !== 'pending') return false
    const createdAt = new Date(booking?.createdAt)
    if (Number.isNaN(createdAt.getTime())) return false
    return Date.now() - createdAt.getTime() >= 24 * 60 * 60 * 1000
  }

  const openBookingDetails = (booking) => {
    setSelectedBookingDetails(booking)
    setDetailsBookingStatus(normalizeBookingStatus(booking.bookingStatus))
  }

  const closeBookingDetails = () => {
    setSelectedBookingDetails(null)
    setDetailsBookingStatus('pending')
    setUpdatingDetailsStatus(false)
  }

  const formatDateTime = (value) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleString()
  }

  const escapeCsvCell = (value) => {
    const normalized = String(value ?? '').replace(/\r?\n|\r/g, ' ').trim()
    if (normalized.includes('"')) {
      return `"${normalized.replace(/"/g, '""')}"`
    }
    if (/[",]/.test(normalized)) {
      return `"${normalized}"`
    }
    return normalized
  }

  const downloadCsv = (fileName, headers, rows) => {
    const csv = [
      headers.join(','),
      ...rows.map((row) => headers.map((key) => escapeCsvCell(row[key])).join(',')),
    ].join('\n')

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }

  const rangeWindowInMs = useMemo(() => {
    if (analyticsRange === '7d') return 7 * 24 * 60 * 60 * 1000
    if (analyticsRange === '30d') return 30 * 24 * 60 * 60 * 1000
    return null
  }, [analyticsRange])

  const isWithinSelectedRange = useCallback((value) => {
    if (!rangeWindowInMs) return true
    const time = new Date(value).getTime()
    if (Number.isNaN(time)) return false
    return Date.now() - time <= rangeWindowInMs
  }, [rangeWindowInMs])

  const filteredBookingsForExport = useMemo(
    () => filteredBookings.filter((booking) => isWithinSelectedRange(booking.createdAt)),
    [filteredBookings, isWithinSelectedRange]
  )

  const filteredEnquiriesForExport = useMemo(
    () => enquiries.filter((item) => isWithinSelectedRange(item.createdAt)),
    [enquiries, isWithinSelectedRange]
  )

  const filteredPaymentsForExport = useMemo(
    () => payments.filter((payment) => isWithinSelectedRange(payment.createdAt)),
    [payments, isWithinSelectedRange]
  )

  const exportBookingsCsv = () => {
    if (filteredBookingsForExport.length === 0) return

    const headers = [
      'bookingId',
      'createdAt',
      'name',
      'phone',
      'email',
      'poojaTitle',
      'package',
      'bookingDate',
      'bookingTime',
      'city',
      'address',
      'bookingStatus',
      'paymentStatus',
      'paymentType',
      'finalAmount',
      'paymentAmount',
      'addOns',
      'specialNotes',
    ]

    const rows = filteredBookingsForExport.map((booking) => ({
      bookingId: booking._id,
      createdAt: booking.createdAt ? new Date(booking.createdAt).toISOString() : '',
      name: booking.name,
      phone: booking.phone,
      email: booking.email,
      poojaTitle: booking.poojaId?.title,
      package: booking.package || 'Without Samagri',
      bookingDate: booking.date,
      bookingTime: booking.time,
      city: booking.city,
      address: booking.address,
      bookingStatus: normalizeBookingStatus(booking.bookingStatus),
      paymentStatus: String(booking.paymentStatus || '').toLowerCase() || 'pending',
      paymentType: getPaymentTypeLabel(booking.paymentOption),
      finalAmount: Number(booking.finalAmount || 0),
      paymentAmount: Number(booking.paymentAmount || 0),
      addOns: Array.isArray(booking.selectedAddOns) ? booking.selectedAddOns.join(' | ') : '',
      specialNotes: booking.specialNotes,
    }))

    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    const rangeSuffix = analyticsRange === 'all' ? 'all-time' : analyticsRange
    downloadCsv(`bookings-${rangeSuffix}-${stamp}.csv`, headers, rows)
  }

  const exportEnquiriesCsv = () => {
    if (filteredEnquiriesForExport.length === 0) return

    const headers = ['enquiryId', 'createdAt', 'name', 'phone', 'email', 'message']

    const rows = filteredEnquiriesForExport.map((item) => ({
      enquiryId: item._id,
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : '',
      name: item.name,
      phone: item.phone,
      email: item.email,
      message: item.message,
    }))

    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    const rangeSuffix = analyticsRange === 'all' ? 'all-time' : analyticsRange
    downloadCsv(`enquiries-${rangeSuffix}-${stamp}.csv`, headers, rows)
  }

  const exportPaymentsCsv = () => {
    if (filteredPaymentsForExport.length === 0) return

    const headers = ['paymentId', 'createdAt', 'razorpayOrderId', 'razorpayPaymentId', 'amount', 'status', 'bookingId']

    const rows = filteredPaymentsForExport.map((payment) => ({
      paymentId: payment._id,
      createdAt: payment.createdAt ? new Date(payment.createdAt).toISOString() : '',
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
      amount: Number(payment.amount || 0),
      status: payment.status,
      bookingId: payment.bookingId?._id || payment.bookingId || '',
    }))

    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    const rangeSuffix = analyticsRange === 'all' ? 'all-time' : analyticsRange
    downloadCsv(`payments-${rangeSuffix}-${stamp}.csv`, headers, rows)
  }

  const getMapLink = (booking) => {
    const latitude = Number(booking?.coordinates?.latitude)
    const longitude = Number(booking?.coordinates?.longitude)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return ''
    return `https://www.google.com/maps?q=${latitude},${longitude}`
  }

  const saveDetailsStatus = async () => {
    if (!selectedBookingDetails?._id) return

    setUpdatingDetailsStatus(true)
    try {
      const response = await api.patch(`/bookings/${selectedBookingDetails._id}/status`, {
        bookingStatus: detailsBookingStatus,
      })

      const updated = response.data

      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === updated._id
            ? {
                ...booking,
                bookingStatus: updated.bookingStatus,
              }
            : booking
        )
      )

      setRecentBookings((prev) =>
        prev.map((booking) =>
          booking._id === updated._id
            ? {
                ...booking,
                bookingStatus: updated.bookingStatus,
              }
            : booking
        )
      )

      setSelectedBookingDetails((prev) =>
        prev
          ? {
              ...prev,
              bookingStatus: updated.bookingStatus,
            }
          : prev
      )
    } finally {
      setUpdatingDetailsStatus(false)
    }
  }

  const runTwilioTest = async (event) => {
    event.preventDefault()
    const to = String(twilioTestForm.to || '').trim()
    const body = String(twilioTestForm.body || '').trim()
    const contentSid = String(twilioTestForm.contentSid || '').trim()
    const contentVariablesRaw = String(twilioTestForm.contentVariables || '').trim()
    let parsedContentVariables

    if (!to) {
      setTwilioTestError('Recipient number is required.')
      setTwilioTestResult(null)
      return
    }

    if (contentVariablesRaw) {
      try {
        parsedContentVariables = JSON.parse(contentVariablesRaw)
      } catch {
        setTwilioTestError('Content Variables must be valid JSON (example: {"1":"12/1","2":"3pm"}).')
        setTwilioTestResult(null)
        return
      }
    }

    setTwilioTesting(true)
    setTwilioTestError('')
    setTwilioTestResult(null)

    try {
      const payload = {
        to,
        body,
        contentSid,
        contentVariables: parsedContentVariables,
      }

      const response = await api.post('/dashboard/admin/test-twilio', payload)
      setTwilioTestResult(response.data)
    } catch (error) {
      setTwilioTestError(error.response?.data?.message || 'Twilio test failed.')
    } finally {
      setTwilioTesting(false)
    }
  }

  useEffect(() => {
    const raw = String(twilioTestForm.contentVariables || '')
    const trimmed = raw.trim()

    if (!trimmed) return

    const timer = window.setTimeout(() => {
      try {
        const parsed = JSON.parse(trimmed)
        const formatted = JSON.stringify(parsed, null, 2)

        if (formatted !== raw) {
          setTwilioTestForm((prev) =>
            prev.contentVariables === raw
              ? { ...prev, contentVariables: formatted }
              : prev
          )
        }

        if (twilioTestError.startsWith('Content Variables')) {
          setTwilioTestError('')
        }
      } catch {
        // Keep user input unchanged while JSON is incomplete.
      }
    }, 500)

    return () => window.clearTimeout(timer)
  }, [twilioTestForm.contentVariables, twilioTestError])

  const completionRate = stats.totalBookings
    ? Math.round((bookings.filter((booking) => normalizeBookingStatus(booking.bookingStatus) === 'completed').length / stats.totalBookings) * 100)
    : 0

  const navigateToSection = (section) => {
    setActiveSidebarSection(section)

    const refsBySection = {
      dashboard: dashboardSectionRef,
      bookings: bookingsSectionRef,
      services: servicesSectionRef,
      payments: paymentsSectionRef,
      enquiries: enquiriesSectionRef,
      settings: settingsSectionRef,
    }

    refsBySection[section]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const sidebarSections = useMemo(
    () => [
      { key: 'dashboard', ref: dashboardSectionRef },
      { key: 'bookings', ref: bookingsSectionRef },
      { key: 'services', ref: servicesSectionRef },
      { key: 'payments', ref: paymentsSectionRef },
      { key: 'enquiries', ref: enquiriesSectionRef },
      { key: 'settings', ref: settingsSectionRef },
    ],
    []
  )

  useEffect(() => {
    const resolveActiveSection = () => {
      const offset = 180
      let currentSection = 'dashboard'

      for (const section of sidebarSections) {
        const element = section.ref.current
        if (!element) continue
        const top = element.getBoundingClientRect().top
        if (top - offset <= 0) {
          currentSection = section.key
        }
      }

      setActiveSidebarSection((prev) => (prev === currentSection ? prev : currentSection))
    }

    resolveActiveSection()

    let isTicking = false
    const onScrollOrResize = () => {
      if (isTicking) return
      isTicking = true
      window.requestAnimationFrame(() => {
        resolveActiveSection()
        isTicking = false
      })
    }

    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize)

    return () => {
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [sidebarSections])

  const getSidebarButtonClass = (section) => {
    const base = 'admin-nav-item w-full rounded-md px-3 py-2 text-left transition-colors'
    const active = activeSidebarSection === section

    if (active) {
      return `${base} admin-nav-item-active border-l-2 border-[#D84315] bg-[#FFF0C2] font-medium text-[#D84315]`
    }

    return `${base} text-stone-700 hover:bg-[#FFF8E1] hover:text-[#FF6F00]`
  }

  return (
    <section className={`min-h-screen bg-[#f6ebdc] p-3 sm:p-4 ${isDarkMode ? 'bg-[#1b120d]' : ''}`}>
      <Seo title="Admin Panel | Puja Samriddhi" description="Manage poojas, bookings, enquiries, and payments." />

      <div className={`mx-auto max-w-[1500px] overflow-hidden rounded-[26px] border ${isDarkMode ? 'border-stone-700 bg-stone-900 text-stone-100' : 'border-[#f1d7a0] bg-[#f8f3ea] text-[#1f1a17]'}`}>
        <div className="grid min-h-[calc(100vh-2rem)] lg:grid-cols-[236px_minmax(0,1fr)]">
          <aside className={`hidden flex-col border-r p-4 lg:flex ${isDarkMode ? 'border-stone-700 bg-[#1d1715]' : 'border-[#f2d39e] bg-[#fefcf8]'}`}>
            <div className="rounded-[18px] border border-[#f0d79b] bg-[#fff8e7] p-3 shadow-[0_8px_18px_rgba(255,152,0,0.08)]">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[#f9ae3d] to-[#d45d1b] shadow-sm">
                  <span className="text-[20px] text-white">☼</span>
                </div>
                <div>
                  <p className="text-[1.7rem] font-semibold leading-none tracking-[-0.04em] text-[#2a211b]">Puja</p>
                  <p className="text-[1.7rem] font-semibold leading-none tracking-[-0.04em] text-[#2a211b]">Samriddhi</p>
                </div>
              </div>
              <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#8b7464]">Book Verified Pandits Online</p>
            </div>

            <div className="mt-7 space-y-1">
              {[
                { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
                { key: 'bookings', label: 'Bookings', icon: '🗓️', badge: bookings.length },
                { key: 'services', label: 'Services / Poojas', icon: '🛕' },
                { key: 'payments', label: 'Payments', icon: '💳' },
                { key: 'enquiries', label: 'Enquiries', icon: '💬', badge: enquiries.length },
                { key: 'reviews', label: 'Reviews', icon: '⭐', badge: feedbacks.length },
                { key: 'pandits', label: 'Pandits', icon: '🧑‍🏫' },
                { key: 'gallery', label: 'Gallery / Media', icon: '🖼️' },
                { key: 'marketing', label: 'Marketing', icon: '📢' },
                { key: 'reports', label: 'Reports', icon: '📊' },
                { key: 'settings', label: 'Settings', icon: '⚙️' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigateToSection(item.key === 'reviews' ? 'enquiries' : item.key === 'gallery' ? 'services' : item.key === 'pandits' ? 'bookings' : item.key === 'reports' ? 'payments' : item.key)}
                  className={`${getSidebarButtonClass(item.key === 'reviews' ? 'enquiries' : item.key === 'gallery' ? 'services' : item.key === 'pandits' ? 'bookings' : item.key === 'reports' ? 'payments' : item.key)} flex items-center justify-between`}
                >
                  <span className="flex items-center gap-3">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  {item.badge ? (
                    <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-[#f59e0b] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            <div className="mt-auto space-y-3">
              <div className="rounded-[18px] border border-[#f5d9a5] bg-[#fffaf3] p-3 shadow-[0_8px_18px_rgba(120,72,15,0.06)]">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#f7d6b5] to-[#f7b866] text-sm font-semibold text-[#4a2f1a]">LP</div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#2a211b]">Lokanath Panda</p>
                    <p className="truncate text-[11px] text-[#7a685d]">Admin</p>
                  </div>
                </div>
                <button type="button" className="mt-3 w-full rounded-xl border border-[#f1d2aa] bg-white px-3 py-2 text-sm font-medium text-[#3b2d24] transition hover:bg-[#fff8ef]">
                  Log out
                </button>
              </div>

              <div className="rounded-[18px] border border-[#f5d3b0] bg-[#fffaf3] p-3 shadow-[0_8px_18px_rgba(120,72,15,0.04)]">
                <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8f6d57]">Need Help?</div>
                <button type="button" className="mt-2 w-full rounded-xl bg-[#f26f1b] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e56612]">
                  Contact Support
                </button>
              </div>
            </div>
          </aside>

          <main className="admin-content p-4 sm:p-5 lg:p-6">
            <div className="admin-toolbar flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[#f4d8a6] bg-white/80 p-3 shadow-[0_10px_25px_rgba(143,102,39,0.06)] backdrop-blur-sm">
              <div className="min-w-[220px] flex-1">
                <div className="flex items-center gap-2 rounded-full border border-[#ebdfc8] bg-[#f7f3eb] px-3 py-2 text-sm text-[#745f51] shadow-inner">
                  <span>⌕</span>
                  <input
                    className="w-full bg-transparent text-sm text-[#553f38] placeholder:text-[#8f7d75] outline-none"
                    placeholder="Search bookings, customers, poojas..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-[#f1dfc0] bg-white text-lg text-[#4d3f35] shadow-sm transition hover:bg-[#fffaf4]">🔔</button>

                <div className="hidden items-center gap-2 rounded-full border border-[#f1dfc0] bg-white px-2 py-1 shadow-sm sm:flex">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-[#f8ddb7] text-xs font-semibold text-[#5d3a1f]">LP</div>
                  <span className="text-sm font-medium text-[#433730]">Lokanath Panda</span>
                  <span className="text-[#8d7565]">▾</span>
                </div>

                <div className="inline-flex items-center rounded-full border border-[#f0d7a9] bg-[#fff6eb] p-1">
                  {[
                    { value: '7d', label: '7D' },
                    { value: '30d', label: '30D' },
                    { value: 'all', label: 'All' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setAnalyticsRange(option.value)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                        analyticsRange === option.value
                          ? 'bg-[#f26f1b] text-white shadow-sm'
                          : 'text-[#645049] hover:bg-[#fff0d8]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={refreshDashboard}
                  className="rounded-xl bg-[#f26f1b] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#e36111] disabled:opacity-60"
                  disabled={refreshingDashboard}
                >
                  {refreshingDashboard ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-[18px] border border-[#f9ddb0] bg-[#fff4d8] px-4 py-3 text-sm text-[#895b1e] shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">⚠️ {bookings.filter((booking) => normalizeBookingStatus(booking.bookingStatus) === 'pending').length} bookings need your attention.</p>
                <button type="button" className="rounded-lg bg-[#f26f1b] px-3 py-1.5 text-xs font-semibold text-white">Review now</button>
              </div>
            </div>

            <div className="mt-5">
              <div ref={dashboardSectionRef}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#d66e1a]">Dashboard</p>
                    <h1 className="mt-2 text-[2.1rem] font-semibold tracking-[-0.04em] text-[#221d1a]">Welcome back, Lokanath!</h1>
                    <p className="mt-1 text-[14px] text-[#6a564e]">Here&apos;s what&apos;s happening with your Puja Samriddhi platform.</p>
                  </div>
                  <div className="hidden rounded-[14px] border border-[#f2d9a9] bg-[#fff8ef] px-3 py-2 text-right text-sm text-[#6d564b] md:block">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-[#8c7467]">Last updated</div>
                    <div>{lastUpdatedAt ? lastUpdatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[20px] border border-[#cfeaf9] bg-[#ebf7ff] p-4 shadow-[0_10px_22px_rgba(61,102,150,0.06)]">
                    <div className="flex items-center justify-between">
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-white text-xl shadow-sm">📅</div>
                      <div className="text-right text-[12px] font-semibold text-[#0b7f4b]">↑ 40%</div>
                    </div>
                    <div className="mt-4 text-[13px] font-medium text-[#51413d]">Total Bookings</div>
                    <div className="text-[2.1rem] font-bold leading-none tracking-[-0.05em] text-[#1d1a18]">{stats.totalBookings || 28}</div>
                    <div className="mt-1 text-[12px] text-[#6a5c55]">vs last month</div>
                  </div>

                  <div className="rounded-[20px] border border-[#f5debc] bg-[#fff7f0] p-4 shadow-[0_10px_22px_rgba(173,122,42,0.06)]">
                    <div className="flex items-center justify-between">
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-white text-xl shadow-sm">⏳</div>
                      <div className="text-right text-[12px] font-semibold text-[#c96b1d]">↑ 25%</div>
                    </div>
                    <div className="mt-4 text-[13px] font-medium text-[#51413d]">Pending Bookings</div>
                    <div className="text-[2.1rem] font-bold leading-none tracking-[-0.05em] text-[#1d1a18]">{bookings.filter((booking) => normalizeBookingStatus(booking.bookingStatus) === 'pending').length || 5}</div>
                    <div className="mt-1 text-[12px] text-[#6a5c55]">Need review</div>
                  </div>

                  <div className="rounded-[20px] border border-[#d7f0db] bg-[#ecfdf1] p-4 shadow-[0_10px_22px_rgba(75,160,105,0.06)]">
                    <div className="flex items-center justify-between">
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-white text-xl shadow-sm">₹</div>
                      <div className="text-right text-[12px] font-semibold text-[#1f9d61]">↑ 65%</div>
                    </div>
                    <div className="mt-4 text-[13px] font-medium text-[#51413d]">Total Revenue</div>
                    <div className="text-[2.1rem] font-bold leading-none tracking-[-0.05em] text-[#1d1a18]">₹{Number(stats.revenue || 124500).toLocaleString('en-IN')}</div>
                    <div className="mt-1 text-[12px] text-[#6a5c55]">vs last month</div>
                  </div>

                  <div className="rounded-[20px] border border-[#efe0fa] bg-[#f8f1ff] p-4 shadow-[0_10px_22px_rgba(143,96,170,0.06)]">
                    <div className="flex items-center justify-between">
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-white text-xl shadow-sm">★</div>
                      <div className="text-right text-[12px] font-semibold text-[#7958a4]">★ 4.8/5</div>
                    </div>
                    <div className="mt-4 text-[13px] font-medium text-[#51413d]">Total Reviews</div>
                    <div className="text-[2.1rem] font-bold leading-none tracking-[-0.05em] text-[#1d1a18]">{feedbacks.length || 12}</div>
                    <div className="mt-1 text-[12px] text-[#6a5c55]">Average rating</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_360px]">
                <div ref={bookingsSectionRef} className="rounded-[22px] border border-[#f1d7a6] bg-[#fffdfb] p-4 shadow-[0_12px_24px_rgba(123,92,33,0.05)]">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-[2rem] font-semibold tracking-[-0.05em] text-[#221d1a]">Booking Overview</h2>
                    <div className="flex items-center gap-4 text-[12px] text-[#7a675f]">
                      <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#13a15a]" />Completed</span>
                      <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />Pending</span>
                      <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />Cancelled</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-14 items-end gap-2 rounded-[16px] bg-[#f9f4ef] p-3 pt-5">
                    {[20, 16, 18, 10, 12, 15, 13, 17, 11, 14, 9, 10, 12, 15].map((value, index) => (
                      <div key={index} className="flex flex-col items-center justify-end gap-2">
                        <div className="flex w-full items-end justify-center gap-1">
                          <div className="w-2.5 rounded-t-[8px] bg-[#f87171]" style={{ height: `${value * 3}px` }} />
                          <div className="w-2.5 rounded-t-[8px] bg-[#22c55e]" style={{ height: `${(value * 2.2).toFixed(0)}px` }} />
                          <div className="w-2.5 rounded-t-[8px] bg-[#f59e0b]" style={{ height: `${(value * 1.8).toFixed(0)}px` }} />
                        </div>
                        <span className="text-[10px] text-[#7c6d62]">{['Aug 25','Aug 28','Aug 31','Sep 3','Sep 6','Sep 9','Sep 12','Sep 15','Sep 18','Sep 21','Sep 24'][index] || `S${index + 1}`}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[22px] border border-[#f1d7a6] bg-[#fffdfb] p-4 shadow-[0_12px_24px_rgba(123,92,33,0.05)]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[1.9rem] font-semibold tracking-[-0.05em] text-[#221d1a]">Booking Status</h2>
                    <button type="button" className="text-[12px] font-medium text-[#7e645d]">View all</button>
                  </div>

                  <div className="mt-4 flex items-center justify-center">
                    <div
                      className="relative grid h-40 w-40 place-items-center rounded-full"
                      style={{ background: 'conic-gradient(#1e9f64 0 71%, #f59e0b 71% 86%, #f87171 86% 100%)' }}
                    >
                      <div className="grid h-28 w-28 place-items-center rounded-full bg-[#fffdfb] text-center shadow-inner">
                        <div>
                          <div className="text-[2rem] font-bold tracking-[-0.06em] text-[#1d1a18]">28</div>
                          <div className="text-[11px] uppercase tracking-[0.12em] text-[#7e675f]">Total</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-[#4e463e]">
                    <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#1e9f64]" />Completed</span><span>20 (71%)</span></div>
                    <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />Pending</span><span>5 (18%)</span></div>
                    <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#f87171]" />Cancelled</span><span>3 (11%)</span></div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)_minmax(0,0.9fr)]">
                <div className="rounded-[22px] border border-[#f1d7a6] bg-[#fffdfb] p-4 shadow-[0_12px_24px_rgba(123,92,33,0.05)]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[1.7rem] font-semibold tracking-[-0.05em] text-[#221d1a]">Recent bookings</h3>
                    <button type="button" className="text-[12px] font-medium text-[#7e645d]">View all</button>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-[12px] border border-[#f0e4d0] bg-white">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#f8f1e5] text-[#725d53]">
                        <tr>
                          <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em]">#</th>
                          <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em]">Customer</th>
                          <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em]">Pooja</th>
                          <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em]">Amount</th>
                          <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em]">Date</th>
                          <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em]">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[{ id: '001', name: 'Ajay Mandal', pooja: 'Ganesh Pooja', amount: '₹3,500', date: '20 Apr 2026', status: 'Completed' }, { id: '002', name: 'Priya Sharma', pooja: 'Ganesh Pooja', amount: '₹4,500', date: '18 Apr 2026', status: 'Pending' }, { id: '003', name: 'Rahul Verma', pooja: 'Navagraha Pooja', amount: '₹7,500', date: '15 Apr 2026', status: 'Confirmed' }, { id: '004', name: 'Anita Das', pooja: 'Saraswati Pooja', amount: '₹4,300', date: '12 Apr 2026', status: 'Completed' }, { id: '005', name: 'Suresh Kumar', pooja: 'Durga Pooja', amount: '₹6,000', date: '10 Apr 2026', status: 'Cancelled' }].map((row, index) => (
                          <tr key={row.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#fcfaf6]'}>
                            <td className="border-t border-[#f0e4d0] px-3 py-2 text-[#6d5d55]">{row.id}</td>
                            <td className="border-t border-[#f0e4d0] px-3 py-2 text-[#2a211b] font-medium">{row.name}</td>
                            <td className="border-t border-[#f0e4d0] px-3 py-2 text-[#5d504b]">{row.pooja}</td>
                            <td className="border-t border-[#f0e4d0] px-3 py-2 text-[#302b29] font-medium">{row.amount}</td>
                            <td className="border-t border-[#f0e4d0] px-3 py-2 text-[#5c4e47]">{row.date}</td>
                            <td className="border-t border-[#f0e4d0] px-3 py-2">
                              <span className={`inline-block rounded-full px-2 py-1 text-[10px] font-semibold ${row.status === 'Completed' ? 'bg-[#e9fbf2] text-[#18814d]' : row.status === 'Pending' ? 'bg-[#fff2d9] text-[#d98723]' : row.status === 'Confirmed' ? 'bg-[#edfbff] text-[#1774af]' : 'bg-[#ffe4e6] text-[#b32643]'}`}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div ref={servicesSectionRef} className="rounded-[22px] border border-[#f1d7a6] bg-[#fffdfb] p-4 shadow-[0_12px_24px_rgba(123,92,33,0.05)]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[1.6rem] font-semibold tracking-[-0.05em] text-[#221d1a]">Top poojas</h3>
                    <button type="button" className="text-[12px] font-medium text-[#7e645d]">View all</button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {[
                      { name: 'Ganesh Pooja', count: 12 },
                      { name: 'Griha Pravesh', count: 8 },
                      { name: 'Navagraha Pooja', count: 5 },
                      { name: 'Saraswati Pooja', count: 4 },
                      { name: 'Durga Pooja', count: 3 },
                    ].map((item, index) => (
                      <div key={item.name} className="flex items-center gap-3">
                        <span className="w-5 text-center text-xs font-semibold text-[#7b655d]">{index + 1}</span>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="text-[#312826]">{item.name}</span>
                            <span className="text-[#5e4d45]">{item.count}</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-[#f5e8d8]">
                            <div className="h-full rounded-full bg-[#f6a34f]" style={{ width: `${Math.max(item.count * 7, 18)}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div ref={paymentsSectionRef} className="rounded-[22px] border border-[#f1d7a6] bg-[#fffdfb] p-4 shadow-[0_12px_24px_rgba(123,92,33,0.05)]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[1.6rem] font-semibold tracking-[-0.05em] text-[#221d1a]">Revenue trend</h3>
                    <button type="button" className="text-[12px] font-medium text-[#7e645d]">Last 30 days</button>
                  </div>

                  <div className="mt-4 flex h-28 items-end gap-2">
                    {[18, 24, 15, 32, 22, 28, 26, 20, 30, 35, 22, 31].map((height, index) => (
                      <div key={index} className="flex-1 rounded-t-[12px] bg-gradient-to-t from-[#f2a15d] to-[#f8d7b5]" style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>

                <div className="rounded-[22px] border border-[#f1d7a6] bg-[#fffdfb] p-4 shadow-[0_12px_24px_rgba(123,92,33,0.05)]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[1.6rem] font-semibold tracking-[-0.05em] text-[#221d1a]">Customer reviews</h3>
                    <button type="button" className="text-[12px] font-medium text-[#7e645d]">View all</button>
                  </div>

                  <div className="mt-4 rounded-[14px] border border-[#f0e3d4] bg-[#fffaf5] p-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-[#f3d6a8] text-sm font-bold text-[#5d3d2d]">A</div>
                      <div>
                        <div className="font-semibold text-[#2a211b]">Ajay Mandal</div>
                        <div className="text-[12px] text-[#7a685e]">20 Apr 2026</div>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-1 text-[#f59e0b]">★★★★★</div>
                    <p className="mt-2 text-[13px] leading-6 text-[#544842]">
                      We booked the Annaprashan Puja through Puja Samriddhi, and the whole experience was excellent. The panditji was knowledgeable, polite, and explained the rituals clearly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {selectedBookingDetails && (
        <div className="fixed inset-0 z-50 bg-stone-900/45 flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-5xl max-h-[94vh] overflow-auto rounded-xl border border-stone-300 bg-stone-100 shadow-2xl">
            <div className="sticky top-0 z-10 bg-stone-100 border-b border-stone-300 px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-semibold text-stone-900">Booking Details</h3>
                <p className="text-base text-stone-600 mt-1">Booking ID: {selectedBookingDetails._id}</p>
              </div>
              <button
                type="button"
                onClick={closeBookingDetails}
                className="px-5 py-2 text-base rounded-xl border border-stone-300 text-stone-700 bg-white hover:bg-stone-50"
              >
                Close
              </button>
            </div>

            <div className="px-4 sm:px-5 py-4 space-y-4 text-sm">
              <div className="grid sm:grid-cols-2 gap-3">
                <DetailFieldCard label="User Name" value={selectedBookingDetails.name} />
                <DetailFieldCard label="Puja" value={selectedBookingDetails.poojaId?.title} />
                <DetailFieldCard label="Phone" value={selectedBookingDetails.phone} />
                <DetailFieldCard
                  label="Email"
                  value={selectedBookingDetails.email}
                  valueClassName="text-2xl font-medium text-stone-900 mt-1 break-all"
                />
                <DetailFieldCard label="City" value={selectedBookingDetails.city} />
                <DetailFieldCard label="Priest Preference" value={selectedBookingDetails.priestPreference} />
              </div>

              <DetailFieldCard label="Address" value={selectedBookingDetails.address} />

              <div className="rounded-xl border border-stone-300 bg-white p-3.5">
                <p className="text-xs text-stone-500">Location Details</p>
                <div className="mt-2 grid sm:grid-cols-2 gap-2 text-lg text-stone-800">
                  <p><span className="text-stone-500">House:</span> {selectedBookingDetails.addressDetails?.house || '-'}</p>
                  <p><span className="text-stone-500">Street:</span> {selectedBookingDetails.addressDetails?.street || '-'}</p>
                  <p><span className="text-stone-500">City:</span> {selectedBookingDetails.addressDetails?.city || selectedBookingDetails.city || '-'}</p>
                  <p><span className="text-stone-500">State:</span> {selectedBookingDetails.addressDetails?.state || '-'}</p>
                  <p><span className="text-stone-500">Pincode:</span> {selectedBookingDetails.addressDetails?.pincode || '-'}</p>
                  <p><span className="text-stone-500">Latitude:</span> {selectedBookingDetails.coordinates?.latitude ?? '-'}</p>
                  <p><span className="text-stone-500">Longitude:</span> {selectedBookingDetails.coordinates?.longitude ?? '-'}</p>
                </div>
                {getMapLink(selectedBookingDetails) && (
                  <a
                    href={getMapLink(selectedBookingDetails)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-base font-medium text-orange-700 hover:text-orange-800 hover:underline"
                  >
                    View on Google Maps
                  </a>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <DetailFieldCard label="Date" value={selectedBookingDetails.date} />
                <DetailFieldCard label="Time" value={selectedBookingDetails.time} />
              </div>

              <div className="rounded-xl border border-orange-200 bg-white p-4 sm:flex sm:items-center sm:gap-5">
                <QRCodeSVG
                  value={`${window.location.origin}/feedback/${selectedBookingDetails._id}`}
                  size={144}
                  includeMargin
                  className="mx-auto sm:mx-0"
                />
                <div className="mt-3 sm:mt-0">
                  <p className="text-xs uppercase tracking-wide text-orange-700">Customer feedback QR</p>
                  <p className="mt-1 text-sm text-stone-600">Scan this unique code to open the feedback form for this booking.</p>
                  <p className="mt-2 break-all text-xs text-stone-500">{window.location.origin}/feedback/{selectedBookingDetails._id}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <DetailFieldCard label="Package" value={selectedBookingDetails.package} />
                <DetailFieldCard label="Payment Type" value={getPaymentTypeLabel(selectedBookingDetails.paymentOption)} />
                <DetailFieldCard label="Final Amount" value={formatCurrency(selectedBookingDetails.finalAmount)} />
                <DetailFieldCard label="Paid Amount" value={formatCurrency(selectedBookingDetails.paymentAmount)} />
              </div>

              <div className="rounded-xl border border-stone-300 bg-white p-3.5">
                <p className="text-xs text-stone-500">Selected Add-ons</p>
                {Array.isArray(selectedBookingDetails.selectedAddOns) && selectedBookingDetails.selectedAddOns.length > 0 ? (
                  <ul className="mt-2 list-disc list-inside text-2xl text-stone-800 space-y-1">
                    {selectedBookingDetails.selectedAddOns.map((addon) => (
                      <li key={addon}>{addon}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-2xl font-medium text-stone-900 mt-1">No add-ons selected</p>
                )}
              </div>

              <div className="rounded-xl border border-stone-300 bg-white p-3.5">
                <p className="text-xs text-stone-500">Special Notes</p>
                <p className="text-2xl font-medium text-stone-900 mt-1">{selectedBookingDetails.specialNotes || '-'}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <DetailFieldCard label="Booking Status" value={getBookingStatusView(selectedBookingDetails.bookingStatus).label} />
                <DetailFieldCard label="Payment Status" value={getPaymentStatusView(selectedBookingDetails).label} />
                <DetailFieldCard
                  label="Created At"
                  value={formatDateTime(selectedBookingDetails.createdAt)}
                  className="rounded-xl border border-stone-300 bg-white p-3.5 sm:col-span-2"
                />
              </div>

              <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-3.5">
                <p className="text-xs text-stone-500">Update Booking Status</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <select
                    className="border border-stone-300 rounded-xl px-3 py-2 text-base"
                    value={detailsBookingStatus}
                    onChange={(e) => setDetailsBookingStatus(e.target.value)}
                    disabled={updatingDetailsStatus}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    type="button"
                    onClick={saveDetailsStatus}
                    disabled={updatingDetailsStatus || detailsBookingStatus === normalizeBookingStatus(selectedBookingDetails.bookingStatus)}
                    className="px-4 py-2 text-base rounded-xl bg-orange-700 text-white hover:bg-orange-800 disabled:opacity-60"
                  >
                    {updatingDetailsStatus ? 'Saving...' : 'Save Status'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default AdminPage

