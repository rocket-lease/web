import { useState } from 'react'
import { Save, Pencil, X } from 'lucide-react'
import { toast } from 'sonner'
import type { UpdateMyProfileRequest } from '@/features/perfil/types/profile.contract'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'
import { t } from '@/i18n/es'

export function DatosPerfilPage() {
  const {
    data: profile,
    isLoading,
    updateProfile,
    isUpdating,
  } = useMyProfile()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [maxPriceDaily, setMaxPriceDaily] = useState('')
  const [accessibilityCsv, setAccessibilityCsv] = useState('')
  const [transmission, setTransmission] = useState<'automatic' | 'manual' | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [syncedProfileId, setSyncedProfileId] = useState<string | null>(null)

  if (profile && profile.id !== syncedProfileId) {
    setSyncedProfileId(profile.id)
    setName(profile.name)
    setPhone(profile.phone)
    setMaxPriceDaily(profile.preferences.maxPriceDaily?.toString() ?? '')
    setAccessibilityCsv(profile.preferences.accessibility.join(', '))
    setTransmission(profile.preferences.transmission)
  }

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
      autoAccept: profile.autoAccept,
    }

    try {
      await updateProfile(payload)
      toast.success(t('perfil.saveSuccess'))
      setIsEditing(false)
    } catch {
      toast.error(t('error.default'))
    }
  }

  const handleCancel = () => {
    if (profile) {
      setName(profile.name)
      setPhone(profile.phone)
      setMaxPriceDaily(profile.preferences.maxPriceDaily?.toString() ?? '')
      setAccessibilityCsv(profile.preferences.accessibility.join(', '))
      setTransmission(profile.preferences.transmission)
    }
    setIsEditing(false)
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
    <div className="flex flex-col">
      <PageHeader title={t('perfil.datos.title')} showBack />

      <div className="px-4 py-5 space-y-5">
        {!isEditing && (
          <div className="flex justify-center">
            <Button onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4" />
              {t('perfil.editProfile')}
            </Button>
          </div>
        )}

        <div className="rounded-2xl bg-surface-1 border border-white/6 divide-y divide-white/6">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-xs text-text-muted w-24 shrink-0">{t('perfil.form.name')}</span>
            {isEditing ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('perfil.form.name')}
                className="min-w-0 flex-1 rounded-lg border border-white/8 bg-surface-2 px-3 h-9 text-sm text-right text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-600/60"
              />
            ) : (
              <span className="text-sm font-medium text-text-primary text-right truncate min-w-0">{profile.name}</span>
            )}
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-xs text-text-muted w-24 shrink-0">{t('perfil.form.phone')}</span>
            {isEditing ? (
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('perfil.form.phone')}
                className="min-w-0 flex-1 rounded-lg border border-white/8 bg-surface-2 px-3 h-9 text-sm text-right text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-600/60"
              />
            ) : (
              <span className="text-sm font-medium text-text-primary text-right truncate min-w-0">{profile.phone || '—'}</span>
            )}
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-xs text-text-muted w-24 shrink-0">{t('perfil.form.email')}</span>
            <span className="text-sm font-medium text-text-primary text-right truncate min-w-0">{profile.email}</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3 text-center">
            {t('perfil.preferences')}
          </p>
          <div className="grid grid-cols-3 gap-3">
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
            <Button variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4" />
              {t('general.cancel')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
