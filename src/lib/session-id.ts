const SESSION_ID_KEY = 'rocket-lease.session-id'

/**
 * Devuelve un identificador de sesión persistente en `localStorage`.
 *
 * El backend lo usa para deduplicar señales de demanda (debounce de SearchLog).
 * Se genera la primera vez que se invoca y se reutiliza en cada request del
 * navegador hasta que el usuario limpie el storage.
 */
export function getSessionId(): string {
  try {
    const existing = localStorage.getItem(SESSION_ID_KEY)
    if (existing && existing.length > 0) return existing
    const generated = generateUuid()
    localStorage.setItem(SESSION_ID_KEY, generated)
    return generated
  } catch {
    return generateUuid()
  }
}

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
