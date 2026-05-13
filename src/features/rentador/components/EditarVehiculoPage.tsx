import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import { photosApi } from '@/features/photos/api/photos.api'
import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'
import type { Characteristic, GetVehicleResponse, UpdateVehicleRequest } from '@rocket-lease/contracts'
import { ALL_CHARACTERISTICS, getCharacteristicLabel } from '@/features/vehiculos/utils/characteristics'

const myVehiclesQueryKey = ['vehicles', 'mine'] as const
const MAX_PHOTOS = 10
const FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&q=80'

const vehicleQueryKey = (vehicleId: string) => ['vehicles', vehicleId] as const

type EditablePhoto = {
  id: string
  kind: 'existing' | 'new'
  url: string
  file?: File
  previewUrl?: string
}

type VehicleDraft = {
  basePrice: string
  color: string
  mileage: string
  availableFrom: string
  province: string
  city: string
  description: string
  enabled: boolean
  isAccessible: boolean
  photos: EditablePhoto[]
  characteristics: Characteristic[]
}

function buildDraft(vehicle: GetVehicleResponse): VehicleDraft {
  return {
    basePrice: String(vehicle.basePrice ?? ''),
    color: vehicle.color ?? '',
    mileage: String(vehicle.mileage ?? ''),
    availableFrom: vehicle.availableFrom ?? '',
    province: vehicle.province ?? '',
    city: vehicle.city ?? '',
    description: vehicle.description ?? '',
    enabled: Boolean(vehicle.enabled),
    isAccessible: Boolean(vehicle.isAccessible),
    photos: vehicle.photos.map(url => ({
      id: url,
      kind: 'existing',
      url,
    })),
    characteristics: vehicle.characteristics ?? [],
  }
}

function isNewPhoto(photo: EditablePhoto): photo is EditablePhoto & { kind: 'new'; file: File; previewUrl: string } {
  return photo.kind === 'new'
}

function revokePhotoPreviews(photos: EditablePhoto[]) {
  photos.filter(isNewPhoto).forEach(photo => {
    URL.revokeObjectURL(photo.previewUrl)
  })
}

interface EditarVehiculoPageProps {
  vehicleId: string
}

