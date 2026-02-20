import { useEffect, useState } from 'react'
import Seo from '../components/Seo'
import api from '../services/api'

function AdminPage() {
  const [stats, setStats] = useState({ totalBookings: 0, revenue: 0, totalEnquiries: 0, totalPayments: 0 })
  const [poojas, setPoojas] = useState([])
  const [bookings, setBookings] = useState([])
  const [recentBookings, setRecentBookings] = useState([])
  const [enquiries, setEnquiries] = useState([])
  const [payments, setPayments] = useState([])
  const [refreshingRecent, setRefreshingRecent] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', image: '', startPrice: 0 })

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
  }

  useEffect(() => {
    loadData()
  }, [])

  const createPooja = async (event) => {
    event.preventDefault()
    await api.post('/poojas', {
      ...form,
      packages: [
        { name: 'Basic', price: Number(form.startPrice), includesSamagri: false },
        { name: 'Standard', price: Math.round(Number(form.startPrice) * 1.35), includesSamagri: true },
        { name: 'Premium', price: Math.round(Number(form.startPrice) * 1.8), includesSamagri: true },
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

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <Seo title="Admin Panel | Ama Puja" description="Manage poojas, bookings, enquiries, and payments." />
      <h1 className="text-3xl font-semibold">Admin Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded-xl border">Total Bookings: {stats.totalBookings}</div>
        <div className="bg-white p-4 rounded-xl border">Revenue: ₹{stats.revenue}</div>
        <div className="bg-white p-4 rounded-xl border">Enquiries: {stats.totalEnquiries}</div>
        <div className="bg-white p-4 rounded-xl border">Payments: {stats.totalPayments}</div>
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-4">
          <h2 className="font-semibold">Add Pooja</h2>
          <form onSubmit={createPooja} className="mt-3 grid gap-2">
            <input className="px-3 py-2 border rounded" placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea className="px-3 py-2 border rounded" placeholder="Description" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input className="px-3 py-2 border rounded" placeholder="Image URL" required value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            <input className="px-3 py-2 border rounded" placeholder="Starting Price" type="number" required value={form.startPrice} onChange={(e) => setForm({ ...form, startPrice: e.target.value })} />
            <button className="px-4 py-2 bg-orange-700 text-white rounded">Add Pooja</button>
          </form>
        </div>
        <div className="bg-white border rounded-xl p-4 max-h-72 overflow-auto">
          <h2 className="font-semibold">Manage Poojas</h2>
          <div className="mt-3 space-y-2">
            {poojas.map((pooja) => (
              <div key={pooja._id} className="flex justify-between items-center border rounded p-2">
                <span className="text-sm">{pooja.title}</span>
                <button onClick={() => deletePooja(pooja._id)} className="text-xs px-2 py-1 rounded bg-red-600 text-white">Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white border rounded-xl p-4 overflow-auto">
        <h2 className="font-semibold">Manage Bookings</h2>
        <table className="w-full mt-3 text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">User</th>
              <th>Puja</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id} className="border-b">
                <td className="py-2">{booking.name}</td>
                <td>{booking.poojaId?.title}</td>
                <td>{booking.date}</td>
                <td>{booking.bookingStatus}</td>
                <td>
                  <select
                    className="border rounded px-2 py-1"
                    value={booking.bookingStatus}
                    onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 bg-white border rounded-xl p-4 overflow-auto">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Recent Booking Requests (Last 10)</h2>
          <button
            onClick={refreshRecentBookings}
            className="px-3 py-1.5 text-xs rounded bg-stone-900 text-white disabled:opacity-60"
            disabled={refreshingRecent}
          >
            {refreshingRecent ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <table className="w-full mt-3 text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Created</th>
              <th>User</th>
              <th>Puja</th>
              <th>Package</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentBookings.map((booking) => (
              <tr key={booking._id} className="border-b">
                <td className="py-2">{new Date(booking.createdAt).toLocaleString()}</td>
                <td>{booking.name}</td>
                <td>{booking.poojaId?.title}</td>
                <td>{booking.package}</td>
                <td>{booking.bookingStatus}</td>
                <td>
                  {booking.bookingStatus === 'pending' && (
                    <button
                      onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                      className="px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
                    >
                      Confirm
                    </button>
                  )}
                  {booking.bookingStatus !== 'pending' && (
                    <span className="text-stone-400 text-xs">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-4">
          <h2 className="font-semibold">Enquiries</h2>
          <div className="mt-3 space-y-2 max-h-64 overflow-auto">
            {enquiries.map((item) => (
              <div key={item._id} className="border rounded p-2 text-sm">
                <p className="font-medium">{item.name} ({item.phone})</p>
                <p>{item.email}</p>
                <p className="text-stone-600">{item.message}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <h2 className="font-semibold">Payments</h2>
          <div className="mt-3 space-y-2 max-h-64 overflow-auto">
            {payments.map((payment) => (
              <div key={payment._id} className="border rounded p-2 text-sm">
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
