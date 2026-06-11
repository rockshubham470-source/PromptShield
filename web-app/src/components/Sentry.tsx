import { useEffect } from 'react'

// Initialize Sentry
const SentryInit: React.FC = () => {
  useEffect(() => {
    const dsn = import.meta.env.VITE_SENTRY_DSN

    if (!dsn) {
      console.warn(
        'Sentry error tracking not configured - missing VITE_SENTRY_DSN'
      )
      return
    }

    import('@sentry/browser').then(({ init }) => {
      init({
        dsn,
        tracesSampleRate: 1.0,
        environment: import.meta.env.MODE,
        release: import.meta.env.VITE_APP_VERSION || 'unknown',
      })
    })
  }, [])

  return null
}

export default SentryInit