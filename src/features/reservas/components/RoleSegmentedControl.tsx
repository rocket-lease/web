import type { ReservationRole } from '@rocket-lease/contracts'
import { t } from '@/i18n/es'

interface RoleSegmentedControlProps {
  value: ReservationRole
  onChange: (next: ReservationRole) => void
}

/**
 * Toggle "Como conductor | Como rentador" para alternar la perspectiva del
 * panel `/reservas`. Estilo segmented control mobile-first.
 *
 * NO modifica el `activeRole` global de `AuthProvider` — es puramente local
 * a la pantalla. La UI global del switcher de rol es un trabajo aparte
 * (ver issue web#38).
 */
export function RoleSegmentedControl({ value, onChange }: RoleSegmentedControlProps) {
  return (
    <div
      role="tablist"
      aria-label={t('reservas.role.aria')}
      className="mx-4 mt-2 mb-3 inline-flex w-fit items-center rounded-full bg-surface-2 p-1"
    >
      {(['conductor', 'owner'] as const).map((role) => {
        const active = value === role
        return (
          <button
            key={role}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => {
              if (!active) onChange(role)
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t(`reservas.role.${role}`)}
          </button>
        )
      })}
    </div>
  )
}
