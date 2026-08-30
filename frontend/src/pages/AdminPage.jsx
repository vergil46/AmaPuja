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
    const [poojaRes, bookingRes, recentBookingRes, enquiryRes, paymentRes, feedbackRes] = await Promise.all([
      api.get('/poojas'),
      api.get('/bookings/admin/all'),
      api.get('/bookings/admin/recent?limit=10'),
      api.get('/enquiries'),
      api.get('/payments/admin/all'),
      api.get('/feedback/admin/all?limit=500'),
    ])
    setPoojas(poojaRes.data)
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
    const base = 'w-full rounded-md px-3 py-2 text-left transition-colors'
    const active = activeSidebarSection === section

    if (active) {
      return `${base} border-l-2 border-[#D84315] bg-[#FFF0C2] font-medium text-[#D84315]`
    }

    return `${base} text-stone-700 hover:bg-[#FFF8E1] hover:text-[#FF6F00]`
  }

  return (
    <section className={`min-h-screen p-3 sm:p-4 ${isDarkMode ? 'bg-stone-950' : 'bg-[#FFF8E1]'}`}>
      <Seo title="Admin Panel | Puja Samriddhi" description="Manage poojas, bookings, enquiries, and payments." />

      <div className={`mx-auto max-w-362.5 rounded-2xl border shadow-md ${isDarkMode ? 'border-stone-700 bg-stone-900 text-stone-100' : 'border-[#FFE0A3] bg-white/96'}`}>
        <div className="grid lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className={`hidden lg:flex flex-col border-r p-4 ${isDarkMode ? 'border-stone-700 bg-stone-900' : 'border-[#FFE0A3] bg-[#FFFDF5]'}`}>
            <div className="rounded-lg border border-[#FFE0A3] bg-[#FFF8E1] px-3 py-3 shadow-sm">
              <p className="text-2xl font-bold text-[#333333]">Puja Samriddhi</p>
              <p className="text-xs text-[#333333]/60">Sacred Rituals</p>
            </div>

            <nav className="mt-5 space-y-1 text-sm">
              <button type="button" onClick={() => navigateToSection('dashboard')} className={getSidebarButtonClass('dashboard')}>🏠 Dashboard</button>
              <button type="button" onClick={() => navigateToSection('bookings')} className={getSidebarButtonClass('bookings')}>📅 Bookings</button>
              <button type="button" onClick={() => navigateToSection('services')} className={getSidebarButtonClass('services')}>🛕 Services</button>
              <button type="button" onClick={() => navigateToSection('payments')} className={getSidebarButtonClass('payments')}>💳 Payments</button>
              <button type="button" onClick={() => navigateToSection('enquiries')} className={getSidebarButtonClass('enquiries')}>💬 Enquiries</button>
              <button type="button" onClick={() => navigateToSection('settings')} className={getSidebarButtonClass('settings')}>⚙️ Settings</button>
            </nav>

            <button
              type="button"
              onClick={() => setIsDarkMode((prev) => !prev)}
              className={`mt-4 w-full rounded-lg border p-3 ${isDarkMode ? 'border-stone-600 bg-stone-800 text-stone-100' : 'border-[#FFE0A3] bg-white text-[#333333]'}`}
            >
              <div className="flex items-center justify-between text-sm">
                <span>🌙 Dark Mode</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${isDarkMode ? 'text-stone-300' : 'text-stone-500'}`}>{isDarkMode ? 'On' : 'Off'}</span>
                  <span className={`relative h-5 w-9 rounded-full transition-colors ${isDarkMode ? 'bg-[#D84315]' : 'bg-stone-300'}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                  </span>
                </div>
              </div>
            </button>

            <div className="mt-auto rounded-lg border border-[#FFE0A3] bg-white p-3">
              <p className="text-sm font-semibold text-[#333333]">Lokanath Panda</p>
              <p className="text-xs text-[#333333]/60">lokanathpanda46@gmail.com</p>
              <button type="button" className="mt-3 w-full rounded-lg border border-stone-200 px-3 py-2 text-left text-sm text-[#333333] hover:bg-[#FFF8E1]">⏻ Logout</button>
            </div>
          </aside>

          <div className="p-4 sm:p-5 lg:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-100 bg-white p-3 shadow-sm">
              <div className="flex-1 min-w-72 max-w-130">
                <input
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-orange-300"
                  placeholder="Search user, phone, email, puja..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className="rounded-full border border-stone-200 bg-white px-2.5 py-2 text-xs text-stone-700">🔔</button>
                <div className="hidden sm:flex items-center gap-2 rounded-full border border-stone-200 bg-white px-2.5 py-1.5">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-orange-100 text-xs">👤</span>
                  <span className="text-xs text-stone-700">Lokanath Panda</span>
                </div>
                <div className="inline-flex rounded-lg border border-orange-200 bg-orange-50/60 p-1">
                  {[
                    { value: '7d', label: '7D' },
                    { value: '30d', label: '30D' },
                    { value: 'all', label: 'All' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setAnalyticsRange(option.value)}
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                        analyticsRange === option.value
                          ? 'bg-orange-700 text-white shadow-sm'
                          : 'text-stone-700 hover:bg-orange-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={refreshDashboard}
                  className="px-3 py-2 text-xs rounded-lg bg-orange-700 text-white hover:bg-orange-800 disabled:opacity-60"
                  disabled={refreshingDashboard}
                >
                  {refreshingDashboard ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/80 px-4 py-3 text-sm shadow-sm">
              <p className="text-orange-900">⚠️ {bookings.filter((booking) => normalizeBookingStatus(booking.bookingStatus) === 'pending').length} bookings are pending action. Review now.</p>
              <button type="button" className="rounded-md bg-orange-700 px-3 py-1.5 text-xs text-white">Review now</button>
            </div>

            <div className="mt-5 grid xl:grid-cols-[minmax(0,1fr)_320px] gap-4">
              <div ref={dashboardSectionRef}>
                <h1 className="text-4xl font-semibold text-stone-900">Welcome back, Lokanath Panda!</h1>
                <p className="mt-1 text-base text-stone-600">Here's an overview of your platform performance.</p>
                {lastUpdatedAt && <p className="mt-1 text-xs text-stone-500">Last updated: {lastUpdatedAt.toLocaleString()}</p>}

                <div className="mt-4 grid sm:grid-cols-3 gap-3">
                  <OverviewMetricCard
                    title="Total Bookings"
                    value={stats.totalBookings}
                    caption={<span className="text-emerald-700">Across all services</span>}
                  />
                  <OverviewMetricCard
                    title="Pending Bookings"
                    value={bookings.filter((booking) => normalizeBookingStatus(booking.bookingStatus) === 'pending').length}
                    caption={<span className="text-orange-800">From {analyticsRangeLabel}</span>}
                    className="rounded-xl border border-orange-100 bg-orange-50/65 p-4 shadow-sm"
                  />
                  <OverviewMetricCard
                    title="Total Revenue"
                    value={formatCurrency(stats.revenue)}
                    caption={<span className="text-stone-500">Paid transactions</span>}
                  />
                </div>

                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold text-stone-900">Revenue</h2>
                      <span className="text-xs text-stone-500">{analyticsRangeLabel}</span>
                    </div>
                    <p className="mt-2 text-4xl font-bold text-stone-900">{formatCurrency(stats.revenue)}</p>
                    <div className="mt-4 space-y-3">
                      {graphMetrics.map((metric) => (
                        <div key={metric.label}>
                          <div className="flex items-center justify-between text-xs text-stone-600">
                            <span>{metric.label}</span>
                            <span className="font-semibold text-stone-900">{metric.value}</span>
                          </div>
                          <div className="mt-1 h-2 rounded-full bg-stone-200">
                            <div className={`h-full rounded-full ${metric.tone}`} style={{ width: metric.width }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm">
                    <h2 className="text-2xl font-semibold text-stone-900">Booking Status</h2>
                    <div className="mt-4 flex items-center justify-center">
                      <div
                        className="relative grid h-40 w-40 place-items-center rounded-full"
                        style={{
                          background: `conic-gradient(#f59e0b ${completionRate}%, #e7e5e4 ${completionRate}% 100%)`,
                        }}
                      >
                        <div className="grid h-28 w-28 place-items-center rounded-full bg-white text-center">
                          <p className="text-3xl font-bold text-stone-900">{completionRate}%</p>
                          <p className="text-xs text-stone-500">Completed</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-1.5 text-xs text-stone-600">
                      <p>Pending: {bookings.filter((booking) => normalizeBookingStatus(booking.bookingStatus) === 'pending').length}</p>
                      <p>Confirmed: {bookings.filter((booking) => normalizeBookingStatus(booking.bookingStatus) === 'confirmed').length}</p>
                      <p>Completed: {bookings.filter((booking) => normalizeBookingStatus(booking.bookingStatus) === 'completed').length}</p>
                      <p>Cancelled: {bookings.filter((booking) => normalizeBookingStatus(booking.bookingStatus) === 'cancelled').length}</p>
                    </div>
                  </div>
                </div>

                <div ref={bookingsSectionRef} className="mt-4 rounded-xl border border-orange-100 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-2xl font-semibold text-stone-900">Manage Bookings</h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={exportBookingsCsv}
                        className="px-3 py-1.5 text-xs rounded bg-orange-700 text-white hover:bg-orange-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={filteredBookingsForExport.length === 0}
                      >
                        Export CSV ({filteredBookingsForExport.length})
                      </button>
                      <div className="inline-flex rounded-md border border-stone-300 bg-white p-0.5">
                        <button
                          type="button"
                          onClick={() => setRowDensity('comfortable')}
                          className={`px-2.5 py-1 text-xs rounded transition-colors ${
                            rowDensity === 'comfortable'
                              ? 'bg-stone-900 text-white'
                              : 'text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          Comfortable
                        </button>
                        <button
                          type="button"
                          onClick={() => setRowDensity('compact')}
                          className={`px-2.5 py-1 text-xs rounded transition-colors ${
                            rowDensity === 'compact'
                              ? 'bg-stone-900 text-white'
                              : 'text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          Compact
                        </button>
                      </div>
                      <select
                        className="border border-stone-300 rounded px-2 py-1.5 text-sm"
                        value={packageFilter}
                        onChange={(e) => setPackageFilter(e.target.value)}
                      >
                        <option value="all">All Packages</option>
                        {packageOptions.map((pkg) => (
                          <option key={pkg} value={pkg}>{pkg}</option>
                        ))}
                      </select>
                      <select
                        className="border border-stone-300 rounded px-2 py-1.5 text-sm"
                        value={bookingStatusFilter}
                        onChange={(e) => setBookingStatusFilter(e.target.value)}
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-stone-500">Showing {filteredBookings.length} of {bookings.length} bookings • Export uses {analyticsRangeLabel}</p>
                  {reviewRequestMessage && <p className="mt-2 text-sm text-stone-700">{reviewRequestMessage}</p>}
                  {panditMessageStatus && <p className="mt-1 text-sm text-stone-700">{panditMessageStatus}</p>}
                  <div className="mt-3 overflow-x-auto rounded-lg border border-stone-200 bg-white">
                    <table className={`w-full min-w-275 text-sm ${tableDensityClass}`}>
                      <thead className="bg-stone-100/90">
                        <tr className="text-left border-b border-stone-200">
                          <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-stone-700 sticky left-0 z-20 bg-stone-100/95 border-r border-stone-200 shadow-[6px_0_8px_-6px_rgba(0,0,0,0.2)] w-44 min-w-44">User</th>
                          <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-stone-700">Puja</th>
                          <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-stone-700">Package</th>
                          <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-stone-700">Add-ons</th>
                          <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-stone-700">Date</th>
                          <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-stone-700">Status</th>
                          <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-stone-700">Payment Status</th>
                          <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-stone-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map((booking) => (
                          <tr key={booking._id} className={`border-b border-stone-100 align-top odd:bg-white even:bg-stone-50/40 hover:bg-orange-50/40 transition-colors ${isPendingFollowUp(booking) ? 'ring-1 ring-amber-200 bg-amber-50/50' : ''}`}>
                            <td className="px-3 py-2.5 whitespace-nowrap sticky left-0 z-10 bg-inherit border-r border-stone-200 shadow-[6px_0_8px_-6px_rgba(0,0,0,0.18)] w-44 min-w-44">
                              <button
                                type="button"
                                onClick={() => openBookingDetails(booking)}
                                className="font-medium text-orange-700 hover:text-orange-800 hover:underline"
                              >
                                {booking.name}
                              </button>
                            </td>
                            <td className="px-3 py-2.5 text-stone-800 font-medium whitespace-nowrap">{booking.poojaId?.title}</td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span className="inline-block px-2 py-1 text-xs rounded bg-orange-100 text-orange-800">
                                {booking.package || 'Without Samagri'}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 min-w-47.5">
                              {Array.isArray(booking.selectedAddOns) && booking.selectedAddOns.length > 0 ? (
                                <div className="space-y-1">
                                  <span className="inline-block px-2 py-1 text-xs rounded border border-emerald-200 bg-emerald-50 text-emerald-700">
                                    Yes
                                  </span>
                                  <p className="text-xs text-stone-600 leading-relaxed">
                                    {booking.selectedAddOns.join(', ')}
                                  </p>
                                </div>
                              ) : (
                                <span className="inline-block px-2 py-1 text-xs rounded border border-stone-200 bg-stone-100 text-stone-700">
                                  No
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap text-stone-700 font-medium">{booking.date}</td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              {(() => {
                                const statusView = getBookingStatusView(booking.bookingStatus)
                                return (
                                  <span className={`inline-block px-2 py-1 text-xs rounded border ${statusView.badgeClass}`}>
                                    {statusView.label}
                                  </span>
                                )
                              })()}
                            </td>
                            <td className="px-3 py-2.5 min-w-47.5">
                              {(() => {
                                const paymentView = getPaymentStatusView(booking)
                                return (
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded border ${paymentView.badgeClass}`}>
                                    <span>{paymentView.icon}</span>
                                    <span>{paymentView.label}</span>
                                  </span>
                                )
                              })()}
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <div className="flex flex-wrap items-center gap-2">
                                <select
                                  className="border border-stone-300 rounded-md px-2.5 py-1.5 text-sm bg-white"
                                  value={normalizeBookingStatus(booking.bookingStatus)}
                                  onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                                <button
                                  onClick={() => copyPanditBookingMessage(booking)}
                                  className="px-2 py-1 text-xs rounded border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 disabled:opacity-60"
                                  disabled={Boolean(panditMessageLoadingById[booking._id])}
                                >
                                  {panditMessageLoadingById[booking._id] ? 'Preparing...' : 'Copy Pandit Msg'}
                                </button>
                                <button
                                  onClick={() => openPanditWhatsApp(booking)}
                                  className="px-2 py-1 text-xs rounded bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-60"
                                  disabled={Boolean(panditMessageLoadingById[booking._id])}
                                >
                                  {panditMessageLoadingById[booking._id] ? 'Preparing...' : 'Open WhatsApp'}
                                </button>
                                {normalizeBookingStatus(booking.bookingStatus) === 'completed' && (
                                  <button
                                    onClick={() => resendReviewRequest(booking._id)}
                                    className="px-2 py-1 text-xs rounded bg-stone-900 text-white disabled:opacity-60"
                                    disabled={Boolean(reviewRequestLoadingById[booking._id])}
                                  >
                                    {reviewRequestLoadingById[booking._id] ? 'Sending...' : 'Resend Review'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-4 grid lg:grid-cols-2 gap-4">
                  <div ref={servicesSectionRef} className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-stone-900">Recent Booking Requests</h2>
                      <button
                        onClick={refreshRecentBookings}
                        className="px-3 py-1.5 text-xs rounded bg-stone-900 text-white disabled:opacity-60"
                        disabled={refreshingRecent}
                      >
                        {refreshingRecent ? 'Refreshing...' : 'Refresh'}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-stone-500">Showing {filteredRecentBookings.length} of {recentBookings.length}</p>
                    <div className="mt-3 space-y-2 max-h-72 overflow-auto">
                      {filteredRecentBookings.map((booking) => (
                        <div key={booking._id} className="rounded-lg border border-stone-200 p-3 bg-stone-50/60">
                          <div className="flex items-center justify-between gap-2">
                            <button type="button" onClick={() => openBookingDetails(booking)} className="font-medium text-orange-700 hover:underline">
                              {booking.name}
                            </button>
                            <span className="text-xs text-stone-500">{new Date(booking.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-stone-700 mt-1">{booking.poojaId?.title}</p>
                          <p className="text-xs text-stone-500 mt-1">{booking.package || 'Without Samagri'} • {normalizeBookingStatus(booking.bookingStatus)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm">
                    <h2 className="text-xl font-semibold text-stone-900">Services</h2>
                    <form onSubmit={createPooja} className="mt-3 grid gap-2">
                      <input className="px-3 py-2 border rounded" placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                      <textarea className="px-3 py-2 border rounded" placeholder="Description" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                      <input className="px-3 py-2 border rounded" placeholder="Image URL" required value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                      <input className="px-3 py-2 border rounded" placeholder="Starting Price" type="number" required value={form.startPrice} onChange={(e) => setForm({ ...form, startPrice: e.target.value })} />
                      <button className="px-4 py-2 bg-orange-700 text-white rounded">Add Pooja</button>
                    </form>
                    <div className="mt-4 rounded-lg border border-dashed border-orange-200 bg-orange-50 p-3">
                      <p className="text-sm font-medium text-stone-800">Upload proof image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProofUpload}
                        className="mt-2 block w-full text-sm text-stone-700 file:mr-3 file:rounded file:border-0 file:bg-orange-700 file:px-3 file:py-2 file:text-white"
                      />
                      {proofUploadState.uploading && (
                        <p className="mt-2 text-xs text-orange-700">Uploading image...</p>
                      )}
                      {proofUploadState.message && (
                        <p className="mt-2 text-xs text-green-700">{proofUploadState.message}</p>
                      )}
                      {proofUploadState.error && (
                        <p className="mt-2 text-xs text-red-700">{proofUploadState.error}</p>
                      )}
                    </div>
                    <div className="mt-3 space-y-2 max-h-36 overflow-auto">
                      {poojas.map((pooja) => (
                        <div key={pooja._id} className="flex items-center justify-between rounded-lg border border-stone-200 p-2">
                          <p className="text-sm text-stone-800 truncate pr-2">{pooja.title}</p>
                          <button onClick={() => deletePooja(pooja._id)} className="rounded bg-red-600 px-2 py-1 text-xs text-white">Delete</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div ref={paymentsSectionRef} className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-2xl font-semibold text-stone-900">Payments</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500">View All</span>
                      <button
                        type="button"
                        onClick={exportPaymentsCsv}
                        className="px-3 py-1.5 text-xs rounded bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={filteredPaymentsForExport.length === 0}
                      >
                        Export CSV ({filteredPaymentsForExport.length})
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2 max-h-88 overflow-auto">
                    {filteredPaymentsForExport.map((payment) => (
                      <div key={payment._id} className="rounded-lg border border-stone-200 bg-stone-50/60 p-3 text-sm">
                        <p className="text-stone-700">Order: {payment.razorpayOrderId}</p>
                        <p className="mt-1 text-3xl font-semibold text-stone-900">₹{payment.amount}</p>
                        <p className="mt-1 inline-block rounded-md bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">{String(payment.status || 'pending')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div ref={enquiriesSectionRef} className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-2xl font-semibold text-stone-900">Enquiries</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500">View All</span>
                      <button
                        type="button"
                        onClick={exportEnquiriesCsv}
                        className="px-3 py-1.5 text-xs rounded bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={filteredEnquiriesForExport.length === 0}
                      >
                        Export CSV ({filteredEnquiriesForExport.length})
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2 max-h-88 overflow-auto">
                    {filteredEnquiriesForExport.map((item) => (
                      <div key={item._id} className="rounded-lg border border-stone-200 bg-stone-50/60 p-3 text-sm">
                        <p className="font-semibold text-stone-900">{item.name} ({item.phone})</p>
                        <p className="mt-1 text-stone-600">{item.email}</p>
                        <p className="mt-1 text-stone-700">{item.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-2xl font-semibold text-stone-900">Reviews</h2>
                    <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs text-orange-700">
                      {feedbacks.length} total
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-stone-500">Approve reviews to publish them. Rejected reviews stay hidden.</p>
                  {feedbackActionMessage && <p className="mt-2 text-xs text-stone-700">{feedbackActionMessage}</p>}
                  <div className="mt-3 space-y-2 max-h-88 overflow-auto">
                    {feedbacks.length === 0 ? (
                      <p className="text-sm text-stone-500">No reviews found.</p>
                    ) : (
                      feedbacks.map((feedback) => (
                        <div key={feedback._id} className="rounded-lg border border-stone-200 bg-stone-50/60 p-3 text-sm">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-semibold text-stone-900 truncate">{feedback.customerName || feedback.userId?.name || 'Verified Customer'}</p>
                              <p className="mt-0.5 text-xs text-stone-500 truncate">{feedback.poojaId?.title || 'Pooja Service'} • {feedback.bookingId?.date || 'N/A'}</p>
                              <p className="mt-1 text-xs text-stone-500">Rating: {Number(feedback.rating || 0)}/5 • {feedback.status || (feedback.isApproved ? 'approved' : 'pending')}</p>
                            </div>
                            <div className="flex flex-wrap justify-end gap-1">
                              {!feedback.isApproved && feedback.status !== 'rejected' && <button type="button" onClick={() => moderateFeedback(feedback._id, 'approve')} className="rounded bg-emerald-700 px-2 py-1.5 text-xs text-white">Approve</button>}
                              {feedback.isApproved && <button type="button" onClick={() => moderateFeedback(feedback._id, 'reject')} className="rounded bg-amber-600 px-2 py-1.5 text-xs text-white">Reject</button>}
                              <button type="button" onClick={() => deleteFeedback(feedback._id)} className="rounded bg-red-600 px-2 py-1.5 text-xs text-white hover:bg-red-700 disabled:opacity-60" disabled={Boolean(deletingFeedbackById[feedback._id])}>
                                {deletingFeedbackById[feedback._id] ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                          </div>
                          <p className="mt-2 text-stone-700">{feedback.comment || '-'}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div ref={settingsSectionRef} className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm">
                  <h2 className="text-2xl font-semibold text-stone-900">Twilio Test</h2>
                  <p className="mt-1 text-xs text-stone-500">Admin-only tool to test SMS and WhatsApp delivery (plain text or template).</p>
                  <form className="mt-3 space-y-2" onSubmit={runTwilioTest}>
                    <input
                      className="w-full rounded border border-stone-300 px-3 py-2 text-sm"
                      placeholder="Recipient (example: +919999999999 or whatsapp:+919999999999)"
                      value={twilioTestForm.to}
                      onChange={(e) => setTwilioTestForm((prev) => ({ ...prev, to: e.target.value }))}
                      disabled={twilioTesting}
                    />
                    <textarea
                      className="w-full rounded border border-stone-300 px-3 py-2 text-sm"
                      placeholder="Optional test message"
                      rows={3}
                      value={twilioTestForm.body}
                      onChange={(e) => setTwilioTestForm((prev) => ({ ...prev, body: e.target.value }))}
                      disabled={twilioTesting}
                    />
                    <input
                      className="w-full rounded border border-stone-300 px-3 py-2 text-sm"
                      placeholder="Optional Twilio Content SID (example: HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)"
                      value={twilioTestForm.contentSid}
                      onChange={(e) => setTwilioTestForm((prev) => ({ ...prev, contentSid: e.target.value }))}
                      disabled={twilioTesting}
                    />
                    <textarea
                      className="w-full rounded border border-stone-300 px-3 py-2 text-sm"
                      placeholder='Optional Content Variables JSON (example: {"1":"12/1","2":"3pm"})'
                      rows={2}
                      value={twilioTestForm.contentVariables}
                      onChange={(e) => setTwilioTestForm((prev) => ({ ...prev, contentVariables: e.target.value }))}
                      disabled={twilioTesting}
                    />
                    <button
                      type="submit"
                      className="rounded bg-orange-700 px-3 py-2 text-xs text-white hover:bg-orange-800 disabled:opacity-60"
                      disabled={twilioTesting}
                    >
                      {twilioTesting ? 'Testing...' : 'Run Twilio Test'}
                    </button>
                  </form>
                  {twilioTestError && <p className="mt-2 text-xs text-red-700">{twilioTestError}</p>}
                  {twilioTestResult && (
                    <div className="mt-3 rounded border border-stone-200 bg-stone-50 p-2 text-xs text-stone-700">
                      <p>SMS: {twilioTestResult.smsSent ? 'Sent' : 'Failed'}</p>
                      <p>WhatsApp: {twilioTestResult.whatsappSent ? 'Sent' : 'Failed'}</p>
                      <p>SMS To: {twilioTestResult.smsTo || '-'}</p>
                      <p>WhatsApp To: {twilioTestResult.whatsappTo || '-'}</p>
                      <p>Used Template SID: {twilioTestResult.usedContentSid || '-'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
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

