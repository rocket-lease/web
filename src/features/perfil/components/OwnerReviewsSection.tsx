import { MessageSquare } from 'lucide-react'
import { t } from '@/i18n/es'

export function OwnerReviewsSection() {
  return (
    <section className="mt-6">
      <div className="px-4 mb-3">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
          {t('perfil.reviewsTitle')}
        </p>
      </div>

      <div className="mx-4 rounded-2xl bg-surface-2 border border-white/5 px-4 py-6 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-1">
          <MessageSquare className="h-5 w-5 text-text-muted" />
        </div>
        <p className="text-sm font-medium text-text-secondary">{t('perfil.reviewsEmpty')}</p>
        <p className="mt-1 text-xs text-text-muted">{t('perfil.reviewsEmptyHint')}</p>
      </div>
    </section>
  )
}
