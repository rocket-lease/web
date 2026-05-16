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

const timeFmt = new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Argentina/Buenos_Aires',
})

const dayMonthFmt = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: 'short',
  timeZone: 'America/Argentina/Buenos_Aires',
})

const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

/**
 * Formatters de display centralizados.
 *
 * Convención del proyecto (CONTEXT.md): dinero se almacena como integer cents
 * y currency code separado. Las funciones `currency*` reciben centavos y
 * dividen por 100. Fechas siempre en zona `America/Argentina/Buenos_Aires`.
 *
 * El `.replace(/-/g, ' ')` en las date functions normaliza la salida del ICU
 * en `es-AR` (que en versiones recientes devuelve "17-may-2026" con guiones).
 */
export const fmt = {
  /** Formatea centavos a "$X" sin decimales. Ej: 312000 → "$3.120". */
  currency: (cents: number) => esAR.format(cents / 100),
  /** Formatea pesos enteros (legacy — preferir `currency` con cents). */
  price: (amount: number) => esAR.format(amount),
  /** Como `currency` pero conservando los 2 decimales del ICU default. */
  currencyExact: (cents: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(cents / 100),

  /** "17 may 2026" — fecha corta con año. */
  dateShort: (d: string | Date) => dateShortFmt.format(new Date(d)).replace(/-/g, ' '),
  /** "17 may, 09:00" — fecha + hora sin año. */
  dateTime: (d: string | Date) => dateTimeFmt.format(new Date(d)).replace(/-/g, ' '),
  /** "17 may" — día + mes sin año. Útil para cards compactas en mobile. */
  dayMonth: (d: string | Date) => dayMonthFmt.format(new Date(d)).replace(/-/g, ' '),
  /** "09:00" — hora 24h. */
  time: (d: string | Date) => timeFmt.format(new Date(d)),

  /** "hace 5 minutos", "hace 2 días", etc. — escala automáticamente. */
  relativeTime: (d: string | Date) => {
    const diff = Date.now() - new Date(d).getTime()
    if (diff < 60_000) return rtf.format(-Math.floor(diff / 1000), 'second')
    if (diff < 3_600_000) return rtf.format(-Math.floor(diff / 60_000), 'minute')
    if (diff < 86_400_000) return rtf.format(-Math.floor(diff / 3_600_000), 'hour')
    return rtf.format(-Math.floor(diff / 86_400_000), 'day')
  },

  /** Normaliza una patente: "ae987cc" → "AE987CC", "abc123" → "ABC 123". */
  plate: (s: string) =>
    s
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .replace(/^([A-Z]{2})([0-9]{3})([A-Z]{2})$/, '$1$2$3')
      .replace(/^([A-Z]{3})([0-9]{3})$/, '$1 $2'),

  /** Rating numérico con 1 decimal. Ej: 4.567 → "4.6". */
  rating: (n: number) => n.toFixed(1),
}
