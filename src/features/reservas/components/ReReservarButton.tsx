import { Button } from '@/ui/button'
import { useReReservar } from '@/features/reservar/hooks/useReReservar'
import { t } from '@/i18n/es'

interface ReReservarButtonProps {
  reservationId: string
  vehicleId: string
}

/**
 * Botón "Re-reservar" para una reserva completada (US-31). Detiene la propagación
 * y previene el default del `<Link>` contenedor para que clickearlo no dispare la
 * navegación al detalle de la reserva.
 */
export function ReReservarButton({ reservationId, vehicleId }: ReReservarButtonProps) {
  const reReservar = useReReservar()
  return (
    <div className="pt-1">
      <Button
        variant="outline"
        className="w-full h-8 text-xs border-brand-500/40 text-brand-400 hover:bg-brand-500/10"
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          void reReservar({ reservationId, vehicleId })
        }}
      >
        {t('reservar.reReservar.boton')}
      </Button>
    </div>
  )
}
