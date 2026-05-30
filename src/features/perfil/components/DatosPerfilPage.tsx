import { useEffect, useMemo, useRef, useState } from 'react'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import type { UpdateMyProfileRequest } from '@rocket-lease/contracts'
import { Button } from '@/ui/button'
import { Avatar } from '@/ui/avatar'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'
import { t } from '@/i18n/es'
import { Pencil } from '@phosphor-icons/react'

export function DatosPerfilPage() {
  const {
    data: profile,
    isLoading,
    updateProfile,
    isUpdating,
    uploadAvatar,
    isUploadingAvatar,
  } = useMyProfile()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [maxPriceDaily, setMaxPriceDaily] = useState('')
  const [transmission, setTransmission] = useState<'automatic' | 'manual' | null>(null)
  const [syncedProfileId, setSyncedProfileId] = useState<string | null>(null)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  if (profile && profile.id !== syncedProfileId) {
    setSyncedProfileId(profile.id)
    setName(profile.name)
    setPhone(profile.phone)
    setMaxPriceDaily(profile.preferences.maxPriceDaily?.toString() ?? '')
    setTransmission(profile.preferences.transmission)
  }

  const avatarPreviewUrl = useMemo(
    () => (selectedAvatarFile ? URL.createObjectURL(selectedAvatarFile) : null),
    [selectedAvatarFile],
  )

  useEffect(() => {
    if (!avatarPreviewUrl) return
    return () => URL.revokeObjectURL(avatarPreviewUrl)
  }, [avatarPreviewUrl])

  const currentAvatarSrc = avatarPreviewUrl ?? profile?.avatarUrl

  const handleSaveAvatar = async () => {
    if (!selectedAvatarFile) return
    try {
      await uploadAvatar(selectedAvatarFile)
      setSelectedAvatarFile(null)
      toast.success(t('perfil.saveSuccess'))
    } catch {
      toast.error(t('error.default'))
    }
  }

  const handleSave = async () => {
    if (!profile) return
    const payload: UpdateMyProfileRequest = {
      name: name.trim(),
      phone: phone.trim(),
      avatarUrl: profile.avatarUrl,
      preferences: {
        transmission,
        accessibility: profile.preferences.accessibility,
        maxPriceDaily: maxPriceDaily.trim().length > 0 ? Number(maxPriceDaily) : null,
      },
      autoAccept: profile.autoAccept,
    }
    try {
      await updateProfile(payload)
      toast.success(t('perfil.saveSuccess'))
    } catch {
      toast.error(t('error.default'))
    }
  }

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col">
        <PageHeader title={t('perfil.datos.title')} showBack />
        <div className="px-4 py-8 text-sm text-text-muted">{t('general.loading')}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-24">
      <PageHeader title={t('perfil.datos.title')} showBack />

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3 px-4 py-6">
        <div className="relative">
          <Avatar
            src={currentAvatarSrc}
            fallback={profile.name}
            size="xl"
            className="ring-2 ring-brand-600/40 ring-offset-2 ring-offset-surface-0"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setSelectedAvatarFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white shadow"
            aria-label="Cambiar foto de perfil"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>

        {selectedAvatarFile ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedAvatarFile(null)}
              disabled={isUploadingAvatar}
            >
              {t('general.cancel')}
            </Button>
            <Button size="sm" onClick={handleSaveAvatar} disabled={isUploadingAvatar}>
              {isUploadingAvatar ? t('perfil.saving') : 'Guardar foto'}
            </Button>
          </div>
        ) : (
          <button
            type="button"
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            Cambiar foto de perfil
          </button>
        )}
      </div>

      {/* Form */}
      <div className="px-4 space-y-4">

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-muted px-1">{t('perfil.form.name')}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-white/8 bg-surface-1 px-4 h-11 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-600/60 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-muted px-1">{t('perfil.form.email')}</label>
          <input
            value={profile.email}
            readOnly
            className="w-full rounded-xl border border-white/5 bg-surface-1/50 px-4 h-11 text-sm text-text-muted cursor-not-allowed"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-muted px-1">{t('perfil.form.phone')}</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            className="w-full rounded-xl border border-white/8 bg-surface-1 px-4 h-11 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-600/60 transition-colors"
          />
        </div>

        <div className="pt-2 space-y-4">
          <p className="text-xs font-medium text-text-secondary">{t('perfil.preferences')}</p>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-text-muted px-1">{t('perfil.form.transmissionPreference')}</label>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface-1 border border-white/8 p-1">
              {([
                { key: null, label: t('buscar.filter.transmission.all') },
                { key: 'automatic', label: t('buscar.filter.transmission.automatic') },
                { key: 'manual', label: t('buscar.filter.transmission.manual') },
              ] as const).map((option) => (
                <button
                  key={String(option.key)}
                  type="button"
                  onClick={() => setTransmission(option.key)}
                  className={`rounded-lg py-2 text-xs font-medium transition-colors ${
                    transmission === option.key
                      ? 'bg-surface-3 text-text-primary'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-muted px-1">{t('perfil.form.maxPriceDaily')}</label>
            <input
              type="number"
              value={maxPriceDaily}
              onChange={(e) => setMaxPriceDaily(e.target.value)}
              placeholder="Sin límite"
              min={0}
              className="w-full rounded-xl border border-white/8 bg-surface-1 px-4 h-11 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-600/60 transition-colors"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={handleSave} disabled={isUpdating} className="w-full">
            <Save className="h-4 w-4" />
            {isUpdating ? t('perfil.saving') : t('general.save')}
          </Button>
        </div>
      </div>
    </div>
  )
}
