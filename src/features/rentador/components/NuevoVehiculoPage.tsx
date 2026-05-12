import { useState } from 'react'
import { Camera, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { t } from '@/i18n/es'

const steps = [
  t('nuevoVehiculo.step.datos'),
  t('nuevoVehiculo.step.fotos'),
  t('nuevoVehiculo.step.disponibilidad'),
  t('nuevoVehiculo.step.tarifas'),
  t('nuevoVehiculo.step.publicar'),
]

export function NuevoVehiculoPage() {
  const [currentStep, setCurrentStep] = useState(0)

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title={t('nuevoVehiculo.title')} showBack />

      {/* Progress */}
      <div className="px-4 py-4">
        <div className="flex gap-1.5 mb-3">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= currentStep ? 'bg-brand-500' : 'bg-surface-3'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-text-muted">
          Paso {currentStep + 1} de {steps.length} — {steps[currentStep]}
        </p>
      </div>

      <div className="flex-1 px-4 pb-4">
        {currentStep === 0 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">Marca</label>
              <Input placeholder="Toyota, Ford, Volkswagen..." />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">Modelo</label>
              <Input placeholder="Corolla, Focus, Polo..." />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">Año</label>
              <Input type="number" placeholder="2022" min="1990" max="2026" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">Patente</label>
              <Input placeholder="AB 123 CD" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">Transmisión</label>
              <div className="flex gap-3">
                {['Automático', 'Manual'].map(t => (
                  <button
                    key={t}
                    className="flex-1 rounded-xl border border-white/8 bg-surface-2 py-3 text-sm font-medium text-text-secondary hover:border-brand-600/50 hover:text-brand-400 transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="aspect-video rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 bg-surface-2">
              <Camera className="h-10 w-10 text-text-muted" />
              <p className="text-sm text-text-muted">Subí fotos del vehículo</p>
              <Button variant="secondary" size="sm">Elegir fotos</Button>
            </div>
            <p className="text-xs text-text-muted text-center">Mínimo 3 fotos · Máximo 10</p>
          </div>
        )}

        {currentStep >= 2 && (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <ChevronRight className="h-10 w-10 text-text-muted" />
            <p className="text-text-secondary">Completá los pasos anteriores</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 bg-surface-0/95 backdrop-blur-xl border-t border-white/6 px-4 py-4 flex gap-3">
        {currentStep > 0 && (
          <Button variant="secondary" className="flex-1" onClick={() => setCurrentStep(s => s - 1)}>
            {t('general.previous')}
          </Button>
        )}
        <Button
          className="flex-1"
          onClick={() => {
            if (currentStep < steps.length - 1) setCurrentStep(s => s + 1)
          }}
        >
          {currentStep === steps.length - 1 ? 'Publicar vehículo' : t('general.next')}
        </Button>
      </div>
    </div>
  )
}
