import { useEffect, useState } from 'react'
import api from '../services/api'

const statuses = ['All', 'Pending', 'Under Review', 'Approved', 'Rejected', 'Suspended']
const decisions = ['No issue found', 'Verified service issue', 'Other resolution']

function PanditManagementPanel() {
  const [status, setStatus] = useState('All')
  const [data, setData] = useState({ applications: [], stats: {} })
  const [active, setActive] = useState([])
  const [pujas, setPujas] = useState([])
  const [pujaAssignments, setPujaAssignments] = useState({})
  const [savingPujaAssignment, setSavingPujaAssignment] = useState('')
  const [bookings, setBookings] = useState([])
  const [complaints, setComplaints] = useState([])
  const [settings, setSettings] = useState(null)
  const [selected, setSelected] = useState(null)
  const [documentPreview, setDocumentPreview] = useState(null)
  const [message, setMessage] = useState('')

  const load = async () => {
    const [applications, pandits, pujaResponse, bookingResponse, complaintResponse, payoutSettings] = await Promise.all([
      api.get('/pandits/applications', { params: { status } }),
      api.get('/pandits/active'),
      api.get('/pandits/pujas'),
      api.get('/bookings/admin/all'),
      api.get('/pandits/complaints'),
      api.get('/pandits/payout-settings'),
    ])
    setData(applications.data)
    setActive(pandits.data)
    setPujas(pujaResponse.data)
    setPujaAssignments(Object.fromEntries(pandits.data.map((pandit) => [pandit._id, pandit.pujaIds || []])))
    setBookings(bookingResponse.data)
    setComplaints(complaintResponse.data)
    setSettings(payoutSettings.data)
  }

  useEffect(() => { load().catch((error) => setMessage(error.response?.data?.message || 'Unable to load Pandit management.')) }, [status])

  const action = async (id, type) => {
    const reason = type === 'approve' ? '' : window.prompt(`${type === 'reject' ? 'Rejection' : 'Suspension'} reason`)
    if (type !== 'approve' && !reason) return
    await api.patch(`/pandits/applications/${id}/${type}`, type === 'approve' ? {} : { reason })
    await load()
  }

  const assign = async (bookingId, panditId) => {
    if (!panditId) return
    await api.patch(`/pandits/bookings/${bookingId}/assign`, { panditId })
    await load()
    setMessage('Pandit assigned successfully.')
  }

  const updateBookingStatus = async (bookingId, bookingStatus) => {
    if (bookingStatus === 'cancelled' && !window.confirm('Cancel this assigned puja?')) return
    try {
      const response = await api.patch(`/bookings/${bookingId}/status`, { bookingStatus })
      setBookings((previous) => previous.map((booking) => booking._id === bookingId ? { ...booking, ...response.data } : booking))
      setMessage(`Booking ${bookingStatus.replace('-', ' ')} successfully.`)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update booking status.')
    }
  }

  const togglePujaAssignment = (panditId, pujaId) => {
    setPujaAssignments((previous) => {
      const current = previous[panditId] || []
      return { ...previous, [panditId]: current.includes(pujaId) ? current.filter((id) => id !== pujaId) : [...current, pujaId] }
    })
  }

  const savePujaAssignment = async (panditId) => {
    setSavingPujaAssignment(panditId)
    try {
      await api.patch(`/pandits/${panditId}/pujas`, { pujaIds: pujaAssignments[panditId] || [] })
      setMessage('Puja services assigned successfully.')
      await load()
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to assign puja services.')
    } finally {
      setSavingPujaAssignment('')
    }
  }

  const saveSettings = async () => {
    const response = await api.patch('/pandits/payout-settings', settings)
    setSettings(response.data)
    setMessage('Payout settings saved.')
  }

  const openPrivateDocument = async (applicationId, kind) => {
    try {
      const response = await api.get(`/pandits/applications/${applicationId}/files/${kind}`, { responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      setDocumentPreview({ url, contentType: response.data.type, title: `${kind} document` })
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to open private document.')
    }
  }

  const closeDocumentPreview = () => {
    if (documentPreview?.url) URL.revokeObjectURL(documentPreview.url)
    setDocumentPreview(null)
  }

  const resolveComplaint = async (complaintId, adminDecision) => {
    await api.patch(`/pandits/complaints/${complaintId}/resolve`, { adminDecision })
    await load()
    setMessage('Complaint resolved and the affected booking payout was updated.')
  }

  return <section className="mt-5 rounded-[22px] border border-[#f1d7a6] bg-[#fffdfb] p-4 shadow-[0_12px_24px_rgba(123,92,33,0.05)]">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#d66e1a]">Operations</p><h2 className="text-2xl font-semibold text-[#221d1a]">Pandit Management</h2></div><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm">{statuses.map((value) => <option key={value}>{value}</option>)}</select></div>
    {message && <p className="mt-3 rounded-lg bg-green-50 p-2 text-sm text-green-800">{message}</p>}
    <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">{statuses.map((value) => <div key={value} className="rounded-lg bg-orange-50 p-3"><p className="text-xs text-stone-600">{value}</p><p className="text-xl font-semibold">{value === 'All' ? data.stats.total || 0 : data.stats[value] || 0}</p></div>)}</div>
    <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="border-b border-stone-200 text-stone-500"><tr><th className="p-2">Name</th><th className="p-2">Mobile</th><th className="p-2">City</th><th className="p-2">Experience</th><th className="p-2">Pujas</th><th className="p-2">Languages</th><th className="p-2">Status</th><th className="p-2">Actions</th></tr></thead><tbody>{data.applications.map((application) => <tr key={application._id} className="border-b border-stone-100"><td className="p-2 font-medium"><button type="button" onClick={() => api.get(`/pandits/applications/${application._id}`).then((response) => setSelected(response.data))} className="text-left text-orange-700 underline-offset-2 hover:underline">{application.fullName}</button></td><td className="p-2">{application.mobileNumber}</td><td className="p-2">{application.city}</td><td className="p-2">{application.yearsOfExperience} years</td><td className="max-w-40 p-2">{application.pujaNames?.join(', ')}</td><td className="p-2">{application.languages?.join(', ')}</td><td className="p-2">{application.status}</td><td className="p-2"><div className="flex flex-wrap gap-1"><button onClick={() => api.get(`/pandits/applications/${application._id}`).then((response) => setSelected(response.data))} className="rounded bg-stone-100 px-2 py-1 text-xs">View</button>{['Pending', 'Under Review'].includes(application.status) && <><button onClick={() => action(application._id, 'approve')} className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">Approve</button><button onClick={() => action(application._id, 'reject')} className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">Reject</button></>}{application.status === 'Approved' && <button onClick={() => action(application._id, 'suspend')} className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-800">Suspend</button>}</div></td></tr>)}</tbody></table></div>
    <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-4"><div><h3 className="font-semibold text-stone-900">Assign puja services to approved Pandits</h3><p className="mt-1 text-sm text-stone-600">Choose which services each Pandit can receive and perform.</p></div><div className="mt-3 space-y-3">{active.length === 0 && <p className="text-sm text-stone-500">No approved Pandits available.</p>}{active.map((pandit) => <div key={pandit._id} className="rounded-lg border border-orange-200 bg-white p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-semibold">{pandit.name}</p><p className="text-xs text-stone-500">{pandit.email} · {pandit.pujaNames?.length || 0} services assigned</p></div><button type="button" onClick={() => savePujaAssignment(pandit._id)} disabled={savingPujaAssignment === pandit._id} className="rounded bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60">{savingPujaAssignment === pandit._id ? 'Saving...' : 'Save services'}</button></div><div className="mt-3 grid max-h-48 gap-1 overflow-y-auto rounded border border-stone-200 p-2 sm:grid-cols-2 lg:grid-cols-3">{pujas.map((puja) => <label key={puja._id} className="flex items-center gap-2 rounded px-2 py-1.5 text-xs text-stone-700 hover:bg-orange-50"><input type="checkbox" checked={(pujaAssignments[pandit._id] || []).includes(puja._id)} onChange={() => togglePujaAssignment(pandit._id, puja._id)} className="h-4 w-4 accent-orange-600" />{puja.title}</label>)}</div></div>)}</div></div>
    {selected && <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm"><div className="flex justify-between"><h3 className="font-semibold">Complete application details <span className="ml-2 rounded bg-orange-100 px-2 py-1 text-xs text-orange-800">{selected.applicationId}</span></h3><button onClick={() => setSelected(null)}>Close</button></div><div className="mt-3 grid gap-2 sm:grid-cols-2"><p><strong>Application number:</strong> {selected.applicationId}</p><p><strong>Name:</strong> {selected.fullName}</p><p><strong>Mobile:</strong> {selected.mobileNumber}</p><p><strong>WhatsApp:</strong> {selected.whatsappNumber || '-'}</p><p><strong>Email:</strong> {selected.email}</p><p><strong>City:</strong> {selected.city}</p><p><strong>Area:</strong> {selected.area}</p><p><strong>Experience:</strong> {selected.yearsOfExperience} years</p><p><strong>Specialization:</strong> {selected.specialization || '-'}</p><p><strong>Samagri:</strong> {selected.samagri}</p><p><strong>Travel distance:</strong> {selected.maxTravelDistance || 0} km</p><p><strong>Available days:</strong> {selected.availableDays?.join(', ') || '-'}</p><p><strong>Available time:</strong> {selected.availableTime || '-'}</p></div><p className="mt-2"><strong>Pujas:</strong> {selected.pujaNames?.join(', ') || '-'}</p><p className="mt-1"><strong>Languages:</strong> {selected.languages?.join(', ') || '-'}</p><p className="mt-1"><strong>Service areas:</strong> {selected.serviceAreas?.join(', ') || '-'}</p><p className="mt-1"><strong>Status:</strong> {selected.status}</p><p className="mt-1"><strong>Rules accepted:</strong> {new Date(selected.rulesAcceptedAt).toLocaleString()} · Version {selected.rulesVersion}</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => openPrivateDocument(selected._id, 'profile')} className="rounded bg-white px-2 py-1 text-xs">Open profile photo</button><button onClick={() => openPrivateDocument(selected._id, 'identity')} className="rounded bg-white px-2 py-1 text-xs">Open identity document</button>{selected.experienceDocumentPath && <button onClick={() => openPrivateDocument(selected._id, 'experience')} className="rounded bg-white px-2 py-1 text-xs">Open experience document</button>}</div></div>}
    <div className="mt-6 grid gap-4 lg:grid-cols-2"><div><h3 className="font-semibold">Assign approved Pandit</h3><div className="mt-2 space-y-2">{bookings.filter((booking) => ['pending', 'confirmed', 'pandit-assigned', 'accepted'].includes(booking.bookingStatus)).slice(0, 10).map((booking) => <div key={booking._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200 bg-white p-2 text-sm"><span>{booking.poojaId?.title || booking.package} · {booking.name}<br /><small className="text-stone-500">Status: {booking.bookingStatus}</small></span><div className="flex flex-wrap items-center gap-1"><select defaultValue={booking.panditId?._id || ''} onChange={(event) => assign(booking._id, event.target.value)} className="rounded border border-stone-300 px-2 py-1">
      <option value="">Select Pandit</option>
      {active.map((pandit) => (
        <option key={pandit._id} value={pandit._id}>{pandit.name}</option>
      ))}
    </select>{['pandit-assigned', 'accepted'].includes(booking.bookingStatus) && <><button type="button" onClick={() => updateBookingStatus(booking._id, 'completed')} className="rounded bg-green-700 px-2 py-1 text-xs font-semibold text-white">Complete</button><button type="button" onClick={() => updateBookingStatus(booking._id, 'cancelled')} className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white">Cancel</button></>}</div></div>)}</div></div>{settings && <div><h3 className="font-semibold">Payout settings (%)</h3><div className="mt-2 grid grid-cols-2 gap-2 text-sm">{Object.keys(settings).filter((key) => key.includes('Percentage')).map((key) => <label key={key} className="text-stone-600">{key}<input type="number" min="0" max="100" value={settings[key]} onChange={(event) => setSettings({ ...settings, [key]: Number(event.target.value) })} className="mt-1 w-full rounded border border-stone-300 px-2 py-1 text-stone-900" /></label>)}</div><button onClick={saveSettings} className="mt-3 rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white">Save payout settings</button></div>}</div>
    <div className="mt-6"><h3 className="font-semibold">Complaints and payout decisions</h3><div className="mt-2 space-y-2">{complaints.length === 0 && <p className="text-sm text-stone-500">No complaints submitted.</p>}{complaints.map((complaint) => <div key={complaint._id} className="rounded-lg border border-stone-200 bg-white p-3 text-sm"><p className="font-medium">{complaint.reason} · Booking {complaint.bookingId?._id || complaint.bookingId}</p><p className="mt-1 text-stone-600">{complaint.description}</p><p className="mt-1 text-xs text-stone-500">Status: {complaint.status} · Original Pandit payout: ₹{complaint.originalPayout || 0}</p>{complaint.status !== 'Resolved' && <div className="mt-2 flex flex-wrap gap-2">{decisions.map((decision) => <button key={decision} onClick={() => resolveComplaint(complaint._id, decision)} className="rounded bg-stone-800 px-2 py-1 text-xs font-semibold text-white">{decision}</button>)}</div>}{complaint.status === 'Resolved' && <p className="mt-1 text-green-700">Decision: {complaint.adminDecision} · Final Pandit payout: ₹{complaint.adjustedPayout || complaint.originalPayout || 0}</p>}</div>)}</div></div>
    {documentPreview && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"><div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-stone-200 px-4 py-3"><h3 className="font-semibold text-stone-900">{documentPreview.title}</h3><button type="button" onClick={closeDocumentPreview} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-700">Close</button></div><div className="min-h-[60vh] overflow-auto bg-stone-100 p-4">{documentPreview.contentType?.startsWith('image/') ? <img src={documentPreview.url} alt={documentPreview.title} className="mx-auto max-h-[76vh] max-w-full object-contain" /> : <iframe title={documentPreview.title} src={documentPreview.url} className="h-[76vh] w-full rounded-lg border border-stone-300 bg-white" />}</div></div></div>}
  </section>
}

export default PanditManagementPanel
