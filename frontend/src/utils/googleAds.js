const GOOGLE_ADS_CONVERSION_SEND_TO = 'AW-18026538115/9rCOCNbAmYwcEIPJ3JND'
const GOOGLE_ADS_PURCHASE_SEND_TO = 'AW-18482036720/id4WCMzWwIwdEFD_9exF'

export const trackGoogleAdsConversion = () => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return false
  }

  window.gtag('event', 'conversion', {
    send_to: GOOGLE_ADS_CONVERSION_SEND_TO,
  })

  return true
}

export const trackGoogleAdsPurchaseConversion = ({ value, transactionId } = {}) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return false
  }

  const conversion = {
    send_to: GOOGLE_ADS_PURCHASE_SEND_TO,
    currency: 'INR',
  }

  if (Number.isFinite(Number(value))) conversion.value = Number(value)
  if (transactionId) conversion.transaction_id = String(transactionId)

  window.gtag('event', 'conversion', conversion)
  return true
}
