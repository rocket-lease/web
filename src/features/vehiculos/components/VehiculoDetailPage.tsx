import { useParams } from '@tanstack/react-router'
import { Star, Settings, Users, MapPin, Shield } from 'lucide-react'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { Avatar } from '@/ui/avatar'
import { Separator } from '@/ui/separator'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'

export function VehiculoDetailPage() {
  const { id } = useParams({ from: '/_app/vehiculos/$id' })

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title="Detalle del vehículo" showBack />

      {/* Photo */}
      <div className="aspect-[4/3] bg-surface-2 relative overflow-hidden">
        <img
          src={`https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80&v=${id}`}
          alt="Vehículo"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex-1 px-4 py-5 space-y-5">
        {/* Title + rating */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Toyota Corolla 2022</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin className="h-3.5 w-3.5 text-text-muted" />
              <span className="text-sm text-text-muted">Palermo, CABA</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="font-bold text-text-primary">4.8</span>
            <span className="text-sm text-text-muted">(47)</span>
          </div>
        </div>

        {/* Features */}
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-surface-2 py-3">
            <Settings className="h-5 w-5 text-brand-400" />
            <span className="text-xs text-text-muted">Automático</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-surface-2 py-3">
            <Users className="h-5 w-5 text-brand-400" />
            <span className="text-xs text-text-muted">5 asientos</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-surface-2 py-3">
            <Shield className="h-5 w-5 text-brand-400" />
            <span className="text-xs text-text-muted">Asegurado</span>
          </div>
        </div>

        <Separator />

        {/* Price */}
        <div>
          <p className="text-sm text-text-muted mb-2">Tarifas</p>
          <div className="flex gap-3">
            <div className="rounded-xl bg-surface-2 flex-1 p-3 text-center">
              <p className="text-lg font-bold text-text-primary">{fmt.currency(850000)}</p>
              <p className="text-xs text-text-muted">por día</p>
            </div>
            <div className="rounded-xl bg-surface-2 flex-1 p-3 text-center">
              <p className="text-lg font-bold text-text-primary">{fmt.currency(5500000)}</p>
              <p className="text-xs text-text-muted">por semana</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Rentador */}
        <div>
          <p className="text-sm text-text-muted mb-3">Rentador</p>
          <div className="flex items-center gap-3">
            <Avatar fallback="LM" size="md" />
            <div className="flex-1">
              <p className="font-semibold text-text-primary">Lucas M.</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                <span className="text-sm text-text-muted">4.9 · 120 reseñas</span>
              </div>
            </div>
            <Badge variant="default">Oro</Badge>
          </div>
        </div>

        <Separator />

        {/* Description */}
        <div>
          <p className="text-sm text-text-muted mb-2">{t('vehiculo.description')}</p>
          <p className="text-sm text-text-secondary leading-relaxed">
            Automóvil en perfecto estado, con aire acondicionado, sistema de audio bluetooth y GPS integrado.
            Ideal para viajes de negocios o placer.
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {['Aire A/C', 'Bluetooth', 'GPS', 'Nafta'].map(tag => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      </div>

      {/* CTA sticky */}
      <div
        className="sticky bottom-0 bg-surface-0/95 backdrop-blur-xl border-t border-white/6 px-4 py-4"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
      >
        <Button className="w-full" size="lg">
          {t('vehiculo.reservar')}
        </Button>
      </div>
    </div>
  )
}
