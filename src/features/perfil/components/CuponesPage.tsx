import { Tag } from '@phosphor-icons/react'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { t } from '@/i18n/es'

export function CuponesPage() {
  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title={t('perfil.cupones.title')} showBack sticky />

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2">
          <Tag size={28} className="text-text-muted" weight="duotone" />
        </div>
        <div>
          <p className="font-semibold text-text-primary">{t('perfil.cupones.empty')}</p>
          <p className="mt-1 text-sm text-text-muted">{t('perfil.cupones.emptyHint')}</p>
        </div>
      </div>
    </div>
  )
}
