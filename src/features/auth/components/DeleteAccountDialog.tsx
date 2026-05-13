import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Trash2, AlertTriangle, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { authApi } from '../api/auth.api'
import { t } from '@/i18n/es'

const CONFIRM_WORD = 'ELIMINAR'

interface Props {
  open: boolean
  onClose: () => void
}

export function DeleteAccountDialog({ open, onClose }: Props) {
  const navigate = useNavigate()
  const [confirmText, setConfirmText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const canDelete = confirmText.trim().toUpperCase() === CONFIRM_WORD

  const handleConfirm = async () => {
    if (!canDelete) return
    setSubmitting(true)
    try {
      await authApi.deleteAccount()
      toast.success(t('perfil.deleteAccount.success'))
      navigate({ to: '/login' })
    } catch (err) {
      const status = (err as { statusCode?: number })?.statusCode
      if (status === 409) {
        toast.error(t('perfil.deleteAccount.hasVehicles'), { duration: 6000 })
      } else {
        toast.error(t('error.default'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6 overflow-y-auto"
      style={{ minHeight: '100dvh' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-surface-1 border border-danger/30 p-6 shadow-elevated my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/20 text-danger">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-text-primary">
              {t('perfil.deleteAccount.title')}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {t('perfil.deleteAccount.warning')}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="text-text-muted hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-xl bg-danger/10 border border-danger/20 px-3 py-3 mb-4">
          <p className="text-xs text-text-secondary">
            {t('perfil.deleteAccount.consequences')}
          </p>
        </div>

        <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">
          {t('perfil.deleteAccount.confirmPrompt').replace('{word}', CONFIRM_WORD)}
        </label>
        <Input
          autoComplete="off"
          placeholder={CONFIRM_WORD}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
        />

        <div className="mt-5 flex flex-col gap-2">
          <Button
            variant="destructive"
            disabled={!canDelete || submitting}
            onClick={handleConfirm}
            className="w-full"
          >
            <Trash2 className="h-4 w-4" />
            {submitting ? t('perfil.deleteAccount.deleting') : t('perfil.deleteAccount.confirm')}
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            {t('general.cancel')}
          </Button>
        </div>
      </div>
    </div>
  )
}
