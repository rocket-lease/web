import { Heart } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { t } from '@/i18n/es'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { VehiculoCard } from '@/features/vehiculos/components/VehiculoCard'
import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'
import { NotificationBell } from '@/features/notificaciones/components/NotificationBell'
import { EmptyState } from '@/ui/empty-state'
import { useFavoritos } from '../hooks/useFavoritos'

export function FavoritosPage() {
  const { data: favoritos = [], isLoading: loadingFavs } = useFavoritos()

  const { data: allVehicles = [], isLoading: loadingVehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesApi.getAll(),
    enabled: favoritos.length > 0,
  })

  const isLoading = loadingFavs || (favoritos.length > 0 && loadingVehicles)

  const favIds = new Set(favoritos.map(f => f.vehicleId))
  const favVehicles = allVehicles.filter(v => favIds.has(v.id))

  return (
    <div className="flex flex-col">
      <PageHeader
        title={t('nav.favoritos')}
        actions={<NotificationBell />}
      />
      <div className="px-5 pt-4 pb-2">
        {isLoading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-52 rounded-xl bg-surface-1 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && favoritos.length === 0 && (
          <EmptyState
            icon={<Heart size={26} weight="regular" className="text-text-muted" />}
            title={t('favoritos.empty')}
            description={t('favoritos.emptyHint')}
            action={
              <Link
                to="/buscar"
                className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white active:scale-95 transition-transform"
              >
                {t('favoritos.emptyAction')}
              </Link>
            }
          />
        )}

        {!isLoading && favoritos.length > 0 && (
          <>
            <p className="text-xs text-text-muted mb-4">
              <span className="font-semibold text-text-primary">{favVehicles.length}</span>{' '}
              {favVehicles.length === 1 ? t('favoritos.countOne') : t('favoritos.count')}
            </p>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {favVehicles.map(v => (
                <VehiculoCard key={v.id} vehiculo={v} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
