import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Seo from '../components/Seo'
import { useAuth } from '../context/useAuth'
import api from '../services/api'

const currency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

function PanditDashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState({ bookings: [], application: null })
  const [profile, setProfile] = useState({ serviceAreas: '', availableDays: '', availableTime: '' })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loadingId, setLoadingId] = useState('')

  const load = () => api.get('/pandits/dashboard').then(({ data: nextData }) => {
    setData(nextData)
    setProfile({
      serviceAreas: nextData.application?.profile?.serviceAreas?.join(', ') || nextData.application?.serviceAreas?.join(', ') || '',
      availableDays: nextData.application?.profile?.availableDays?.join(', ') || nextData.application?.availableDays?.join(', ') || '',
      availableTime: nextData.application?.profile?.availableTime || nextData.application?.availableTime || '',
    })
  }).catch((error) => setMessage({ type: 'error', text: error.response?.data?.message || 'Unable to load dashboard.' }))

  useEffect(() => { if (user?.role === 'pandit') load() }, [user?.role])

  const earnings = useMemo(() => data.bookings.reduce((result, booking) => ({
    bookingAmount: result.bookingAmount + Number(booking.finalAmount || 0),
    panditEarnings: result.panditEarnings + Number(booking.payout?.finalPanditAmount || 0),
    paidAmount: result.paidAmount + Number(booking.payout?.paidAmount || 0),
  }), { bookingAmount: 0, panditEarnings: 0, paidAmount: 0 }), [data.bookings])

  const bookingAction = async (bookingId, action) => {
    setLoadingId(bookingId); setMessage({ type: '', text: '' })
    try { await api.patch(`/pandits/bookings/${bookingId}/${action}`); await load(); setMessage({ type: 'success', text: `Booking ${action === 'accept' ? 'accepted' : 'marked completed'}.` }) }
    catch (error) { setMessage({ type: 'error', text: error.response?.data?.message || 'Unable to update booking.' }) }
    finally { setLoadingId('') }
  }

  const saveProfile = async (event) => {
    event.preventDefault(); setMessage({ type: '', text: '' })
    try { await api.patch('/pandits/profile', { serviceAreas: profile.serviceAreas, availableDays: profile.availableDays, availableTime: profile.availableTime }); setMessage({ type: 'success', text: 'Availability saved for admin review.' }) }
    catch (error) { setMessage({ type: 'error', text: error.response?.data?.message || 'Unable to save availability.' }) }
  }

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'pandit') return <Navigate to="/dashboard" replace />

  return <section className="mx-auto max-w-6xl px-4 py-8"><Seo title="Pandit Dashboard | Puja Samriddhi" description="Private Pandit dashboard." /><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Private workspace</p><h1 className="mt-1 text-3xl font-semibold text-stone-900">Pandit dashboard</h1></div><span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">{user.panditStatus}</span></div>{message.text && <p className={`mt-4 rounded-xl p-3 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{message.text}</p>}
  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-2xl border border-orange-100 bg-white p-5"><p className="text-sm text-stone-500">Assigned bookings</p><p className="mt-1 text-3xl font-semibold">{data.bookings.length}</p></div><div className="rounded-2xl border border-orange-100 bg-white p-5"><p className="text-sm text-stone-500">Booking amount</p><p className="mt-1 text-3xl font-semibold">{currency(earnings.bookingAmount)}</p></div><div className="rounded-2xl border border-orange-100 bg-white p-5"><p className="text-sm text-stone-500">Pandit earnings</p><p className="mt-1 text-3xl font-semibold">{currency(earnings.panditEarnings)}</p></div><div className="rounded-2xl border border-orange-100 bg-white p-5"><p className="text-sm text-stone-500">Pending amount</p><p className="mt-1 text-3xl font-semibold">{currency(earnings.panditEarnings - earnings.paidAmount)}</p></div></div>
  <div className="mt-6 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm"><h2 className="text-xl font-semibold">My bookings</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-stone-200 text-stone-500"><tr><th className="p-2">Booking ID</th><th className="p-2">Puja</th><th className="p-2">Date / time</th><th className="p-2">Customer</th><th className="p-2">Location</th><th className="p-2">Amount / share</th><th className="p-2">Status</th><th className="p-2">Action</th></tr></thead><tbody>{data.bookings.map((booking) => <tr key={booking._id} className="border-b border-stone-100 align-top"><td className="p-2">{booking._id}</td><td className="p-2">{booking.poojaId?.title || booking.package}</td><td className="p-2">{booking.date}<br />{booking.time}</td><td className="p-2">{booking.name}<br />{booking.phone}</td><td className="max-w-48 p-2">{booking.address}</td><td className="p-2">{currency(booking.finalAmount)}<br />{currency(booking.payout?.finalPanditAmount)}</td><td className="p-2 font-medium">{booking.bookingStatus}</td><td className="p-2">{booking.bookingStatus === 'pandit-assigned' && <button disabled={loadingId === booking._id} onClick={() => bookingAction(booking._id, 'accept')} className="rounded bg-orange-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-60">Accept</button>}{['accepted', 'pandit-assigned'].includes(booking.bookingStatus) && <button disabled={loadingId === booking._id} onClick={() => bookingAction(booking._id, 'complete')} className="ml-1 rounded bg-green-700 px-2 py-1 text-xs font-semibold text-white disabled:opacity-60">Complete</button>}</td></tr>)}</tbody></table>{data.bookings.length === 0 && <p className="py-8 text-center text-sm text-stone-500">No assigned bookings yet.</p>}</div></div>
  <div className="mt-6 grid gap-6 lg:grid-cols-2"><form onSubmit={saveProfile} className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm"><h2 className="text-xl font-semibold">My availability</h2><label className="mt-4 block text-sm font-medium text-stone-700">Service areas<input value={profile.serviceAreas} onChange={(event) => setProfile({ ...profile, serviceAreas: event.target.value })} className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5" /></label><label className="mt-3 block text-sm font-medium text-stone-700">Available days<input value={profile.availableDays} onChange={(event) => setProfile({ ...profile, availableDays: event.target.value })} className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5" /></label><label className="mt-3 block text-sm font-medium text-stone-700">Available times<input value={profile.availableTime} onChange={(event) => setProfile({ ...profile, availableTime: event.target.value })} className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5" /></label><button className="mt-4 rounded-xl bg-orange-600 px-4 py-2 font-semibold text-white" type="submit">Save availability</button></form><div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm"><h2 className="text-xl font-semibold">My information</h2><p className="mt-3 text-sm text-stone-600">{data.application?.city}, {data.application?.area} · {data.application?.yearsOfExperience} years experience</p><p className="mt-1 text-sm text-stone-600">Languages: {data.application?.languages?.join(', ') || '-'}</p><p className="mt-1 text-sm text-stone-600">Specialization: {data.application?.specialization || '-'}</p><p className="mt-4 text-xs text-stone-500">Identity and verification information can only be changed after admin approval.</p></div></div>
  </section>
}

export default PanditDashboardPage
