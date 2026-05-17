import { Zap } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { VerificationStatusSection } from '@/features/auth/components/VerificationStatusSection'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'
import { t } from '@/i18n/es'

/**
 * Panel de configuración del usuario. Agrupa preferencias y opciones de
 * comportamiento que no son identidad pública (esa vive en `/perfil`):
 *
 * - Cuenta y seguridad: estado de verificación de los canales (email, etc.).
 * - Rentador: preferencias de hosting como auto-aceptación de reservas.
 *
 * A medida que crezca (notificaciones, privacidad, payouts, modo vacaciones,
 * etc.), las secciones se parten en sub-rutas. Hoy una sola página con
 * secciones es suficiente.
 */
export function ConfiguracionPage() {
  const { data: profile, isLoading, updateProfile, isUpdating } = useMyProfile()

  const handleToggleAutoAccept = async (next: boolean) => {
    if (!profile) return
    try {
      await updateProfile({
        name: profile.name,
        phone: profile.phone,
        avatarUrl: profile.avatarUrl,
        preferences: profile.preferences,
        autoAccept: next,
      })
      toast.success(t('perfil.saveSuccess'))
    } catch {
      toast.error(t('error.default'))
    }
  }

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col">
        <PageHeader title={t('configuracion.title')} showBack />
        <div className="px-4 py-8 text-sm text-text-muted">{t('general.loading')}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <PageHeader title={t('configuracion.title')} showBack />

      <p className="px-4 mt-5 text-xs font-medium text-text-muted uppercase tracking-wider">
        {t('configuracion.section.cuenta')}
      </p>
      <VerificationStatusSection />

      <p className="px-4 mt-6 text-xs font-medium text-text-muted uppercase tracking-wider">
        {t('configuracion.section.rentador')}
      </p>
      <div className="px-4 mt-3">
        <div className="rounded-2xl bg-surface-1 border border-white/6 px-4 py-4 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-400">
            <Zap className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-text-primary">
              {t('perfil.autoAccept.label')}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {t('perfil.autoAccept.descripcion')}
            </p>
          </div>
          <AutoAcceptToggle
            checked={profile.autoAccept}
            disabled={isUpdating}
            onChange={handleToggleAutoAccept}
          />
        </div>
      </div>
    </div>
  )
}

interface AutoAcceptToggleProps {
  checked: boolean
  disabled?: boolean
  onChange: (next: boolean) => void
}

/**
 * Toggle visual estilo iOS para el flag `autoAccept` del perfil. Usa
 * `aria-pressed` para que screen readers anuncien el estado y queda
 * disabled mientras la mutación está en vuelo.
 *
 * @param checked - Valor actual del flag.
 * @param disabled - Si la mutación está en vuelo, deshabilita el botón.
 * @param onChange - Handler que recibe el siguiente valor al togglear.
 */
function AutoAcceptToggle({ checked, disabled, onChange }: AutoAcceptToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={t('perfil.autoAccept.label')}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? 'bg-brand-500' : 'bg-surface-3'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}
