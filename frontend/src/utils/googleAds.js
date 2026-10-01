const GOOGLE_ADS_ID = 'AW-18482036720'
const GOOGLE_ADS_CONVERSION_SEND_TO = 'AW-18026538115/9rCOCNbAmYwcEIPJ3JND'
const GOOGLE_ADS_PURCHASE_SEND_TO = 'AW-18482036720/id4WCMzWwIwdEFD_9exF'

export const initializeGoogleAdsTag = () => {
  if (typeof window === 'undefined') return false

  window.dataLayer = window.dataLayer || []

  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments)
    }
  }

  if (!document.querySelector('script[data-google-ads-tag]')) {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`
    script.dataset.googleAdsTag = 'true'
    document.head.appendChild(script)
  }

  if (!window.__googleAdsConfigured) {
    window.gtag('js', new Date())
    window.gtag('config', GOOGLE_ADS_ID)
    window.__googleAdsConfigured = true
  }

  return true
}

export const trackGoogleAdsConversion = () => {
  if (typeof window === 'undefined') {
    return false
  }

  initializeGoogleAdsTag()
  if (typeof window.gtag !== 'function') {
    return false
  }

  window.gtag('event', 'conversion', {
    send_to: GOOGLE_ADS_CONVERSION_SEND_TO,
  })

  return true
}

export const trackGoogleAdsPurchaseConversion = ({ value, transactionId } = {}) => {
  if (typeof window === 'undefined') {
    return false
  }

  initializeGoogleAdsTag()
  if (typeof window.gtag !== 'function') {
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
