import { useEffect, useMemo, useState } from 'react'
import Seo from '../components/Seo'
import api from '../services/api'

function AdminPage() {
  const [stats, setStats] = useState({ totalBookings: 0, revenue: 0, totalEnquiries: 0, totalPayments: 0 })
  const [poojas, setPoojas] = useState([])
  const [bookings, setBookings] = useState([])
  const [recentBookings, setRecentBookings] = useState([])
  const [enquiries, setEnquiries] = useState([])
  const [payments, setPayments] = useState([])
  const [refreshingDashboard, setRefreshingDashboard] = useState(false)
  const [refreshingRecent, setRefreshingRecent] = useState(false)
  const [packageFilter, setPackageFilter] = useState('all')
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all')
  const [bookingSearch, setBookingSearch] = useState('')
  const [recentPackageFilter, setRecentPackageFilter] = useState('all')
  const [recentStatusFilter, setRecentStatusFilter] = useState('all')
  const [reviewRequestLoadingById, setReviewRequestLoadingById] = useState({})
  const [reviewRequestMessage, setReviewRequestMessage] = useState('')
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null)
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null)
  const [detailsBookingStatus, setDetailsBookingStatus] = useState('pending')
  const [updatingDetailsStatus, setUpdatingDetailsStatus] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', image: '', startPrice: 0 })

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
      { label: 'Earning (₹)', value: Number(stats.revenue) || 0, tone: 'bg-orange-600' },
      { label: 'Work Done', value: workDone, tone: 'bg-green-600' },
      { label: 'Rejected', value: rejected, tone: 'bg-red-600' },
      { label: 'Pending', value: pending, tone: 'bg-amber-500' },
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

  const recentPackageOptions = useMemo(() => {
    const values = Array.from(
      new Set(
        recentBookings
          .map((booking) => String(booking.package || '').trim())
          .filter(Boolean)
      )
    )
    return values.sort((left, right) => left.localeCompare(right))
  }, [recentBookings])

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
    return recentBookings.filter((booking) => {
      const packageMatches = recentPackageFilter === 'all' || booking.package === recentPackageFilter
      const statusMatches =
        recentStatusFilter === 'all' ||
        normalizeBookingStatus(booking.bookingStatus) === recentStatusFilter

      return packageMatches && statusMatches
    })
  }, [recentBookings, recentPackageFilter, recentStatusFilter])

  const loadData = async () => {
    const [statsRes, poojaRes, bookingRes, recentBookingRes, enquiryRes, paymentRes] = await Promise.all([
      api.get('/dashboard/admin/stats'),
      api.get('/poojas'),
      api.get('/bookings/admin/all'),
      api.get('/bookings/admin/recent?limit=10'),
      api.get('/enquiries'),
      api.get('/payments/admin/all'),
    ])
    setStats(statsRes.data)
    setPoojas(poojaRes.data)
    setBookings(bookingRes.data)
    setRecentBookings(recentBookingRes.data)
    setEnquiries(enquiryRes.data)
    setPayments(paymentRes.data)
    setLastUpdatedAt(new Date())
  }

  const refreshDashboard = async () => {
    setRefreshingDashboard(true)
    try {
      await loadData()
    } finally {
      setRefreshingDashboard(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

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

  const formatCurrency = (value) => `₹ ${Number(value || 0).toLocaleString('en-IN')}`

  const getPaymentTypeLabel = (paymentOption) => {
    if (paymentOption === 'advance') return '30% Advance'
    if (paymentOption === 'full') return 'Full Payment'
    if (paymentOption === 'pay-after-pooja') return 'Pay After Pooja'
    return 'N/A'
  }

  const getPaymentStatusView = (booking) => {
    const normalizedStatus = String(booking.paymentStatus || '').toLowerCase()
    const isPaid = normalizedStatus === 'paid'

    if (isPaid) {
      return {
        label: 'Paid',
        icon: '✅',
        badgeClass: 'bg-green-100 text-green-800 border-green-200',
      }
    }

    return {
      label: 'Pending',
      icon: '❌',
      badgeClass: 'bg-red-100 text-red-700 border-red-200',
    }
  }

  const getBookingStatusView = (bookingStatus) => {
    const normalizedStatus = String(bookingStatus || '').toLowerCase()

    if (normalizedStatus === 'completed') {
      return {
        label: 'Completed',
        badgeClass: 'bg-green-100 text-green-800 border-green-200',
      }
    }

    if (normalizedStatus === 'confirmed') {
      return {
        label: 'Confirmed',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      }
    }

    if (normalizedStatus === 'cancelled') {
      return {
        label: 'Cancelled',
        badgeClass: 'bg-red-100 text-red-700 border-red-200',
      }
    }

    return {
      label: 'Pending',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    }
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

  const completionRate = stats.totalBookings
    ? Math.round((bookings.filter((booking) => normalizeBookingStatus(booking.bookingStatus) === 'completed').length / stats.totalBookings) * 100)
    : 0

  const paidBookingRate = bookings.length
    ? Math.round((bookings.filter((booking) => String(booking.paymentStatus || '').toLowerCase() === 'paid').length / bookings.length) * 100)
    : 0

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <Seo title="Admin Panel | PujaSamrddhi" description="Manage poojas, bookings, enquiries, and payments." />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-stone-900">Admin Dashboard</h1>
          <p className="text-sm text-stone-600 mt-1">Live control center for bookings, services, enquiries and payments.</p>
        </div>
        <button
          onClick={refreshDashboard}
          className="px-3.5 py-2 text-sm rounded-lg bg-orange-700 text-white hover:bg-orange-800 disabled:opacity-60 shadow-sm"
          disabled={refreshingDashboard}
        >
          {refreshingDashboard ? 'Refreshing Dashboard...' : 'Refresh Dashboard'}
        </button>
      </div>
      {lastUpdatedAt && (
        <p className="mt-2 text-xs text-stone-500">Last updated: {lastUpdatedAt.toLocaleString()}</p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-stone-500">Total Bookings</p>
          <p className="text-2xl font-bold text-stone-900 mt-1">{stats.totalBookings}</p>
          <p className="text-xs text-stone-500 mt-1">Across all services</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-stone-500">Revenue</p>
          <p className="text-2xl font-bold text-stone-900 mt-1">{formatCurrency(stats.revenue)}</p>
          <p className="text-xs text-stone-500 mt-1">Paid transactions</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-stone-500">Completion Rate</p>
          <p className="text-2xl font-bold text-stone-900 mt-1">{completionRate}%</p>
          <p className="text-xs text-stone-500 mt-1">Completed bookings ratio</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-stone-500">Payment Success</p>
          <p className="text-2xl font-bold text-stone-900 mt-1">{paidBookingRate}%</p>
          <p className="text-xs text-stone-500 mt-1">Bookings marked paid</p>
        </div>
      </div>

      <div className="mt-8 bg-white border border-orange-100 rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-stone-900">Performance Graph</h2>
        <div className="mt-4 space-y-4">
          {graphMetrics.map((metric) => (
            <div key={metric.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-700">{metric.label}</span>
                <span className="font-semibold text-stone-900">{metric.value}</span>
              </div>
              <div className="mt-1 h-2.5 rounded-full bg-stone-200 overflow-hidden">
                <div className={`h-full rounded-full ${metric.tone}`} style={{ width: metric.width }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-stone-900">Add Pooja</h2>
          <form onSubmit={createPooja} className="mt-3 grid gap-2">
            <input className="px-3 py-2 border rounded" placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea className="px-3 py-2 border rounded" placeholder="Description" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input className="px-3 py-2 border rounded" placeholder="Image URL" required value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            <input className="px-3 py-2 border rounded" placeholder="Starting Price" type="number" required value={form.startPrice} onChange={(e) => setForm({ ...form, startPrice: e.target.value })} />
            <button className="px-4 py-2 bg-orange-700 text-white rounded">Add Pooja</button>
          </form>
        </div>
        <div className="bg-white border border-orange-100 rounded-2xl p-5 max-h-72 overflow-auto shadow-sm">
          <h2 className="font-semibold text-stone-900">Manage Poojas</h2>
          <div className="mt-3 space-y-2">
            {poojas.map((pooja) => (
              <div key={pooja._id} className="flex justify-between items-center border border-stone-200 rounded-lg p-2.5">
                <span className="text-sm">{pooja.title}</span>
                <button onClick={() => deletePooja(pooja._id)} className="text-xs px-2 py-1 rounded bg-red-600 text-white">Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white border border-orange-100 rounded-2xl p-5 overflow-x-auto shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-stone-900">Manage Bookings</h2>
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="border border-stone-300 rounded px-3 py-1.5 text-sm min-w-56"
              placeholder="Search user, phone, email, puja"
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
            />
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
        <p className="mt-2 text-xs text-stone-500">Showing {filteredBookings.length} of {bookings.length} bookings</p>
        {reviewRequestMessage && <p className="mt-2 text-sm text-stone-700">{reviewRequestMessage}</p>}
        <table className="w-full min-w-240 mt-3 text-sm">
          <thead className="bg-stone-50">
            <tr className="text-left border-b border-stone-200">
              <th className="py-2">User</th>
              <th>Puja</th>
              <th>Package Type</th>
              <th>Add-ons</th>
              <th>Date</th>
              <th>Status</th>
              <th>Payment Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking._id} className="border-b border-stone-100 align-top hover:bg-orange-50/30 transition-colors">
                <td className="py-2">
                  <button
                    type="button"
                    onClick={() => openBookingDetails(booking)}
                    className="text-left text-orange-700 font-medium hover:text-orange-800 hover:underline"
                  >
                    {booking.name}
                  </button>
                </td>
                <td>{booking.poojaId?.title}</td>
                <td>
                  <span className="inline-block px-2 py-1 text-xs rounded bg-orange-100 text-orange-800">
                    {booking.package || 'Without Samagri'}
                  </span>
                </td>
                <td>
                  {Array.isArray(booking.selectedAddOns) && booking.selectedAddOns.length > 0 ? (
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-1 text-xs rounded border border-emerald-200 bg-emerald-50 text-emerald-700">
                        Add-ons: Yes
                      </span>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {booking.selectedAddOns.join(', ')}
                      </p>
                    </div>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs rounded border border-stone-200 bg-stone-100 text-stone-700">
                      Add-ons: No
                    </span>
                  )}
                </td>
                <td>{booking.date}</td>
                <td>
                  {(() => {
                    const statusView = getBookingStatusView(booking.bookingStatus)
                    return (
                      <span className={`inline-block px-2 py-1 text-xs rounded border ${statusView.badgeClass}`}>
                        {statusView.label}
                      </span>
                    )
                  })()}
                </td>
                <td>
                  {(() => {
                    const paymentView = getPaymentStatusView(booking)
                    const isPaid = paymentView.label === 'Paid'

                    return (
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded border ${paymentView.badgeClass}`}>
                          <span>{paymentView.icon}</span>
                          <span>{paymentView.label}</span>
                        </span>
                        {isPaid && (
                          <>
                            <p className="text-xs text-stone-700">
                              Type: <span className="font-medium">{getPaymentTypeLabel(booking.paymentOption)}</span>
                            </p>
                            <p className="text-xs text-stone-700">
                              Amount Paid: <span className="font-medium">{formatCurrency(booking.paymentAmount)}</span>
                              <span className="text-stone-500"> ({getPaymentTypeLabel(booking.paymentOption)})</span>
                            </p>
                          </>
                        )}
                      </div>
                    )
                  })()}
                </td>
                <td>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="border rounded px-2 py-1"
                      value={normalizeBookingStatus(booking.bookingStatus)}
                      onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
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

      <div className="mt-8 bg-white border border-orange-100 rounded-2xl p-5 overflow-x-auto shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-stone-900">Recent Booking Requests (Last 10)</h2>
          <div className="flex items-center gap-2">
            <select
              className="border border-stone-300 rounded px-2 py-1.5 text-sm"
              value={recentPackageFilter}
              onChange={(e) => setRecentPackageFilter(e.target.value)}
            >
              <option value="all">All Packages</option>
              {recentPackageOptions.map((pkg) => (
                <option key={pkg} value={pkg}>{pkg}</option>
              ))}
            </select>
            <select
              className="border border-stone-300 rounded px-2 py-1.5 text-sm"
              value={recentStatusFilter}
              onChange={(e) => setRecentStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={refreshRecentBookings}
              className="px-3 py-1.5 text-xs rounded bg-stone-900 text-white disabled:opacity-60"
              disabled={refreshingRecent}
            >
              {refreshingRecent ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-stone-500">Showing {filteredRecentBookings.length} of {recentBookings.length} recent bookings</p>
        <table className="w-full min-w-260 mt-3 text-sm">
          <thead className="bg-stone-50">
            <tr className="text-left border-b border-stone-200">
              <th className="py-2">Created</th>
              <th>User</th>
              <th>Puja</th>
              <th>Package</th>
              <th>Add-ons</th>
              <th>Status</th>
              <th>Payment Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecentBookings.map((booking) => (
              <tr key={booking._id} className="border-b border-stone-100 align-top hover:bg-orange-50/30 transition-colors">
                <td className="py-2">{new Date(booking.createdAt).toLocaleString()}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => openBookingDetails(booking)}
                    className="text-left text-orange-700 font-medium hover:text-orange-800 hover:underline"
                  >
                    {booking.name}
                  </button>
                </td>
                <td>{booking.poojaId?.title}</td>
                <td>{booking.package}</td>
                <td>
                  {Array.isArray(booking.selectedAddOns) && booking.selectedAddOns.length > 0 ? (
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-1 text-xs rounded border border-emerald-200 bg-emerald-50 text-emerald-700">
                        Add-ons: Yes
                      </span>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {booking.selectedAddOns.join(', ')}
                      </p>
                    </div>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs rounded border border-stone-200 bg-stone-100 text-stone-700">
                      Add-ons: No
                    </span>
                  )}
                </td>
                <td>
                  {(() => {
                    const statusView = getBookingStatusView(booking.bookingStatus)
                    return (
                      <span className={`inline-block px-2 py-1 text-xs rounded border ${statusView.badgeClass}`}>
                        {statusView.label}
                      </span>
                    )
                  })()}
                </td>
                <td>
                  {(() => {
                    const paymentView = getPaymentStatusView(booking)
                    const isPaid = paymentView.label === 'Paid'

                    return (
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded border ${paymentView.badgeClass}`}>
                          <span>{paymentView.icon}</span>
                          <span>{paymentView.label}</span>
                        </span>
                        {isPaid && (
                          <>
                            <p className="text-xs text-stone-700">
                              Type: <span className="font-medium">{getPaymentTypeLabel(booking.paymentOption)}</span>
                            </p>
                            <p className="text-xs text-stone-700">
                              Amount Paid: <span className="font-medium">{formatCurrency(booking.paymentAmount)}</span>
                              <span className="text-stone-500"> ({getPaymentTypeLabel(booking.paymentOption)})</span>
                            </p>
                          </>
                        )}
                      </div>
                    )
                  })()}
                </td>
                <td>
                  {normalizeBookingStatus(booking.bookingStatus) === 'pending' && (
                    <button
                      onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                      className="px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
                    >
                      Confirm
                    </button>
                  )}
                  {normalizeBookingStatus(booking.bookingStatus) === 'completed' && (
                    <button
                      onClick={() => resendReviewRequest(booking._id)}
                      className="px-2 py-1 text-xs rounded bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-60"
                      disabled={Boolean(reviewRequestLoadingById[booking._id])}
                    >
                      {reviewRequestLoadingById[booking._id] ? 'Sending...' : 'Resend Review'}
                    </button>
                  )}
                  {normalizeBookingStatus(booking.bookingStatus) !== 'pending' && (
                    normalizeBookingStatus(booking.bookingStatus) !== 'completed' ? <span className="text-stone-400 text-xs">-</span> : null
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedBookingDetails && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-white rounded-2xl border border-orange-100 shadow-xl">
            <div className="sticky top-0 bg-white border-b border-stone-200 px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-stone-900">Booking Details</h3>
                <p className="text-xs text-stone-500 mt-1">Booking ID: {selectedBookingDetails._id}</p>
              </div>
              <button
                type="button"
                onClick={closeBookingDetails}
                className="px-3 py-1.5 text-sm rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50"
              >
                Close
              </button>
            </div>

            <div className="px-5 py-4 space-y-5 text-sm">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-stone-200 p-3">
                  <p className="text-xs text-stone-500">User Name</p>
                  <p className="font-medium text-stone-900 mt-1">{selectedBookingDetails.name || '-'}</p>
                </div>
                <div className="rounded-lg border border-stone-200 p-3">
                  <p className="text-xs text-stone-500">Puja</p>
                  <p className="font-medium text-stone-900 mt-1">{selectedBookingDetails.poojaId?.title || '-'}</p>
                </div>
                <div className="rounded-lg border border-stone-200 p-3">
                  <p className="text-xs text-stone-500">Phone</p>
                  <p className="font-medium text-stone-900 mt-1">{selectedBookingDetails.phone || '-'}</p>
                </div>
                <div className="rounded-lg border border-stone-200 p-3">
                  <p className="text-xs text-stone-500">Email</p>
                  <p className="font-medium text-stone-900 mt-1 break-all">{selectedBookingDetails.email || '-'}</p>
                </div>
                <div className="rounded-lg border border-stone-200 p-3">
                  <p className="text-xs text-stone-500">City</p>
                  <p className="font-medium text-stone-900 mt-1">{selectedBookingDetails.city || '-'}</p>
                </div>
                <div className="rounded-lg border border-stone-200 p-3">
                  <p className="text-xs text-stone-500">Priest Preference</p>
                  <p className="font-medium text-stone-900 mt-1">{selectedBookingDetails.priestPreference || '-'}</p>
                </div>
              </div>

              <div className="rounded-lg border border-stone-200 p-3">
                <p className="text-xs text-stone-500">Address</p>
                <p className="font-medium text-stone-900 mt-1">{selectedBookingDetails.address || '-'}</p>
              </div>

              <div className="rounded-lg border border-stone-200 p-3">
                <p className="text-xs text-stone-500">Location Details</p>
                <div className="mt-2 grid sm:grid-cols-2 gap-2 text-sm text-stone-800">
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
                    className="inline-block mt-3 text-sm font-medium text-orange-700 hover:text-orange-800 hover:underline"
                  >
                    View on Google Maps
                  </a>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-stone-200 p-3">
                  <p className="text-xs text-stone-500">Date</p>
                  <p className="font-medium text-stone-900 mt-1">{selectedBookingDetails.date || '-'}</p>
                </div>
                <div className="rounded-lg border border-stone-200 p-3">
                  <p className="text-xs text-stone-500">Time</p>
                  <p className="font-medium text-stone-900 mt-1">{selectedBookingDetails.time || '-'}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-stone-200 p-3">
                  <p className="text-xs text-stone-500">Package</p>
                  <p className="font-medium text-stone-900 mt-1">{selectedBookingDetails.package || '-'}</p>
                </div>
                <div className="rounded-lg border border-stone-200 p-3">
                  <p className="text-xs text-stone-500">Payment Type</p>
                  <p className="font-medium text-stone-900 mt-1">{getPaymentTypeLabel(selectedBookingDetails.paymentOption)}</p>
                </div>
                <div className="rounded-lg border border-stone-200 p-3">
                  <p className="text-xs text-stone-500">Final Amount</p>
                  <p className="font-medium text-stone-900 mt-1">{formatCurrency(selectedBookingDetails.finalAmount)}</p>
                </div>
                <div className="rounded-lg border border-stone-200 p-3">
                  <p className="text-xs text-stone-500">Paid Amount</p>
                  <p className="font-medium text-stone-900 mt-1">{formatCurrency(selectedBookingDetails.paymentAmount)}</p>
                </div>
              </div>

              <div className="rounded-lg border border-stone-200 p-3">
                <p className="text-xs text-stone-500">Selected Add-ons</p>
                {Array.isArray(selectedBookingDetails.selectedAddOns) && selectedBookingDetails.selectedAddOns.length > 0 ? (
                  <ul className="mt-2 list-disc list-inside text-stone-800 space-y-1">
                    {selectedBookingDetails.selectedAddOns.map((addon) => (
                      <li key={addon}>{addon}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-medium text-stone-900 mt-1">No add-ons selected</p>
                )}
              </div>

              <div className="rounded-lg border border-stone-200 p-3">
                <p className="text-xs text-stone-500">Special Notes</p>
                <p className="font-medium text-stone-900 mt-1">{selectedBookingDetails.specialNotes || '-'}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-stone-200 p-3">
                  <p className="text-xs text-stone-500">Booking Status</p>
                  <p className="font-medium text-stone-900 mt-1">{getBookingStatusView(selectedBookingDetails.bookingStatus).label}</p>
                </div>
                <div className="rounded-lg border border-stone-200 p-3">
                  <p className="text-xs text-stone-500">Payment Status</p>
                  <p className="font-medium text-stone-900 mt-1">{getPaymentStatusView(selectedBookingDetails).label}</p>
                </div>
                <div className="rounded-lg border border-stone-200 p-3 sm:col-span-2">
                  <p className="text-xs text-stone-500">Created At</p>
                  <p className="font-medium text-stone-900 mt-1">{formatDateTime(selectedBookingDetails.createdAt)}</p>
                </div>
              </div>

              <div className="rounded-lg border border-orange-100 bg-orange-50/40 p-3">
                <p className="text-xs text-stone-500">Update Booking Status</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <select
                    className="border border-stone-300 rounded px-2 py-1.5 text-sm"
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
                    className="px-3 py-1.5 text-sm rounded-lg bg-orange-700 text-white hover:bg-orange-800 disabled:opacity-60"
                  >
                    {updatingDetailsStatus ? 'Saving...' : 'Save Status'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-stone-900">Enquiries</h2>
          <div className="mt-3 space-y-2 max-h-64 overflow-auto">
            {enquiries.map((item) => (
              <div key={item._id} className="border border-stone-200 rounded-lg p-2.5 text-sm bg-stone-50/60">
                <p className="font-medium">{item.name} ({item.phone})</p>
                <p>{item.email}</p>
                <p className="text-stone-600">{item.message}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-stone-900">Payments</h2>
          <div className="mt-3 space-y-2 max-h-64 overflow-auto">
            {payments.map((payment) => (
              <div key={payment._id} className="border border-stone-200 rounded-lg p-2.5 text-sm bg-stone-50/60">
                <p>Order: {payment.razorpayOrderId}</p>
                <p>Amount: ₹{payment.amount}</p>
                <p>Status: {payment.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminPage
