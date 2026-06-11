import { useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'
import { t } from '@/i18n/es'

interface ReReservarInput {
  reservationId: string
  vehicleId: string
  city?: string
  locationCode?: string
}

/**
 * Inicia el flujo de re-reserva de una reserva completada. Comprueba la
 * disponibilidad del vehículo antes de abrir el formulario: si sigue
 * habilitado, navega al formulario de reserva precargado vía `reuse`; si el
 * vehículo fue deshabilitado o eliminado, avisa y redirige al buscador
 * pre-filtrado por la zona del vehículo (sugerencia de similares).
 */
export function useReReservar() {
  const navigate = useNavigate()

  return useCallback(
    async ({ reservationId, vehicleId, city, locationCode }: ReReservarInput) => {
      const goToSimilares = (zoneCity?: string, zoneCode?: string) => {
        toast.info(t('reservar.reReservar.noDisponible'))
        void navigate({
          to: '/buscar',
          search: { city: zoneCity, locationCode: zoneCode, searched: true },
        })
      }

      try {
        const vehicle = await vehiclesApi.getById(vehicleId)
        if (!vehicle.enabled) {
          goToSimilares(vehicle.city, locationCode)
          return
        }
        void navigate({
          to: '/vehiculos/$id/reservar',
          params: { id: vehicleId },
          search: { reuse: reservationId },
        })
      } catch {
        goToSimilares(city, locationCode)
      }
    },
    [navigate],
  )
}
