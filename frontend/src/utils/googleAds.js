const GOOGLE_ADS_CONVERSION_SEND_TO = 'AW-18026538115/9rCOCNbAmYwcEIPJ3JND'
const GOOGLE_ADS_PURCHASE_SEND_TO = 'AW-18482036720/id4WCMzWwIwdEFD_9exF'

const loadGoogleAdsScript = () => {
  if (typeof document === 'undefined' || document.querySelector('script[data-google-ads-tag]')) return

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-18482036720'
  script.dataset.googleAdsTag = 'true'
  document.head.appendChild(script)
}

export const trackGoogleAdsConversion = () => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return false
  }

  loadGoogleAdsScript()
  window.gtag('event', 'conversion', {
    send_to: GOOGLE_ADS_CONVERSION_SEND_TO,
  })

  return true
}

export const trackGoogleAdsPurchaseConversion = ({ value, transactionId } = {}) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return false
  }

  loadGoogleAdsScript()
  const conversion = {
    send_to: GOOGLE_ADS_PURCHASE_SEND_TO,
    currency: 'INR',
  }

  if (Number.isFinite(Number(value))) conversion.value = Number(value)
  if (transactionId) conversion.transaction_id = String(transactionId)

  window.gtag('event', 'conversion', conversion)
  return true
}
