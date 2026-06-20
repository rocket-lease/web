import { useEffect, useMemo, useRef, useState } from 'react'
import { PageLoader } from '@/ui/page-loader'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowClockwise,
  CheckCircle,
  Clock,
  CloudArrowUp,
  FileText,
  ShieldCheck,
  WarningCircle,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { t } from '@/i18n/es'
import { getErrorMessage } from '@/lib/error-mapper'
import { useVehicleDocuments } from '../hooks/useVehicleDocuments'

interface VehicleDocumentsPageProps {
  vehicleId: string
}

type SelectedDocument = {
  file: File
  previewUrl: string
}

export function VehicleDocumentsPage({ vehicleId }: VehicleDocumentsPageProps) {
  const navigate = useNavigate()
  const { verification, isLoading, isSubmitting, submitDocuments, refetch } =
    useVehicleDocuments(vehicleId)

  const [titleDoc, setTitleDoc] = useState<SelectedDocument | null>(null)
  const [greenCard, setGreenCard] = useState<SelectedDocument | null>(null)
  const titleRef = useRef<HTMLInputElement | null>(null)
  const greenCardRef = useRef<HTMLInputElement | null>(null)

  const previewUrls = useMemo(
    () => [titleDoc?.previewUrl, greenCard?.previewUrl].filter(Boolean) as string[],
    [titleDoc?.previewUrl, greenCard?.previewUrl],
  )

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previewUrls])

  const status = verification?.status ?? 'none'

  const handlePick = (
    setter: (value: SelectedDocument | null) => void,
    file?: File,
  ) => {
    if (!file) return
    const previewUrl = URL.createObjectURL(file)
    setter({ file, previewUrl })
  }

  const handleSubmit = async () => {
    if (!titleDoc || !greenCard) return

    try {
      await submitDocuments({
        title: titleDoc.file,
        greenCard: greenCard.file,
      })

      toast.success(t('documentosVehiculo.toast.submitted'))
      await refetch()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (isLoading || !verification) {
    return (
      <div className="flex flex-col min-h-full bg-surface-0">
        <PageHeader title={t('documentosVehiculo.title')} showBack />
        <PageLoader />
      </div>
    )
  }

  if (status === 'verified') {
    return (
      <div className="flex min-h-full flex-col bg-surface-0">
        <PageHeader title={t('documentosVehiculo.title')} showBack />
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-bg text-success">
            <ShieldCheck size={32} weight="duotone" />
          </div>
          <div className="mt-5 max-w-sm space-y-2">
            <h1 className="text-2xl font-bold text-text-primary">
              {t('documentosVehiculo.status.verified')}
            </h1>
            <p className="text-sm leading-relaxed text-text-muted">
              {t('documentosVehiculo.verified.copy')}
            </p>
          </div>
          <Button
            className="mt-8 w-full max-w-sm"
            onClick={() => navigate({ to: '/mis-vehiculos' })}
          >
            {t('documentosVehiculo.verified.cta')}
          </Button>
        </div>
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div className="flex min-h-full flex-col bg-surface-0">
        <PageHeader title={t('documentosVehiculo.title')} showBack />
        <div className="flex-1 px-4 py-6">
          <div className="rounded-3xl border border-warning/20 bg-linear-to-b from-warning-bg to-surface-1 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-warning-bg text-warning">
                <Clock size={22} weight="duotone" />
              </div>
              <div className="flex-1">
                <Badge variant="warning">{t('documentosVehiculo.status.pending')}</Badge>
                <h1 className="mt-3 text-2xl font-bold text-text-primary">
                  {t('documentosVehiculo.pending.title')}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {t('documentosVehiculo.pending.copy')}
                </p>
              </div>
            </div>
          </div>
          <Button
            className="mt-6 w-full"
            variant="secondary"
            onClick={() => navigate({ to: '/mis-vehiculos' })}
          >
            {t('identidad.pending.exit')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col bg-surface-0">
      <PageHeader title={t('documentosVehiculo.title')} showBack />

      <div className="px-4 py-5">
        <div className="rounded-3xl border border-white/8 bg-linear-to-b from-surface-1 to-surface-0 p-5 shadow-lg shadow-black/10">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600/20 text-brand-300">
              <FileText size={24} weight="duotone" />
            </div>
            <div className="flex-1">
              <Badge variant={status === 'rejected' ? 'danger' : 'secondary'}>
                {t(`documentosVehiculo.status.${status}`)}
              </Badge>
              <h1 className="mt-3 text-2xl font-bold text-text-primary">
                {t('documentosVehiculo.form.title')}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {status === 'rejected'
                  ? t('documentosVehiculo.rejected.copy')
                  : t('documentosVehiculo.form.copy')}
              </p>
            </div>
          </div>

          {status === 'rejected' && verification.rejectionReason && (
            <div className="mt-5 rounded-2xl border border-danger/20 bg-danger-bg p-4 text-sm text-danger">
              <div className="flex items-center gap-2 font-semibold">
                <WarningCircle size={18} weight="duotone" />
                {t('documentosVehiculo.rejected.reasonTitle')}
              </div>
              <p className="mt-2 leading-relaxed text-text-primary">
                {verification.rejectionReason}
              </p>
            </div>
          )}

          <div className="mt-5 space-y-4">
            <UploadField
              label={t('documentosVehiculo.form.titleDoc')}
              helper={t('documentosVehiculo.form.titleHelper')}
              inputRef={titleRef}
              preview={titleDoc?.previewUrl}
              fileName={titleDoc?.file.name}
              onPick={(file) => handlePick(setTitleDoc, file)}
            />
            <UploadField
              label={t('documentosVehiculo.form.greenCard')}
              helper={t('documentosVehiculo.form.greenCardHelper')}
              inputRef={greenCardRef}
              preview={greenCard?.previewUrl}
              fileName={greenCard?.file.name}
              onPick={(file) => handlePick(setGreenCard, file)}
            />
          </div>

          <div className="mt-5 rounded-2xl border border-info/15 bg-info-bg p-4 text-sm text-text-secondary">
            <div className="flex items-center gap-2 font-semibold text-info">
              <WarningCircle size={18} weight="duotone" />
              {t('identidad.form.noteTitle')}
            </div>
            <p className="mt-2 leading-relaxed">
              {t('identidad.form.noteCopy')}
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <Button
              size="lg"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting || !titleDoc || !greenCard}
              className="w-full"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <ArrowClockwise size={18} className="animate-spin" />
                  {t('documentosVehiculo.form.submitting')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <CloudArrowUp size={18} weight="duotone" />
                  {status === 'rejected'
                    ? t('identidad.form.retry')
                    : t('documentosVehiculo.form.submit')}
                </span>
              )}
            </Button>

            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => navigate({ to: '/mis-vehiculos' })}
            >
              {t('documentosVehiculo.form.exit')}
            </Button>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/8 bg-surface-2 p-4 text-sm text-text-secondary">
            <CheckCircle size={18} className="mt-0.5 text-success" weight="duotone" />
            <p>{t('documentosVehiculo.form.acceptedCopy')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface UploadFieldProps {
  label: string
  helper: string
  inputRef: React.RefObject<HTMLInputElement | null>
  preview?: string
  fileName?: string
  onPick: (file?: File) => void
}

function UploadField({ label, helper, inputRef, preview, fileName, onPick }: UploadFieldProps) {
  return (
    <div className="rounded-2xl border border-white/8 bg-surface-2 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">{label}</p>
          <p className="mt-1 text-xs leading-relaxed text-text-muted">{helper}</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => onPick(event.target.files?.[0])}
        />
        <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
          {t('identidad.form.pickFile')}
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-white/10 bg-surface-0 p-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600/15 text-brand-300">
          <CloudArrowUp size={24} weight="duotone" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text-primary">
            {fileName ?? t('identidad.form.noFile')}
          </p>
          <p className="text-xs text-text-muted">{t('identidad.form.fileHint')}</p>
        </div>
        {preview && (
          <img src={preview} alt={label} className="h-12 w-12 rounded-lg object-cover" />
        )}
      </div>
    </div>
  )
}
