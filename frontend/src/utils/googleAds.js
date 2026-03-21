const GOOGLE_ADS_CONVERSION_SEND_TO = 'AW-18026538115/9rCOCNbAmYwcEIPJ3JND'

export const trackGoogleAdsConversion = () => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return false
  }

  window.gtag('event', 'conversion', {
    send_to: GOOGLE_ADS_CONVERSION_SEND_TO,
  })

  return true
}
