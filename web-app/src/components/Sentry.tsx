import { useEffect } from 'react'

// Initialize Sentry
const SentryInit: React.FC = () => {
  useEffect(() => {
    const dsn = import.meta.env.VITE_SENTRY_DSN

    if (!dsn) {
      console.warn('Sentry error tracking not configured - missing VITE_SENTRY_DSN')
      return
    }

    // Import Sentry dynamically to avoid bundling issues if not used
    import('@sentry/browser').then(({ init }) => {
      init({
        dsn,
        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,
        // Set to true to automatically capture browser
        // navigation events as performance metrics
        enableTracing: true,
        // Additional options
        environment: import.meta.env.MODE, // development, production, etc.
        release: import.meta.env.VITE_APP_VERSION || 'unknown',
      })
    })
  }, [])

  return null
}

export default SentryInit