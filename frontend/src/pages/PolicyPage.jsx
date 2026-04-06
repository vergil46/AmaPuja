import Seo from '../components/Seo'

const SectionIconWrap = ({ children }) => (
  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-300 bg-stone-100 text-stone-700" aria-hidden="true">
    {children}
  </span>
)

const ClipboardIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="4.75" width="12" height="16.5" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <rect x="9" y="2.75" width="6" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.8" />
    <path d="M9 10H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M9 13.5H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const RefreshIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 7V11H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 17V13H8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.56 9.52C7.44 7.46 9.49 6 11.87 6C13.85 6 15.6 7 16.63 8.52" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M17.44 14.48C16.56 16.54 14.51 18 12.13 18C10.15 18 8.4 17 7.37 15.48" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const PhoneIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 4.75H8.3C8.78 4.75 9.19 5.09 9.28 5.56L9.88 8.7C9.96 9.14 9.8 9.58 9.46 9.86L7.93 11.13C9.2 13.93 11.44 16.17 14.24 17.44L15.51 15.91C15.79 15.57 16.23 15.41 16.67 15.49L19.81 16.09C20.28 16.18 20.62 16.59 20.62 17.07V20.37C20.62 20.86 20.23 21.25 19.74 21.25H18.5C10.49 21.25 3.99 14.75 3.99 6.74V5.5C3.99 5.01 4.38 4.62 4.87 4.62H5V4.75Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const BanIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M8.5 15.5L15.5 8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const BuildingIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.75 20H19.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <rect x="6.5" y="5" width="11" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M9.5 8.5H10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M13.5 8.5H14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M9.5 12H10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M13.5 12H14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const LifebuoyIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M9.5 9.5L6.5 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M14.5 9.5L17.5 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M9.5 14.5L6.5 17.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M14.5 14.5L17.5 17.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const ClockIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 7.5V12L15.5 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const PolicySection = ({ title, content, icon }) => (
  <div className="mb-8">
    <div className="flex items-center gap-3 mb-4">
      {icon}
      <h3 className="text-xl font-semibold text-stone-900">{title}</h3>
    </div>
    <div className="pl-9 text-stone-700 space-y-3">
      {content}
    </div>
  </div>
)

