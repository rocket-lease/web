import { Heart, Bell } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { t } from '@/i18n/es'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { VehiculoCard } from '@/features/vehiculos/components/VehiculoCard'
import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'
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
        actions={
          <Link
            to="/notificaciones"
            aria-label={t('nav.notificaciones')}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2/80 text-text-secondary hover:text-text-primary transition-colors active:scale-95"
          >
            <Bell size={22} />
          </Link>
        }
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
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-1">
              <Heart size={28} weight="regular" color="#5A5A78" />
            </div>
            <div>
              <p className="font-semibold text-text-primary">{t('favoritos.empty')}</p>
              <p className="mt-1 text-sm text-text-muted">{t('favoritos.emptyHint')}</p>
            </div>
            <Link
              to="/buscar"
              className="mt-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #06B6D4 0%, #7C3AED 100%)' }}
            >
              {t('favoritos.emptyAction')}
            </Link>
          </div>
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
