const esAR = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const dateShortFmt = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'America/Argentina/Buenos_Aires',
})

const dateTimeFmt = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Argentina/Buenos_Aires',
})

const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

export const fmt = {
  currency: (cents: number) => esAR.format(cents / 100),
  price: (amount: number) => esAR.format(amount),
  currencyExact: (cents: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(cents / 100),

  dateShort: (d: string | Date) => dateShortFmt.format(new Date(d)),
  dateTime: (d: string | Date) => dateTimeFmt.format(new Date(d)),

  relativeTime: (d: string | Date) => {
    const diff = Date.now() - new Date(d).getTime()
    if (diff < 60_000) return rtf.format(-Math.floor(diff / 1000), 'second')
    if (diff < 3_600_000) return rtf.format(-Math.floor(diff / 60_000), 'minute')
    if (diff < 86_400_000) return rtf.format(-Math.floor(diff / 3_600_000), 'hour')
    return rtf.format(-Math.floor(diff / 86_400_000), 'day')
  },

  plate: (s: string) =>
    s
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .replace(/^([A-Z]{2})([0-9]{3})([A-Z]{2})$/, '$1$2$3')
      .replace(/^([A-Z]{3})([0-9]{3})$/, '$1 $2'),

  rating: (n: number) => n.toFixed(1),
}
