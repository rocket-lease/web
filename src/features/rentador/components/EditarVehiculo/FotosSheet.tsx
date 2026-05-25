import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { GetVehicleResponse } from '@rocket-lease/contracts'
import { Button } from '@/ui/button'
import { t } from '@/i18n/es'
import { photosApi } from '@/features/photos/api/photos.api'
import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'
import { SectionSheet } from './SectionSheet'

interface FotosSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: GetVehicleResponse
}

type EditablePhoto = {
  id: string
  kind: 'existing' | 'new'
  url: string
  file?: File
  previewUrl?: string
}

const MAX_PHOTOS = 10
const myVehiclesQueryKey = ['vehicles', 'mine'] as const
const vehicleQueryKey = (vehicleId: string) => ['vehicles', vehicleId] as const

function isNewPhoto(photo: EditablePhoto): photo is EditablePhoto & { kind: 'new'; file: File; previewUrl: string } {
  return photo.kind === 'new'
}

function revokePreviews(photos: EditablePhoto[]) {
  photos.filter(isNewPhoto).forEach((p) => URL.revokeObjectURL(p.previewUrl))
}

export function FotosSheet({ open, onOpenChange, vehicle }: FotosSheetProps) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<EditablePhoto[]>([])

  useEffect(() => {
    if (open) {
      setPhotos(vehicle.photos.map((url) => ({ id: url, kind: 'existing', url })))
    }
    return () => {
      if (!open) revokePreviews(photos)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, vehicle.photos])

  useEffect(() => {
    return () => revokePreviews(photos)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePhotoSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return
    event.target.value = ''

    const remainingSlots = MAX_PHOTOS - photos.length
    if (remainingSlots <= 0) {
      toast.error(t('editVehiculo.photoLimit'))
      return
    }

    const accepted = files.slice(0, remainingSlots)
    if (accepted.length < files.length) toast.error(t('editVehiculo.photoLimit'))

    const newPhotos: EditablePhoto[] = accepted.map((file) => {
      const previewUrl = URL.createObjectURL(file)
      return { id: crypto.randomUUID(), kind: 'new', url: previewUrl, file, previewUrl }
    })

    setPhotos((prev) => [...prev, ...newPhotos])
  }

  const handleRemove = (id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id)
      if (target?.kind === 'new' && target.previewUrl) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((p) => p.id !== id)
    })
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const newOnes = photos.filter(isNewPhoto)
      const uploaded: Array<{ url: string; publicId: string }> = []
      try {
        for (const photo of newOnes) {
          uploaded.push(await photosApi.uploadVehicleImage(photo.file))
        }
      } catch (error) {
        await Promise.allSettled(uploaded.map((p) => photosApi.deleteVehicleImage(p.publicId)))
        throw error
      }

      let uploadedIdx = 0
      const finalUrls = photos.map((p) => {
        if (p.kind === 'existing') return p.url
        const url = uploaded[uploadedIdx]?.url
        uploadedIdx += 1
        return url
      })

      await vehiclesApi.updateVehicle(vehicle.id, { photos: finalUrls })

      const removedUrls = vehicle.photos.filter((url) => !photos.some((p) => p.url === url))
      await Promise.allSettled(removedUrls.map((url) => photosApi.deleteVehicleImage(url)))

      return finalUrls
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myVehiclesQueryKey })
      queryClient.invalidateQueries({ queryKey: vehicleQueryKey(vehicle.id) })
      revokePreviews(photos)
      toast.success(t('editVehiculo.saveSuccess'))
      onOpenChange(false)
    },
    onError: () => toast.error(t('editVehiculo.saveError')),
  })

  const hasNewPhotos = photos.some(isNewPhoto)
  const canSave = photos.length >= 3
  const isPending = mutation.isPending

  return (
    <SectionSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('editVehiculo.photosTitle')}
      description={t('editVehiculo.photosDescription')}
      isSaving={isPending}
      canSave={canSave}
      onSave={() => mutation.mutate()}
    >
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo) => (
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
                  onClick={() => handleRemove(photo.id)}
                  disabled={isPending}
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
      {photos.length < 3 && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          {t('editVehiculo.photoMinimumHint')} ({photos.length}/3)
        </p>
      )}
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={() => fileInputRef.current?.click()}
        disabled={isPending}
      >
        {hasNewPhotos && isPending ? t('editVehiculo.uploadingPhotos') : t('editVehiculo.addPhotos')}
      </Button>
    </SectionSheet>
  )
}
