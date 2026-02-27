const isDev = process.env.NODE_ENV !== 'production'

const logger = {
  info: (obj: Record<string, unknown>) => {
    if (!isDev) return
    Object.entries(obj).forEach(([key, value]) => {
      console.log(`${key}:`, value)
    })
  },
  error: (obj: Record<string, unknown>) => {
    Object.entries(obj).forEach(([key, value]) => {
      console.error(`${key}:`, value)
    })
  },
}

export default logger