const RefundPolicyContent = () => (
  <section className="max-w-4xl mx-auto px-4 py-10">
    <Seo 
      title="Refund Policy | Puja Samriddhi" 
      description="Complete refund, cancellation and rescheduling policies for Puja Samriddhi services."
    />
    
    <div className="mb-10">
      <h1 className="text-4xl font-bold text-[#333333] mb-2">Refund Policy</h1>
      <p className="text-stone-600">Last updated: March 2026</p>
    </div>

    <div className="bg-[#FFF8E1] border-l-4 border-[#FF6F00] p-4 mb-8 rounded">
      <p className="text-[#333333]">
        We're committed to fair and transparent refund policies. Please review the sections below to understand your cancellation and refund options.
      </p>
    </div>

    {/* Cancellation Policy */}
    <PolicySection
      icon={<SectionIconWrap><ClipboardIcon /></SectionIconWrap>}
      title="2. Cancellation Policy"
      content={
        <div className="space-y-3">
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
            <p className="font-semibold text-green-900 mb-1">✓ 48 hours or more before the scheduled puja</p>
            <p className="text-stone-700">→ Eligible for <span className="font-bold">70% refund</span></p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
            <p className="font-semibold text-yellow-900 mb-1">✓ 24–48 hours before the puja</p>
            <p className="text-stone-700">→ Eligible for <span className="font-bold">50% refund</span></p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
            <p className="font-semibold text-red-900 mb-1">✗ Less than 24 hours before the puja</p>
            <p className="text-stone-700">→ No refund</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
            <p className="font-semibold text-red-900 mb-1">✗ Same-day cancellation or during muhurat time</p>
            <p className="text-stone-700">→ No refund</p>
          </div>
          <p className="text-sm text-stone-600 italic mt-4 pt-3 border-t border-stone-200">
            <strong>Why?</strong> This is due to pandit scheduling, preparation, and logistics.
          </p>
        </div>
      }
    />

    {/* Rescheduling Policy */}
    <PolicySection
      icon={<SectionIconWrap><RefreshIcon /></SectionIconWrap>}
      title="3. Rescheduling Policy"
      content={
        <ul className="space-y-2">
          <li className="flex items-start gap-3">
            <span className="text-green-600 font-bold mt-0.5">✓</span>
            <span>Rescheduling allowed <strong>once per booking</strong></span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-600 font-bold mt-0.5">✓</span>
            <span>Must be requested <strong>at least 24 hours in advance</strong></span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-600 font-bold mt-0.5">✓</span>
            <span>Subject to <strong>pandit availability</strong></span>
          </li>
        </ul>
      }
    />

    {/* Non-Responsive Customer Policy */}
    <PolicySection
      icon={<SectionIconWrap><PhoneIcon /></SectionIconWrap>}
      title="4. Non-Responsive Customer Policy"
      content={
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-stone-900 mb-2">If the customer:</p>
            <ul className="space-y-1 ml-4 text-stone-700">
              <li>• Does not answer calls</li>
              <li>• Does not respond to WhatsApp/messages</li>
              <li>• Does not confirm details before the puja</li>
            </ul>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="font-semibold text-stone-900 mb-2">Then:</p>
            <ul className="space-y-1 ml-4 text-stone-700">
              <li>✗ Booking may be cancelled</li>
              <li>✗ No refund will be provided</li>
            </ul>
            <p className="text-sm text-stone-600 italic mt-3">
              This ensures proper coordination with pandit and timely service.
            </p>
          </div>
        </div>
      }
    />

    {/* No Refund Situations */}
    <PolicySection
      icon={<SectionIconWrap><BanIcon /></SectionIconWrap>}
      title="5. No Refund Situations"
      content={
        <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
          <p className="font-semibold text-stone-900 mb-3">Refunds will not be provided if:</p>
          <ul className="space-y-2 ml-4 text-stone-700">
            <li>✗ Customer is unavailable at the scheduled time</li>
            <li>✗ Incorrect address or details are provided</li>
            <li>✗ Cancellation happens after pandit is assigned or has reached location</li>
            <li>✗ Delay or issue is caused from the customer's side</li>
          </ul>
        </div>
      }
    />

    {/* Company Cancellation */}
    <PolicySection
      icon={<SectionIconWrap><BuildingIcon /></SectionIconWrap>}
      title="6. Company Cancellation"
      content={
        <div className="space-y-4">
          <p className="font-semibold text-stone-900">If Puja Samriddhi cancels the booking due to:</p>
          <ul className="space-y-1 ml-4 text-stone-700">
            <li>• Pandit unavailability</li>
            <li>• Emergency situations</li>
          </ul>
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500 mt-4">
            <p className="text-green-900 font-semibold">
              → Customer will receive <strong>100% full refund</strong>
            </p>
          </div>
        </div>
      }
    />

    {/* Service Issues / Partial Refunds */}
    <PolicySection
      icon={<SectionIconWrap><LifebuoyIcon /></SectionIconWrap>}
      title="7. Service Issues / Partial Refunds"
      content={
        <div className="space-y-3">
          <p>If you face any issue with the service:</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-[#FF6F00] font-bold">1.</span>
              <span className="text-stone-700"><strong>Report within 24 hours</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF6F00] font-bold">2.</span>
              <span className="text-stone-700"><strong>Our team will review</strong> and may provide a partial refund if applicable</span>
            </li>
          </ul>
        </div>
      }
    />

    {/* Refund Process */}
    <PolicySection
      icon={<SectionIconWrap><ClockIcon /></SectionIconWrap>}
      title="8. Refund Process"
      content={
        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
          <p className="text-stone-700">
            <span className="font-semibold">Processing Time:</span> Refunds are processed within <strong>5-7 working days</strong>
          </p>
          <p className="text-stone-700">
            <span className="font-semibold">Payment Method:</span> Credited to original payment method (UPI / Card / Bank)
          </p>
        </div>
      }
    />

    {/* Contact Section */}
    <div className="bg-stone-100 p-6 rounded-lg mt-10">
      <h3 className="text-lg font-semibold text-stone-900 mb-2">Have Questions?</h3>
      <p className="text-stone-700">
        If you have any questions regarding our refund policy, please contact us at 
        <strong> support@pujasamriddhi.com</strong> or reach out via WhatsApp for immediate assistance.
      </p>
    </div>
  </section>
)

const policyContent = {
  refund: {
    title: 'Refund Policy',
    component: RefundPolicyContent,
  },
  privacy: {
    title: 'Privacy Policy',
    body: 'We collect booking details only to deliver services, confirmations, and support. We do not sell personal information to third parties.',
  },
  terms: {
    title: 'Terms & Conditions',
    body: 'By booking with Puja Samriddhi, you agree to package inclusions, payment terms, and respectful conduct standards during services.',
  },
}

function PolicyPage({ type }) {
  const content = policyContent[type]

  // If it's the refund policy with component
  if (content.component) {
    return <content.component />
  }

  // For other policies (privacy, terms)
  return (
    <section className="max-w-4xl mx-auto px-4 py-10">
      <Seo title={`${content.title} | Puja Samriddhi`} description={content.body} />
      <h1 className="text-3xl font-semibold">{content.title}</h1>
      <p className="mt-4 text-stone-700">{content.body}</p>
    </section>
  )
}

export default PolicyPage

