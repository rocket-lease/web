import { Tag } from '@phosphor-icons/react'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { EmptyState } from '@/ui/empty-state'
import { t } from '@/i18n/es'

export function CuponesPage() {
  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title={t('perfil.cupones.title')} showBack sticky />

      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          icon={<Tag size={26} weight="regular" className="text-text-muted" />}
          title={t('perfil.cupones.empty')}
          description={t('perfil.cupones.emptyHint')}
        />
      </div>
    </div>
  )
}
