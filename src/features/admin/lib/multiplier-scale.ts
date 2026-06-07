import type { I18nKey } from '@/i18n/es'

export type MultiplierLevel = 'high' | 'elevated' | 'normal' | 'low'

/**
 * Clasifica un multiplier dinámico (rango 0.7–2.0) en uno de cuatro niveles
 * semánticos. Es la única fuente de verdad de los cortes: la consumen tanto
 * el color del hex en el mapa como el tono del detalle, así una misma zona
 * nunca se ve de dos colores distintos según la vista.
 */
export function multiplierLevel(multiplier: number): MultiplierLevel {
  if (multiplier >= 1.5) return 'high'
  if (multiplier >= 1.15) return 'elevated'
  if (multiplier <= 0.85) return 'low'
  return 'normal'
}

/** Color de relleno del hex en el mapa, por nivel. */
export const MULTIPLIER_HEX_COLOR: Record<MultiplierLevel, string> = {
  high: '#dc2626',
  elevated: '#f97316',
  normal: '#facc15',
  low: '#22c55e',
}

/** Clase Tailwind de texto para el detalle, por nivel. */
export const MULTIPLIER_TEXT_CLASS: Record<MultiplierLevel, string> = {
  high: 'text-red-400',
  elevated: 'text-orange-400',
  normal: 'text-amber-300',
  low: 'text-emerald-400',
}

/** Clave i18n de la etiqueta de cada nivel para la leyenda del mapa. */
export const MULTIPLIER_LABEL_KEY: Record<MultiplierLevel, I18nKey> = {
  high: 'admin.pricing.legend.high',
  elevated: 'admin.pricing.legend.elevated',
  normal: 'admin.pricing.legend.normal',
  low: 'admin.pricing.legend.low',
}

/** Niveles en orden de mayor a menor presión, para iterar en la leyenda. */
export const MULTIPLIER_LEVELS: MultiplierLevel[] = [
  'high',
  'elevated',
  'normal',
  'low',
]
