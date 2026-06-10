import type { I18nKey } from '@/i18n/es'

export type MultiplierLevel = 'veryHigh' | 'high' | 'elevated' | 'normal'

/**
 * Clasifica un multiplier dinámico (rango 1.0–2.0) en uno de cuatro niveles
 * semánticos. Es la única fuente de verdad de los cortes: la consumen tanto
 * el color del hex en el mapa como el tono del detalle, así una misma zona
 * nunca se ve de dos colores distintos según la vista. El motor solo infla
 * el precio, así que el nivel base (verde) es la tarifa sin surge.
 */
export function multiplierLevel(multiplier: number): MultiplierLevel {
  if (multiplier >= 1.5) return 'veryHigh'
  if (multiplier >= 1.3) return 'high'
  if (multiplier >= 1.15) return 'elevated'
  return 'normal'
}

/** Color de relleno del hex en el mapa, por nivel. */
export const MULTIPLIER_HEX_COLOR: Record<MultiplierLevel, string> = {
  veryHigh: '#dc2626',
  high: '#f97316',
  elevated: '#facc15',
  normal: '#22c55e',
}

/** Clase Tailwind de texto para el detalle, por nivel. */
export const MULTIPLIER_TEXT_CLASS: Record<MultiplierLevel, string> = {
  veryHigh: 'text-red-400',
  high: 'text-orange-400',
  elevated: 'text-amber-300',
  normal: 'text-emerald-400',
}

/** Clave i18n de la etiqueta de cada nivel para la leyenda del mapa. */
export const MULTIPLIER_LABEL_KEY: Record<MultiplierLevel, I18nKey> = {
  veryHigh: 'admin.pricing.legend.veryHigh',
  high: 'admin.pricing.legend.high',
  elevated: 'admin.pricing.legend.elevated',
  normal: 'admin.pricing.legend.normal',
}

/** Niveles en orden de mayor a menor presión, para iterar en la leyenda. */
export const MULTIPLIER_LEVELS: MultiplierLevel[] = [
  'veryHigh',
  'high',
  'elevated',
  'normal',
]
