import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Image, X } from '@phosphor-icons/react'
import { Label } from '@/ui/label'
import { Textarea } from '@/ui/textarea'
import { Button } from '@/ui/button'
import { Drawer, DrawerContent } from '@/ui/drawer'
import { t } from '@/i18n/es'
import { ticketsApi } from '../api/tickets.api'
import { useCreateTicket } from '../hooks/useCreateTicket'

interface ReportarProblemaSheetProps {
  reservationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MAX_PHOTOS = 5

export function ReportarProblemaSheet({
  reservationId,
  open,
  onOpenChange,
}: ReportarProblemaSheetProps) {
  const [description, setDescription] = useState('')
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const mutation = useCreateTicket()
  const isBusy = uploading || mutation.isPending

  function handleClose() {
    if (isBusy) return
    setDescription('')
    setPhotoFiles([])
    setPhotoPreviews([])
    onOpenChange(false)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const remaining = MAX_PHOTOS - photoFiles.length
    const accepted = files.slice(0, remaining)
    setPhotoFiles((prev) => [...prev, ...accepted])
    accepted.forEach((f) => {
      const url = URL.createObjectURL(f)
      setPhotoPreviews((prev) => [...prev, url])
    })
    e.target.value = ''
  }

  function removePhoto(index: number) {
    URL.revokeObjectURL(photoPreviews[index])
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index))
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    if (!description.trim() || isBusy) return
    setUploading(true)
    let photoUrls: string[] = []
    try {
      photoUrls = await Promise.all(photoFiles.map((f) => ticketsApi.uploadPhoto(f)))
    } catch {
      toast.error(t('tickets.reportar.uploadError'))
      setUploading(false)
      return
    }
    setUploading(false)
    mutation.mutate(
      { reservationId, description: description.trim(), photoUrls },
      {
        onSuccess: () => {
          toast.success(t('tickets.reportar.success'))
          handleClose()
        },
        onError: (err: unknown) => {
          const code = (err as { code?: string })?.code
          if (code === 'TICKET_ALREADY_EXISTS') {
            toast.error(t('tickets.reportar.errorDuplicate'))
          } else {
            toast.error(t('error.default'))
          }
        },
      },
    )
  }

  const canSubmit = description.trim().length > 0 && !isBusy

  return (
    <Drawer open={open} onOpenChange={(next) => { if (!isBusy) onOpenChange(next) }}>
      <DrawerContent>
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <p className="font-semibold text-text-primary">{t('tickets.reportar.title')}</p>
          <button
            type="button"
            onClick={handleClose}
            disabled={isBusy}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-text-muted hover:text-text-primary disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-2 pb-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ticket-description">{t('tickets.reportar.descriptionLabel')}</Label>
            <Textarea
              id="ticket-description"
              placeholder={t('tickets.reportar.descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={4}
              disabled={isBusy}
              className="resize-none"
            />
            <p className="text-xs text-text-muted text-right">{description.length}/1000</p>
          </div>

          <div className="space-y-2">
            <Label>{t('tickets.reportar.fotosLabel')}</Label>
            <div className="flex flex-wrap gap-2">
              {photoPreviews.map((src, i) => (
                <div key={src} className="relative h-20 w-20 rounded-xl overflow-hidden">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    disabled={isBusy}
                    className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {photoFiles.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isBusy}
                  className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-white/20 text-text-muted hover:border-white/40 disabled:opacity-50"
                >
                  <Image className="h-6 w-6" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="border-t border-white/6 bg-surface-1 px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={handleClose} disabled={isBusy}>
              {t('general.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              {isBusy ? t('tickets.reportar.sending') : t('tickets.reportar.cta')}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
