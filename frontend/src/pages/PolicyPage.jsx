import Seo from '../components/Seo'

const PolicySection = ({ title, content, icon }) => (
  <div className="mb-8">
    <div className="flex items-center gap-3 mb-4">
      <span className="text-2xl">{icon}</span>
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
      <h1 className="text-4xl font-bold text-stone-900 mb-2">Refund Policy</h1>
      <p className="text-stone-600">Last updated: March 2026</p>
    </div>

    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded">
      <p className="text-stone-800">
        We're committed to fair and transparent refund policies. Please review the sections below to understand your cancellation and refund options.
      </p>
    </div>

    {/* Cancellation Policy */}
    <PolicySection
      icon="📋"
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
      icon="🔄"
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
      icon="📞"
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
      icon="❌"
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
      icon="🏢"
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
      icon="🆘"
      title="7. Service Issues / Partial Refunds"
      content={
        <div className="space-y-3">
          <p>If you face any issue with the service:</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span className="text-stone-700"><strong>Report within 24 hours</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span className="text-stone-700"><strong>Our team will review</strong> and may provide a partial refund if applicable</span>
            </li>
          </ul>
        </div>
      }
    />

    {/* Refund Process */}
    <PolicySection
      icon="⏱️"
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

