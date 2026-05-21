/**
 * Hook para leer/escribir la preferencia del rentador sobre cómo guardar
 * por defecto un nuevo set de reglas creado desde el contexto de un vehículo:
 *
 * - `SHARED`  → set reutilizable, va a la lista de sets compartidos
 * - `PRIVATE` → set privado del vehículo, no aparece en la lista compartida
 *
 * Persistencia en localStorage. Si nunca eligió, devuelve `null` y la UI
 * muestra el modal `RuleSetScopeDialog`.
 */
export type RuleSetScope = 'SHARED' | 'PRIVATE'

const STORAGE_KEY = 'rocket.preferences.ruleSetScopeDefault'

function isScope(value: string | null): value is RuleSetScope {
  return value === 'SHARED' || value === 'PRIVATE'
}

export function useRuleSetScopePreference() {
  const get = (): RuleSetScope | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return isScope(raw) ? raw : null
    } catch {
      return null
    }
  }

  const set = (value: RuleSetScope): void => {
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      return
    }
  }

  const clear = (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      return
    }
  }

  return { get, set, clear }
}
