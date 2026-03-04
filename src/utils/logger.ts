// logger — structured console logging utility.
// Wraps console.log/error with a key:value format so log output is easy to scan.
// Accepts a Record<string, unknown> so multiple values can be logged in one call:
//   logger.info({ purchase, payload })  →  "purchase: {...}"  "payload: {...}"
//
// logger.info: development-only (suppressed in production builds).
// logger.error: always logs regardless of environment (errors must be visible in production).

const isDev = process.env.NODE_ENV !== 'production'

const logger = {
  // info — logs each key:value pair to console.log; no-op in production.
  info: (obj: Record<string, unknown>) => {
    if (!isDev) return
    Object.entries(obj).forEach(([key, value]) => {
      console.log(`${key}:`, value)
    })
  },
  // error — logs each key:value pair to console.error; always active.
  error: (obj: Record<string, unknown>) => {
    Object.entries(obj).forEach(([key, value]) => {
      console.error(`${key}:`, value)
    })
  },
}

export default logger
