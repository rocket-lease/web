import { useEffect, useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { storage } from '@/lib/storage'
import { t } from '@/i18n/es'
// import { publishVehicle } from '../api/vehicle.api'
// import { CreateVehicleRequestSchema, type CreateVehicleRequest } from '@rocket-lease/contracts'

const steps = [
  t('nuevoVehiculo.step.datos'),
  t('nuevoVehiculo.step.fotos'),
  t('nuevoVehiculo.step.disponibilidad'),
  t('nuevoVehiculo.step.tarifas'),
  t('nuevoVehiculo.step.publicar'),
]

const MAX_PHOTOS = 10
const MIN_PHOTOS = 3

const VEHICLE_PHOTOS_BUCKET = 'vehicle-photos'

type TransmissionOption = 'Manual' | 'Automatico' | 'Semiautomatico'

type VehiclePhoto = {
  name: string
  file: File
  previewUrl: string
}

type VehicleFormData = {
  brand: string
  model: string
  year: string
  plate: string
  transmission: TransmissionOption | null
  passengers: string
  trunkLiters: string
  isAccessible: boolean | null
  color: string
  mileage: string
  description: string
  availableFrom: string
  dailyPrice: string
  photos: Array<VehiclePhoto>
}

const initialFormData: VehicleFormData = {
  brand: '',
  model: '',
  year: '',
  plate: '',
  transmission: null,
  passengers: '',
  trunkLiters: '',
  isAccessible: null,
  color: '',
  mileage: '',
  description: '',
  availableFrom: '',
  dailyPrice: '',
  photos: [],
}

export function NuevoVehiculoPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData)
  const [photoMessage, setPhotoMessage] = useState<string | null>(null)
  const [isPublished, setIsPublished] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const photosRef = useRef(formData.photos)

  useEffect(() => {
    photosRef.current = formData.photos
  }, [formData.photos])

  useEffect(() => {
    return () => {
      photosRef.current.forEach(photo => URL.revokeObjectURL(photo.previewUrl))
    }
  }, [])

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])

    if (files.length === 0) return

    const remainingSlots = MAX_PHOTOS - photosRef.current.length

    if (remainingSlots <= 0) {
      setPhotoMessage(`Máximo ${MAX_PHOTOS} fotos`)
      event.target.value = ''
      return
    }

    const acceptedFiles = files.slice(0, remainingSlots)

    if (acceptedFiles.length < files.length) {
      setPhotoMessage(`Solo podés subir hasta ${MAX_PHOTOS} fotos`)
    } else {
      setPhotoMessage(null)
    }

    setFormData(current => ({
      ...current,
      photos: [
        ...current.photos,
        ...acceptedFiles.map(file => ({
          name: file.name,
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ],
    }))

    event.target.value = ''
  }

  const handleRemovePhoto = (url: string) => {
    setFormData(current => {
      const target = current.photos.find(photo => photo.previewUrl === url)

      if (target) {
        URL.revokeObjectURL(target.previewUrl)
      }

      return {
        ...current,
        photos: current.photos.filter(photo => photo.previewUrl !== url),
      }
    })

    setPhotoMessage(null)
  }

  const canContinueFromStep0 = Boolean(
    formData.brand.trim() &&
      formData.model.trim() &&
      formData.year.trim() &&
      formData.plate.trim() &&
      formData.transmission &&
      formData.passengers.trim() &&
      formData.trunkLiters.trim() &&
      formData.isAccessible !== null &&
      formData.color.trim() &&
      formData.mileage.trim() &&
      formData.description.trim(),
  )
  const canContinueFromPhotos = formData.photos.length >= MIN_PHOTOS
  const canContinueFromAvailability = Boolean(formData.availableFrom)
  const canContinueFromPricing = Number(formData.dailyPrice) > 0

  const transmissionLabel = formData.transmission === 'Automatico'
    ? 'Automático'
    : formData.transmission === 'Semiautomatico'
      ? 'Semiautomático'
      : 'Manual'

  const formPayload = {
    brand: formData.brand,
    model: formData.model,
    year: Number(formData.year || 0),
    plate: formData.plate,
    transmission: formData.transmission ?? 'Manual',
    passengers: Number(formData.passengers || 0),
    trunkLiters: Number(formData.trunkLiters || 0),
    isAccessible: formData.isAccessible ?? false,
    color: formData.color,
    mileage: Number(formData.mileage || 0),
    description: formData.description.trim() ? formData.description.trim() : null,
    basePrice: Number(formData.dailyPrice || 0),
    photos: [],
  }

  const handleFieldChange = <K extends keyof VehicleFormData>(field: K, value: VehicleFormData[K]) => {
    setFormData(current => ({
      ...current,
      [field]: value,
    }))
  }

  const handleNext = () => {
    if (currentStep === 0 && !canContinueFromStep0) return

    if (currentStep === 1 && !canContinueFromPhotos) {
      setPhotoMessage(`Necesitás al menos ${MIN_PHOTOS} fotos para continuar`)
      return
    }

    if (currentStep === 2 && !canContinueFromAvailability) return

    if (currentStep === 3 && !canContinueFromPricing) return

    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1)
      return
    }

    // void (async () => {
    //   try {
    //     const photoUrls = await Promise.all(
    //       formData.photos.map(async photo => {
    //         const safeName = photo.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    //         const path = `rentador/${crypto.randomUUID()}-${safeName}`
    //         await storage.upload(VEHICLE_PHOTOS_BUCKET, path, photo.file)
    //         return storage.getPublicUrl(VEHICLE_PHOTOS_BUCKET, path)
    //       }),
    //     )

    //     const requestBody = CreateVehicleRequestSchema.parse({
    //       ...formPayload,
    //       photos: photoUrls,
    //     })

    //     await publishVehicle(requestBody)
    //     toast.success('Vehículo publicado')
    //     setIsPublished(true)
    //   } catch (error) {
    //     const message = error instanceof Error ? error.message : 'No se pudo publicar el vehículo'
    //     toast.error(message)
    //   }
    // })()
  }

  if (isPublished) {
    return (
      <div className="flex min-h-full flex-col px-4 py-6">
        <PageHeader title={t('nuevoVehiculo.title')} showBack />
        <div className="flex flex-1 flex-col items-center justify-center text-center gap-4">
          <div className="rounded-full bg-brand-500/15 px-4 py-2 text-sm font-semibold text-brand-400">
            Vehículo publicado
          </div>
          <p className="max-w-sm text-sm text-text-secondary">
            Publicaste {formData.brand} {formData.model}. Ya quedó listo para alquilar desde {formData.availableFrom || 'la fecha seleccionada'}.
          </p>
          <Button variant="secondary" onClick={() => setIsPublished(false)}>
            Volver al formulario
          </Button>
        </div>
      </div>
    )
  }

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
              <Input value={formData.brand} onChange={e => handleFieldChange('brand', e.target.value)} placeholder="Toyota, Ford, Volkswagen..." />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">Modelo</label>
              <Input value={formData.model} onChange={e => handleFieldChange('model', e.target.value)} placeholder="Corolla, Focus, Polo..." />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">Año</label>
              <Input value={formData.year} onChange={e => handleFieldChange('year', e.target.value)} type="number" placeholder="2022" min="1990" max="2026" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">Patente</label>
              <Input value={formData.plate} onChange={e => handleFieldChange('plate', e.target.value)} placeholder="AB 123 CD" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">Transmisión</label>
              <div className="flex gap-3">
                {[
                  { label: 'Manual', value: 'Manual' as TransmissionOption },
                  { label: 'Automático', value: 'Automatico' as TransmissionOption },
                  { label: 'Semiautomático', value: 'Semiautomatico' as TransmissionOption },
                ].map(option => {
                  const selected = formData.transmission === option.value

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleFieldChange('transmission', option.value)}
                      className={`flex-1 rounded-xl border py-3 text-sm font-medium transition-colors ${
                        selected
                          ? 'border-brand-500 bg-brand-500/15 text-brand-400'
                          : 'border-white/8 bg-surface-2 text-text-secondary hover:border-brand-600/50 hover:text-brand-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">Cantidad de pasajeros</label>
              <Input value={formData.passengers} onChange={e => handleFieldChange('passengers', e.target.value)} type="number" placeholder="4" min="1" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">Volumen del baúl (litros)</label>
              <Input value={formData.trunkLiters} onChange={e => handleFieldChange('trunkLiters', e.target.value)} type="number" placeholder="450" min="0" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">Accesibilidad</label>
              <div className="flex gap-3">
                {[
                  { label: 'Sí', value: true },
                  { label: 'No', value: false },
                ].map(option => {
                  const selected = formData.isAccessible === option.value

                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => handleFieldChange('isAccessible', option.value)}
                      className={`flex-1 rounded-xl border py-3 text-sm font-medium transition-colors ${
                        selected
                          ? 'border-brand-500 bg-brand-500/15 text-brand-400'
                          : 'border-white/8 bg-surface-2 text-text-secondary hover:border-brand-600/50 hover:text-brand-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">Color</label>
              <Input value={formData.color} onChange={e => handleFieldChange('color', e.target.value)} placeholder="Blanco, negro, gris..." />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">Kilometraje</label>
              <Input value={formData.mileage} onChange={e => handleFieldChange('mileage', e.target.value)} type="number" placeholder="35000" min="0" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">Descripción</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={e => handleFieldChange('description', e.target.value)}
                placeholder="Contá qué hace especial al vehículo..."
                className="w-full rounded-xl border border-white/8 bg-surface-2 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-brand-500"
              />
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="rounded-2xl border-2 border-dashed border-white/10 bg-surface-2 p-5">
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <Camera className="h-10 w-10 text-text-muted" />
                <p className="text-sm text-text-muted">Subí fotos del vehículo</p>
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Elegir fotos
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
              </div>
              <p className="mt-4 text-center text-xs text-text-muted">
                {formData.photos.length}/{MAX_PHOTOS} fotos cargadas
              </p>
              {photoMessage && (
                <p className="mt-2 text-center text-xs font-medium text-danger">{photoMessage}</p>
              )}

              {formData.photos.length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {formData.photos.map(photo => (
                    <div key={`${photo.name}-${photo.previewUrl}`} className="group relative overflow-hidden rounded-xl bg-surface-3">
                      <img src={photo.previewUrl} alt={photo.name} className="h-32 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(photo.previewUrl)}
                        className="absolute right-2 top-2 rounded-full bg-surface-0/90 px-2.5 py-1 text-[11px] font-semibold text-text-primary opacity-100 shadow-sm transition hover:bg-danger hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        Borrar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-text-muted text-center">Mínimo 3 fotos · Máximo 10</p>
            {currentStep === 1 && formData.photos.length < MIN_PHOTOS && (
              <p className="text-center text-xs font-medium text-danger">
                Necesitás al menos {MIN_PHOTOS} fotos para continuar
              </p>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/8 bg-surface-2 p-4">
              <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">
                Disponible desde
              </label>
              <Input
                value={formData.availableFrom}
                onChange={e => handleFieldChange('availableFrom', e.target.value)}
                type="date"
              />
              <p className="mt-2 text-xs text-text-muted">
                Elegí la fecha a partir de la cual el auto estará disponible para alquilar.
              </p>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/8 bg-surface-2 p-4">
              <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">
                Precio por día
              </label>
              <Input
                value={formData.dailyPrice}
                onChange={e => handleFieldChange('dailyPrice', e.target.value)}
                type="number"
                placeholder="25000"
                min="1"
              />
              <p className="mt-2 text-xs text-text-muted">
                Definí el valor diario del alquiler.
              </p>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/8 bg-surface-2 p-4 space-y-3">
              <p className="text-sm font-semibold text-text-primary">Confirmación final</p>
              <div className="grid gap-2 text-sm text-text-secondary">
                <p><span className="font-medium text-text-primary">Vehículo:</span> {formData.brand} {formData.model} {formData.year}</p>
                <p><span className="font-medium text-text-primary">Patente:</span> {formData.plate}</p>
                <p><span className="font-medium text-text-primary">Transmisión:</span> {formData.transmission ? transmissionLabel : 'Sin definir'}</p>
                <p><span className="font-medium text-text-primary">Pasajeros:</span> {formData.passengers || '-'} </p>
                <p><span className="font-medium text-text-primary">Baúl:</span> {formData.trunkLiters || '-'} litros</p>
                <p><span className="font-medium text-text-primary">Accesibilidad:</span> {formData.isAccessible === null ? 'Sin definir' : formData.isAccessible ? 'Sí' : 'No'}</p>
                <p><span className="font-medium text-text-primary">Color:</span> {formData.color || '-'}</p>
                <p><span className="font-medium text-text-primary">Kilometraje:</span> {formData.mileage || '-'}</p>
                <p><span className="font-medium text-text-primary">Disponible desde:</span> {formData.availableFrom || '-'}</p>
                <p><span className="font-medium text-text-primary">Precio por día:</span> {formData.dailyPrice || '-'} </p>
                <p><span className="font-medium text-text-primary">Fotos cargadas:</span> {formData.photos.length}</p>
              </div>
            </div>

            {formData.description && (
              <div className="rounded-2xl border border-white/8 bg-surface-2 p-4">
                <p className="mb-2 text-xs font-medium text-text-secondary uppercase tracking-wider">Descripción</p>
                <p className="text-sm text-text-secondary">{formData.description}</p>
              </div>
            )}
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
          disabled={
            (currentStep === 0 && !canContinueFromStep0) ||
            (currentStep === 1 && !canContinueFromPhotos) ||
            (currentStep === 2 && !canContinueFromAvailability) ||
            (currentStep === 3 && !canContinueFromPricing)
          }
          onClick={handleNext}
        >
          {currentStep === steps.length - 1 ? 'Confirmar y publicar' : t('general.next')}
        </Button>
      </div>
    </div>
  )
}
