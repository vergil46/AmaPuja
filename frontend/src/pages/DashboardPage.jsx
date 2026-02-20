import { useEffect, useState } from 'react'
import Seo from '../components/Seo'
import api from '../services/api'

function DashboardPage() {
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    api.get('/bookings/my').then((res) => setBookings(res.data))
  }, [])

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <Seo title="Dashboard | Ama Puja" description="View your bookings and statuses on Ama Puja." />
      <h1 className="text-3xl font-semibold">My Dashboard</h1>
      <div className="mt-6 overflow-x-auto bg-white border border-stone-200 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-stone-100">
            <tr>
              <th className="p-3 text-left">Puja</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Package</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id} className="border-t border-stone-200">
                <td className="p-3">{booking.poojaId?.title}</td>
                <td className="p-3">{booking.date} {booking.time}</td>
                <td className="p-3">{booking.package}</td>
                <td className="p-3">{booking.paymentStatus}</td>
                <td className="p-3">{booking.bookingStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default DashboardPage
