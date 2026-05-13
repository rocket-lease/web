import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  LogOut,
  Bell,
  ChevronRight,
  Shield,
  Star,
  Award,
  Settings,
  Rocket,
  Save,
  Pencil,
  X,
  Trash2,
  UserCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import type { UpdateMyProfileRequest } from '@/features/perfil/types/profile.contract'
import { Avatar } from '@/ui/avatar'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Separator } from '@/ui/separator'
import { Input } from '@/ui/input'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useVerificationStatus } from '@/features/auth/hooks/useVerificationStatus'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'
import { DeleteAccountDialog } from '@/features/auth/components/DeleteAccountDialog'
import { VerificationStatusSection } from '@/features/auth/components/VerificationStatusSection'
import { t } from '@/i18n/es'

const levelColors: Record<string, string> = {
  bronze: 'text-amber-600',
  silver: 'text-slate-300',
  gold: 'text-yellow-400',
  platinum: 'text-cyan-300',
}

const levelLabels: Record<string, string> = {
  bronze: t('perfil.level.bronze'),
  silver: t('perfil.level.silver'),
  gold: t('perfil.level.gold'),
  platinum: t('perfil.level.platinum'),
}

interface PerfilPageProps {
  profileId?: string
}

export function PerfilPage({ profileId }: PerfilPageProps) {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const {
    data: profile,
    isLoading,
    isOwnProfile,
    updateProfile,
    isUpdating,
    uploadAvatar,
    isUploadingAvatar,
  } = useMyProfile(profileId)
  const { status: verificationStatus, loading: verificationLoading } = useVerificationStatus()
  const isFullyVerified = !!verificationStatus?.email

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [maxPriceDaily, setMaxPriceDaily] = useState('')
  const [accessibilityCsv, setAccessibilityCsv] = useState('')
  const [transmission, setTransmission] = useState<'automatic' | 'manual' | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!profile) return
    setName(profile.name)
    setPhone(profile.phone)
    setMaxPriceDaily(profile.preferences.maxPriceDaily?.toString() ?? '')
    setAccessibilityCsv(profile.preferences.accessibility.join(', '))
    setTransmission(profile.preferences.transmission)
  }, [profile])

  const reviewCount = useMemo(() => {
    if (!profile) return 0
    return Math.max(0, Math.round(profile.reputationScore * 10))
  }, [profile])

  const isRentador = useMemo(() => user?.user_metadata?.is_rentador === true, [user])
  const canEdit = isOwnProfile || user?.id === profile?.id
  const currentAvatarSrc = avatarPreviewUrl ?? profile?.avatarUrl

  useEffect(() => {
    if (!selectedAvatarFile) {
      setAvatarPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(selectedAvatarFile)
    setAvatarPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedAvatarFile])

  const handleSave = async () => {
    if (!profile) return

    const payload: UpdateMyProfileRequest = {
      name: name.trim(),
      phone: phone.trim(),
      avatarUrl: profile.avatarUrl,
      preferences: {
        transmission,
        accessibility: accessibilityCsv
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        maxPriceDaily: maxPriceDaily.trim().length > 0 ? Number(maxPriceDaily) : null,
      },
    }

    try {
      await updateProfile(payload)
      toast.success(t('perfil.saveSuccess'))
      setIsEditing(false)
    } catch {
      toast.error(t('error.default'))
    }
  }

  const handleUploadAvatar = async () => {
    if (!selectedAvatarFile) return
    try {
      await uploadAvatar(selectedAvatarFile)
      setSelectedAvatarFile(null)
      setAvatarPreviewUrl(null)
      toast.success(t('perfil.saveSuccess'))
    } catch {
      toast.error(t('error.default'))
    }
  }

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col">
        <PageHeader title={t('perfil.title')} />
        <div className="px-4 py-8 text-sm text-text-muted">{t('general.loading')}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <PageHeader title={t('perfil.title')} />

      {/* Profile hero */}
      <div className="px-4 py-6 flex flex-col items-center text-center gap-3">
        <div className="relative">
          <Avatar
            src={currentAvatarSrc}
            fallback={profile.name}
            size="xl"
            className="ring-2 ring-brand-600/40 ring-offset-2 ring-offset-surface-0"
          />
          {canEdit && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  setSelectedAvatarFile(event.target.files?.[0] ?? null)
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white shadow"
                aria-label="Editar foto de perfil"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">{profile.name}</h2>
          <p className="text-sm text-text-muted">{profile.email}</p>
        </div>
        {canEdit && selectedAvatarFile && (
          <Button onClick={handleUploadAvatar} disabled={isUploadingAvatar}>
            <Save className="h-4 w-4" />
            {isUploadingAvatar ? t('perfil.saving') : 'Guardar foto'}
          </Button>
        )}

        {/* Level + reputation */}
        <div className="flex items-center gap-4 mt-1">
          <div className="flex items-center gap-1.5">
            <Award className={`h-4 w-4 ${levelColors[profile.level]}`} />
            <span className="text-sm font-semibold text-text-primary">{levelLabels[profile.level]}</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="text-sm font-semibold text-text-primary">{profile.reputationScore}</span>
            <span className="text-xs text-text-muted">({reviewCount})</span>
          </div>
        </div>

        {!verificationLoading && (
          <Badge variant={isFullyVerified ? 'success' : 'warning'}>
            <UserCheck className="h-3 w-3" />
            {isFullyVerified ? t('perfil.verified') : t('perfil.pendingVerification')}
          </Badge>
        )}

      </div>

      <Separator />

      {canEdit && <VerificationStatusSection />}

      <div className="px-4 mt-5 space-y-4">
        {canEdit && !isEditing && (
          <div className="flex justify-center">
            <Button onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4" />
              {t('perfil.editProfile')}
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {/* Info básica */}
          <div className="rounded-2xl bg-surface-1 border border-white/6 divide-y divide-white/6">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-text-muted w-28 shrink-0">{t('perfil.form.name')}</span>
              {isEditing
                ? <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('perfil.form.name')} className="ml-4 flex-1 rounded-lg border border-white/8 bg-surface-2 px-3 h-8 text-sm text-right text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-600/60" />
                : <span className="text-sm font-medium text-text-primary">{profile.name}</span>
              }
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-text-muted w-28 shrink-0">{t('perfil.form.phone')}</span>
              {isEditing
                ? <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('perfil.form.phone')} className="ml-4 flex-1 rounded-lg border border-white/8 bg-surface-2 px-3 h-8 text-sm text-right text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-600/60" />
                : <span className="text-sm font-medium text-text-primary">{profile.phone || '—'}</span>
              }
            </div>
          </div>

          {/* Mis preferencias */}
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3 text-center">
              {t('perfil.preferences')}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {/* Transmisión */}
              <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-surface-1 border border-white/6 px-3 py-4 text-center">
                <span className="text-[10px] text-text-muted uppercase tracking-wider">{t('perfil.form.transmissionPreference')}</span>
                {isEditing ? (
                  <div className="flex flex-col gap-1 w-full">
                    {([
                      { key: null, label: t('buscar.filter.transmission.all') },
                      { key: 'automatic', label: t('buscar.filter.transmission.automatic') },
                      { key: 'manual', label: t('buscar.filter.transmission.manual') },
                    ] as const).map((option) => (
                      <button
                        key={String(option.key)}
                        type="button"
                        onClick={() => setTransmission(option.key)}
                        className={`rounded-full px-2 py-1 text-[10px] font-medium transition-colors ${transmission === option.key ? 'bg-brand-600 text-white' : 'bg-surface-2 text-text-secondary'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-text-primary">
                    {transmission === 'automatic'
                      ? t('buscar.filter.transmission.automatic')
                      : transmission === 'manual'
                        ? t('buscar.filter.transmission.manual')
                        : t('buscar.filter.transmission.all')}
                  </span>
                )}
              </div>

              {/* Precio máximo */}
              <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-surface-1 border border-white/6 px-3 py-4 text-center">
                <span className="text-[10px] text-text-muted uppercase tracking-wider">{t('perfil.form.maxPriceDaily')}</span>
                {isEditing ? (
                  <Input
                    type="number"
                    value={maxPriceDaily}
                    onChange={(e) => setMaxPriceDaily(e.target.value)}
                    placeholder="—"
                    min={0}
                    className="h-8 text-center px-1"
                  />
                ) : (
                  <span className="text-sm font-semibold text-text-primary">{maxPriceDaily ? `$${maxPriceDaily}` : '—'}</span>
                )}
              </div>

              {/* Accesibilidad */}
              <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-surface-1 border border-white/6 px-3 py-4 text-center">
                <span className="text-[10px] text-text-muted uppercase tracking-wider">{t('perfil.form.accessibility')}</span>
                {isEditing ? (
                  <Input
                    value={accessibilityCsv}
                    onChange={(e) => setAccessibilityCsv(e.target.value)}
                    placeholder="—"
                    className="h-8 text-center px-1"
                  />
                ) : (
                  <span className="text-sm font-semibold text-text-primary">{accessibilityCsv || '—'}</span>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-2 justify-center">
              <Button onClick={handleSave} disabled={isUpdating}>
                <Save className="h-4 w-4" />
                {isUpdating ? t('perfil.saving') : t('general.save')}
              </Button>
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4" />
                {t('general.cancel')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mis vehiculos shortcut */}
      {canEdit && (
        <button
          type="button"
          onClick={() => navigate({ to: '/mis-vehiculos' })}
          className="mx-4 mt-4 rounded-2xl bg-gradient-to-r from-brand-900 to-brand-800 border border-brand-700/30 p-4 flex items-center gap-3 w-[calc(100%-2rem)] text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">Mis vehículos</p>
            <p className="text-xs text-text-muted mt-0.5">Gestioná tu flota o publicá uno nuevo</p>
          </div>
          <ChevronRight className="h-4 w-4 text-brand-400 shrink-0" />
        </button>
      )}

      {/* Settings menu */}
      <div className="px-4 mt-5 space-y-1">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">{t('perfil.settings')}</p>

        {[
          { icon: Bell, label: t('perfil.notifications') },
          { icon: Shield, label: t('perfil.verification') },
          { icon: Settings, label: 'Configuración' },
        ].map(item => (
          <button
            key={item.label}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 hover:bg-surface-2 transition-colors text-text-secondary"
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="flex-1 text-left text-sm font-medium text-text-primary">{item.label}</span>
            <ChevronRight className="h-4 w-4 text-text-muted" />
          </button>
        ))}
      </div>

      {/* Logout + Delete */}
      {canEdit && (
        <div className="px-4 mt-6 mb-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full text-text-secondary hover:bg-surface-2"
            onClick={async () => {
              await signOut()
              navigate({ to: '/login' })
            }}
          >
            <LogOut className="h-4 w-4" />
            {t('perfil.logout')}
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
            {t('perfil.deleteAccount')}
          </Button>
        </div>
      )}

      <DeleteAccountDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      />
    </div>
  )
}