export function EditarVehiculoPage({ vehicleId }: EditarVehiculoPageProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const draftRef = useRef<VehicleDraft | null>(null)

  const vehiclesQuery = useQuery({
    queryKey: vehicleQueryKey(vehicleId),
    queryFn: () => vehiclesApi.getVehicleById(vehicleId),
  })

  const vehicle = vehiclesQuery.data
  const [draft, setDraft] = useState<VehicleDraft | null>(null)

  useEffect(() => {
    draftRef.current = draft
  }, [draft])

  useEffect(() => {
    if (vehicle && !draft) {
      setDraft(buildDraft(vehicle))
    }
  }, [vehicle, draft])

  useEffect(() => {
    return () => {
      if (draftRef.current) {
        revokePhotoPreviews(draftRef.current.photos)
      }
    }
  }, [])

  const mainPhotoUrl = useMemo(() => {
    if (draft?.photos[0]) {
      return draft.photos[0].url
    }
    return vehicle?.photos[0] ?? FALLBACK_PHOTO
  }, [draft?.photos, vehicle?.photos])

  const handleFieldChange = <K extends keyof VehicleDraft>(field: K, value: VehicleDraft[K]) => {
    setDraft(current => (current ? { ...current, [field]: value } : current))
  }

  const toggleCharacteristic = (characteristic: Characteristic) => {
    setDraft(current => {
      if (!current) return null
      const characteristics = current.characteristics.includes(characteristic)
        ? current.characteristics.filter(c => c !== characteristic)
        : [...current.characteristics, characteristic]
      return { ...current, characteristics }
    })
  }

  const handlePhotoSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])

    if (files.length === 0) {
      return
    }

    event.target.value = ''

    setDraft(current => {
      if (!current) {
        return current
      }

      const remainingSlots = MAX_PHOTOS - current.photos.length
      if (remainingSlots <= 0) {
        toast.error(t('editVehiculo.photoLimit'))
        return current
      }

      const acceptedFiles = files.slice(0, remainingSlots)
      if (acceptedFiles.length < files.length) {
        toast.error(t('editVehiculo.photoLimit'))
      }

      const newPhotos: EditablePhoto[] = acceptedFiles.map(file => {
        const previewUrl = URL.createObjectURL(file)
        return {
          id: crypto.randomUUID(),
          kind: 'new',
          url: previewUrl,
          file,
          previewUrl,
        }
      })

      return {
        ...current,
        photos: [...current.photos, ...newPhotos],
      }
    })
  }

  const handleRemovePhoto = (photoId: string) => {
    setDraft(current => {
      if (!current) {
        return current
      }

      const target = current.photos.find(photo => photo.id === photoId)
      if (target?.kind === 'new' && target.previewUrl) {
        URL.revokeObjectURL(target.previewUrl)
      }

      return {
        ...current,
        photos: current.photos.filter(photo => photo.id !== photoId),
      }
    })
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!vehicle || !draft) {
        throw new Error('Vehicle draft not ready')
      }

      if (draft.photos.length === 0) {
        throw new Error('Vehicle must keep at least one photo')
      }

      const basePrice = Number(draft.basePrice)
      const mileage = Number(draft.mileage)

      if (!Number.isFinite(basePrice) || basePrice <= 0) {
        throw new Error('Invalid base price')
      }

      if (!Number.isFinite(mileage) || mileage < 0) {
        throw new Error('Invalid mileage')
      }

      const newPhotos = draft.photos.filter(isNewPhoto)
      const uploadedPhotos: Array<{ url: string; publicId: string }> = []

      try {
        for (const photo of newPhotos) {
          uploadedPhotos.push(await photosApi.uploadVehicleImage(photo.file))
        }
      } catch (error) {
        await Promise.allSettled(uploadedPhotos.map(photo => photosApi.deleteVehicleImage(photo.publicId)))
        throw error
      }

      const uploadedUrls = uploadedPhotos.map(photo => photo.url)
      let uploadedIndex = 0
      const finalPhotoUrls = draft.photos.map(photo => {
        if (photo.kind === 'existing') {
          return photo.url
        }

        const nextUrl = uploadedUrls[uploadedIndex]
        uploadedIndex += 1
        return nextUrl
      })

      const payload: UpdateVehicleRequest = {
        basePrice,
        color: draft.color.trim(),
        mileage,
        availableFrom: draft.availableFrom,
        province: draft.province.trim(),
        city: draft.city.trim(),
        description: draft.description.trim() ? draft.description.trim() : null,
        enabled: draft.enabled,
        isAccessible: draft.isAccessible,
        photos: finalPhotoUrls,
        characteristics: draft.characteristics,
      }

      await vehiclesApi.updateVehicle(vehicleId, payload)

      const removedPhotoUrls = vehicle.photos.filter(url => !draft.photos.some(photo => photo.url === url))
      await Promise.allSettled(removedPhotoUrls.map(url => photosApi.deleteVehicleImage(url)))

      return finalPhotoUrls
    },
    onSuccess: finalPhotoUrls => {
      if (draftRef.current) {
        revokePhotoPreviews(draftRef.current.photos)
      }

      setDraft(current => {
        if (!current) {
          return current
        }

        return {
          ...current,
          photos: finalPhotoUrls.map(url => ({
            id: url,
            kind: 'existing',
            url,
          })),
        }
      })

      queryClient.invalidateQueries({ queryKey: myVehiclesQueryKey })
      queryClient.invalidateQueries({ queryKey: vehicleQueryKey(vehicleId) })
      toast.success(t('editVehiculo.saveSuccess'))
      navigate({ to: '/mis-vehiculos' })
    },
    onError: () => {
      toast.error(t('editVehiculo.saveError'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!vehicle) {
        throw new Error('Vehicle not ready')
      }

      await vehiclesApi.deleteVehicle(vehicle.id)
      await Promise.allSettled(vehicle.photos.map(url => photosApi.deleteVehicleImage(url)))
    },
    onSuccess: () => {
      if (draftRef.current) {
        revokePhotoPreviews(draftRef.current.photos)
      }

      queryClient.invalidateQueries({ queryKey: myVehiclesQueryKey })
      queryClient.removeQueries({ queryKey: vehicleQueryKey(vehicleId) })
      toast.success(t('editVehiculo.deleteSuccess'))
      navigate({ to: '/mis-vehiculos' })
    },
    onError: () => {
      toast.error(t('error.default'))
    },
  })

  if (vehiclesQuery.isLoading) {
    return (
      <div className="flex min-h-full flex-col">
        <PageHeader title={t('editVehiculo.title')} showBack />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
          <p className="text-text-secondary">{t('general.loading')}</p>
        </div>
      </div>
    )
  }

  if (vehiclesQuery.isError) {
    return (
      <div className="flex min-h-full flex-col">
        <PageHeader title={t('editVehiculo.title')} showBack />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
          <p className="text-text-secondary">{t('error.default')}</p>
          <Button variant="secondary" onClick={() => vehiclesQuery.refetch()}>
            {t('general.retry')}
          </Button>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="flex min-h-full flex-col">
        <PageHeader title={t('editVehiculo.title')} showBack />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
          <p className="text-text-secondary">{t('editVehiculo.notFound')}</p>
          <Link to="/mis-vehiculos">
            <Button variant="secondary">{t('editVehiculo.backToList')}</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!draft) {
    return null
  }

  const isSaving = saveMutation.isPending
  const isDeleting = deleteMutation.isPending
  const canSave = draft.photos.length > 0 && !isSaving && !isDeleting

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title={t('editVehiculo.title')} subtitle={t('editVehiculo.subtitle')} showBack />

      <div className="space-y-4 px-4 py-4">
        <Card className="overflow-hidden">
          <div className="aspect-16/10 overflow-hidden bg-surface-2">
            <img src={mainPhotoUrl} alt={`${vehicle.brand} ${vehicle.model}`} className="h-full w-full object-cover" />
          </div>
          <CardContent className="space-y-4 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="truncate">
                  {vehicle.brand} {vehicle.model} {vehicle.year}
                </CardTitle>
                <CardDescription className="mt-1">
                  {vehicle.city || vehicle.province
                    ? `${vehicle.city}${vehicle.city && vehicle.province ? ' · ' : ''}${vehicle.province}`
                    : t('editVehiculo.noLocation')}
                </CardDescription>
                <p className="mt-2 text-xs text-text-muted">{vehicle.plate}</p>
              </div>
              <Badge variant={draft.enabled ? 'success' : 'secondary'}>
                {draft.enabled ? t('misVehiculos.active') : t('misVehiculos.inactive')}
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-surface-2 px-4 py-3">
                <p className="text-xs text-text-muted">{t('editVehiculo.currentPrice')}</p>
                <p className="text-lg font-bold text-text-primary">{fmt.currency(Number(draft.basePrice || 0) * 100)}</p>
              </div>
              <div className="rounded-xl bg-surface-2 px-4 py-3">
                <p className="text-xs text-text-muted">{t('editVehiculo.field.availableFrom')}</p>
                <p className="text-lg font-bold text-text-primary">{draft.availableFrom}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div className="rounded-xl bg-surface-2 px-4 py-3">
                <p className="text-xs text-text-muted">{t('editVehiculo.field.color')}</p>
                <p className="font-semibold text-text-primary">{draft.color || '—'}</p>
              </div>
              <div className="rounded-xl bg-surface-2 px-4 py-3">
                <p className="text-xs text-text-muted">{t('editVehiculo.field.mileage')}</p>
                <p className="font-semibold text-text-primary">{draft.mileage || '—'}</p>
              </div>
              <div className="rounded-xl bg-surface-2 px-4 py-3">
                <p className="text-xs text-text-muted">{t('editVehiculo.field.isAccessible')}</p>
                <p className="font-semibold text-text-primary">{draft.isAccessible ? t('general.yes') : t('general.no')}</p>
              </div>
              <div className="rounded-xl bg-surface-2 px-4 py-3">
                <p className="text-xs text-text-muted">{t('editVehiculo.field.enabled')}</p>
                <p className="font-semibold text-text-primary">{draft.enabled ? t('misVehiculos.active') : t('misVehiculos.inactive')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('editVehiculo.photosTitle')}</CardTitle>
            <CardDescription>{t('editVehiculo.photosDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {draft.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {draft.photos.map(photo => (
                  <div key={photo.id} className="group relative overflow-hidden rounded-xl border border-white/8 bg-surface-2">
                    <div className="aspect-4/3 overflow-hidden">
                      <img
                        src={photo.url}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-linear-to-t from-black/70 to-transparent p-3">
                      <span className="text-xs font-semibold text-white">
                        {photo.kind === 'existing' ? t('editVehiculo.photoStored') : t('editVehiculo.photoNew')}
                      </span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemovePhoto(photo.id)}
                        disabled={isSaving || isDeleting}
                      >
                        {t('editVehiculo.removePhoto')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-white/10 bg-surface-2 px-4 py-6 text-sm text-text-secondary">
                {t('editVehiculo.noPhotos')}
              </p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoSelect}
            />
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSaving || isDeleting}
            >
              {t('editVehiculo.addPhotos')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('editVehiculo.formTitle')}</CardTitle>
            <CardDescription>{t('editVehiculo.formDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">{t('editVehiculo.field.color')}</label>
                <Input
                  value={draft.color}
                  onChange={e => handleFieldChange('color', e.target.value)}
                  placeholder={t('editVehiculo.field.color')}
                  disabled={isSaving || isDeleting}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">{t('editVehiculo.field.mileage')}</label>
                <Input
                  value={draft.mileage}
                  onChange={e => handleFieldChange('mileage', e.target.value)}
                  placeholder={t('editVehiculo.field.mileage')}
                  inputMode="numeric"
                  disabled={isSaving || isDeleting}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">{t('editVehiculo.field.basePrice')}</label>
                <Input
                  value={draft.basePrice}
                  onChange={e => handleFieldChange('basePrice', e.target.value)}
                  placeholder={t('editVehiculo.field.basePrice')}
                  inputMode="numeric"
                  disabled={isSaving || isDeleting}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">{t('editVehiculo.field.availableFrom')}</label>
                <Input
                  value={draft.availableFrom}
                  onChange={e => handleFieldChange('availableFrom', e.target.value)}
                  placeholder={t('editVehiculo.field.availableFrom')}
                  type="date"
                  disabled={isSaving || isDeleting}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">{t('editVehiculo.field.enabled')}</label>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full justify-between"
                  onClick={() => handleFieldChange('enabled', !draft.enabled)}
                  disabled={isSaving || isDeleting}
                >
                  <span>{draft.enabled ? t('misVehiculos.active') : t('misVehiculos.inactive')}</span>
                  <span>{t('general.edit')}</span>
                </Button>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">{t('editVehiculo.field.isAccessible')}</label>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full justify-between"
                  onClick={() => handleFieldChange('isAccessible', !draft.isAccessible)}
                  disabled={isSaving || isDeleting}
                >
                  <span>{draft.isAccessible ? t('general.yes') : t('general.no')}</span>
                  <span>{t('general.edit')}</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">{t('editVehiculo.field.city')}</label>
                <Input
                  value={draft.city}
                  onChange={e => handleFieldChange('city', e.target.value)}
                  placeholder={t('editVehiculo.field.city')}
                  disabled={isSaving || isDeleting}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">{t('editVehiculo.field.province')}</label>
                <Input
                  value={draft.province}
                  onChange={e => handleFieldChange('province', e.target.value)}
                  placeholder={t('editVehiculo.field.province')}
                  disabled={isSaving || isDeleting}
                />
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-text-secondary">{t('vehiculo.features')}</label>
              <div className="flex flex-wrap gap-2">
                {ALL_CHARACTERISTICS.map(char => {
                  const isSelected = draft.characteristics.includes(char)
                  return (
                    <button
                      key={char}
                      type="button"
                      onClick={() => toggleCharacteristic(char)}
                      disabled={isSaving || isDeleting}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                          : 'bg-surface-2 text-text-secondary hover:bg-surface-3 border border-white/5'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {getCharacteristicLabel(char)}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text-secondary">{t('editVehiculo.field.description')}</label>
              <textarea
                value={draft.description}
                onChange={e => handleFieldChange('description', e.target.value)}
                placeholder={t('editVehiculo.field.description')}
                rows={5}
                disabled={isSaving || isDeleting}
                className="min-h-32 w-full rounded-xl border border-white/8 bg-surface-2 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="sticky bottom-0 border-t border-white/6 bg-surface-0/95 px-4 py-4 backdrop-blur-xl">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Link to="/mis-vehiculos">
              <Button variant="secondary" className="w-full" disabled={isSaving || isDeleting}>
                {t('general.back')}
              </Button>
            </Link>
            <Button
              className="w-full"
              onClick={() => saveMutation.mutate()}
              disabled={!canSave}
            >
              {isSaving ? t('editVehiculo.uploadingPhotos') : t('general.save')}
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <p className="text-center text-xs text-text-muted sm:col-span-2">{t('editVehiculo.saveHint')}</p>
            <Button
              type="button"
              variant="destructive"
              className="w-full sm:col-span-2"
              onClick={() => {
                const confirmed = window.confirm(t('editVehiculo.deleteConfirm'))
                if (confirmed) {
                  deleteMutation.mutate()
                }
              }}
              disabled={isSaving || isDeleting}
            >
              {t('editVehiculo.deleteVehicle')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
