import { useState, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import {
  CheckCircle,
  ChevronRight,
  LogOut,
  Mail,
  Trash2,
  Zap,
} from 'lucide-react'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { DeleteAccountDialog } from '@/features/auth/components/DeleteAccountDialog'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useVerificationStatus } from '@/features/auth/hooks/useVerificationStatus'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'
import { useToggleAutoAccept } from '@/features/configuracion/hooks/useToggleAutoAccept'
import { t } from '@/i18n/es'

/**
 * Panel de configuración del usuario. Agrupa preferencias y opciones de
 * comportamiento que no son identidad pública (esa vive en `/perfil`):
 *
 * - Cuenta y seguridad: verificación de canales, cerrar sesión, eliminar cuenta.
 * - Rentador: preferencias de hosting como auto-aceptación de reservas.
 *
 * A medida que crezca (notificaciones, privacidad, payouts, modo vacaciones,
 * etc.), las secciones se parten en sub-rutas. Hoy una sola página con
 * secciones es suficiente.
 */
export function ConfiguracionPage() {
  const { signOut } = useAuth()
  const { data: profile, isLoading } = useMyProfile()
  const { status: verification, loading: verificationLoading } = useVerificationStatus()
  const { toggle: toggleAutoAccept } = useToggleAutoAccept()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col">
        <PageHeader title={t('configuracion.title')} showBack />
        <div className="px-4 py-8 text-sm text-text-muted">{t('general.loading')}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-6">
      <PageHeader title={t('configuracion.title')} showBack />

      <Section title={t('configuracion.section.seguridad')}>
        {verificationLoading ? (
          <div className="h-12 rounded-xl bg-surface-1 animate-pulse" />
        ) : verification?.email ? (
          <SettingsRow
            leading={<Mail className="h-5 w-5" />}
            label={t('auth.verify.emailSection')}
            trailing={
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                <CheckCircle className="h-3.5 w-3.5" />
                {t('auth.verify.verified')}
              </span>
            }
          />
        ) : (
          <SettingsRow
            asLink="/verificar"
            linkSearch={{ channel: 'email' as const }}
            leading={<Mail className="h-5 w-5" />}
            label={t('auth.verify.emailSection')}
            trailing={
              <span className="text-xs font-semibold text-warning">
                {t('configuracion.verify.pending')}
              </span>
            }
            showChevron
          />
        )}
      </Section>

      <Section title={t('configuracion.section.rentador')}>
        <SettingsRow
          leading={<Zap className="h-5 w-5" />}
          label={t('perfil.autoAccept.label')}
          trailing={
            <AutoAcceptToggle
              checked={profile.autoAccept}
              onChange={toggleAutoAccept}
            />
          }
        />
      </Section>

      <Section title={t('configuracion.section.cuenta')}>
        <SettingsRow
          leading={<LogOut className="h-5 w-5" />}
          label={t('perfil.logout')}
          onClick={async () => {
            try {
              await signOut()
            } finally {
              window.location.href = '/buscar'
            }
          }}
          showChevron
        />
        <SettingsRow
          leading={<Trash2 className="h-5 w-5" />}
          label={t('perfil.deleteAccount')}
          onClick={() => setShowDeleteDialog(true)}
          showChevron
        />
      </Section>

      <DeleteAccountDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      />
    </div>
  )
}

interface SectionProps {
  title: string
  children: ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="px-4 mt-6">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

interface SettingsRowProps {
  leading: ReactNode
  label: string
  trailing?: ReactNode
  onClick?: () => void
  asLink?: string
  linkSearch?: Record<string, string>
  showChevron?: boolean
  danger?: boolean
}

/**
 * Fila de un panel de configuración. Layout `[icon] label [trailing] [chevron?]`
 * con hover state si es interactiva (link u onClick). Variant `danger` usa
 * color de texto destructive para acciones sensibles (eliminar cuenta).
 */
function SettingsRow({
  leading,
  label,
  trailing,
  onClick,
  asLink,
  linkSearch,
  showChevron,
  danger,
}: SettingsRowProps) {
  const interactive = onClick !== undefined || asLink !== undefined
  const labelColor = danger ? 'text-danger' : 'text-text-primary'
  const iconColor = danger ? 'text-danger' : 'text-text-secondary'
  const className = `flex w-full items-center gap-3 rounded-xl px-3 py-3.5 ${
    interactive ? 'hover:bg-surface-2 transition-colors text-left' : ''
  }`

  const content = (
    <>
      <span className={`shrink-0 ${iconColor}`}>{leading}</span>
      <span className={`flex-1 text-left text-sm font-medium ${labelColor}`}>{label}</span>
      {trailing}
      {showChevron && <ChevronRight className="h-4 w-4 text-text-muted shrink-0" />}
    </>
  )

  if (asLink) {
    return (
      <Link to={asLink} search={linkSearch} className={className}>
        {content}
      </Link>
    )
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    )
  }
  return <div className={className}>{content}</div>
}

interface AutoAcceptToggleProps {
  checked: boolean
  disabled?: boolean
  onChange: (next: boolean) => void
}

/**
 * Toggle visual estilo iOS para el flag `autoAccept` del perfil. Usa
 * `aria-checked` para que screen readers anuncien el estado y queda
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
          checked ? 'translate-x-5.5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}
