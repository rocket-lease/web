import { Coins, ArrowDownLeft, ArrowUpRight, Lightning } from '@phosphor-icons/react'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'

export function CreditsPage() {
  const { data: profile, isLoading } = useMyProfile()

  return (
    <div className="flex flex-col pb-6">
      <PageHeader title={t('perfil.creditos.title')} showBack sticky />

      {isLoading && (
        <div className="px-4 py-8 text-sm text-text-muted">{t('general.loading')}</div>
      )}

      {profile && (
        <>
          {/* Saldo */}
          <div className="px-4 mt-6">
            <div className="rounded-2xl border border-info/25 bg-info/10 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Coins size={16} className="text-info" weight="fill" />
                <p className="text-xs font-semibold text-info uppercase tracking-wide">Rocketokens</p>
              </div>
              <p className="text-4xl font-bold text-text-primary tabular-nums">
                {fmt.currency(profile.balanceInCents)}
              </p>
              <p className="text-sm text-text-secondary mt-1">{t('perfil.balance.subtitle')}</p>
            </div>
          </div>

          {/* Cómo usarlos */}
          <div className="px-4 mt-8 space-y-3">
            <p className="text-xs font-medium text-text-secondary">{t('perfil.creditos.howTitle')}</p>
            <div className="space-y-2">
              <div className="flex items-start gap-3 rounded-xl bg-surface-1 px-4 py-3">
                <ArrowDownLeft size={18} className="text-success shrink-0 mt-0.5" weight="bold" />
                <div>
                  <p className="text-sm font-medium text-text-primary">{t('perfil.creditos.earn')}</p>
                  <p className="text-xs text-text-muted mt-0.5">{t('perfil.creditos.earnHint')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-surface-1 px-4 py-3">
                <ArrowUpRight size={18} className="text-brand-400 shrink-0 mt-0.5" weight="bold" />
                <div>
                  <p className="text-sm font-medium text-text-primary">{t('perfil.creditos.spend')}</p>
                  <p className="text-xs text-text-muted mt-0.5">{t('perfil.creditos.spendHint')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-surface-1 px-4 py-3">
                <Lightning size={18} className="text-warning shrink-0 mt-0.5" weight="fill" />
                <div>
                  <p className="text-sm font-medium text-text-primary">{t('perfil.creditos.bonus')}</p>
                  <p className="text-xs text-text-muted mt-0.5">{t('perfil.creditos.bonusHint')}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
