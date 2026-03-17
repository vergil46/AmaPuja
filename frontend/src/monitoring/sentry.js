export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return

  const startSentry = () => {
    import('@sentry/react')
      .then((Sentry) => {
        Sentry.init({
          dsn,
          environment: import.meta.env.MODE || 'development',
          tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || 0.2),
        })
      })
      .catch(() => {
        // Ignore monitoring bootstrap errors so user flow is unaffected.
      })
  }

  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(startSentry, { timeout: 2500 })
    return
  }

  setTimeout(startSentry, 1200)
}
