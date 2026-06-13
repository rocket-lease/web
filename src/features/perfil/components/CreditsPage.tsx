import { useState } from 'react'
import { Coins, ArrowDownLeft, ArrowUpRight, Lightning, ArrowDown, ArrowUp } from '@phosphor-icons/react'
import { Button } from '@/ui/button'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'
import { useWalletTransactions } from '@/features/wallet/hooks/useWallet'
import { WithdrawDrawer } from '@/features/wallet/components/WithdrawDrawer'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'

export function CreditsPage() {
  const { data: profile, isLoading } = useMyProfile()
  const { data: transactions, isLoading: transactionsLoading } = useWalletTransactions()
  const [withdrawOpen, setWithdrawOpen] = useState(false)

  const hasTransactions = (transactions?.items.length ?? 0) > 0

  return (
    <div className="flex flex-col pb-20">
      <PageHeader title={t('perfil.creditos.title')} showBack sticky />

      {isLoading ? (
        <div className="px-5 py-8 text-sm text-text-muted">{t('general.loading')}</div>
      ) : profile && (
        <>
          {/* Balance hero */}
          <div className="px-5 py-6">
            <div className="flex items-center gap-1.5 mb-2">
              <Coins size={14} className="text-info" weight="fill" />
              <p className="text-xs font-medium text-text-muted">Rocketokens</p>
            </div>
            <p className="text-4xl font-bold text-text-primary tabular-nums leading-none">
              {fmt.currency(profile.balanceInCents)}
            </p>
            <p className="text-sm text-text-secondary mt-2">{t('perfil.balance.subtitle')}</p>
          </div>

          {/* Movimientos */}
          <div className="mx-5 h-px bg-white/6" />
          <div className="px-5 pt-5">
            <p className="text-sm font-semibold text-text-primary">{t('wallet.transactions.title')}</p>
            <p className="mt-0.5 text-xs text-text-muted">{t('wallet.transactions.subtitle')}</p>

            {transactionsLoading ? (
              <p className="mt-4 text-sm text-text-muted">{t('general.loading')}</p>
            ) : !hasTransactions ? (
              <p className="mt-4 text-sm text-text-muted">{t('wallet.transactions.empty')}</p>
            ) : (
              <div className="mt-3 divide-y divide-white/6">
                {transactions!.items.map(transaction => {
                  const isCredit = transaction.type === 'reservation_credit' || transaction.type === 'dispute_penalty_credit' || transaction.type === 'ticket_resolution_credit'
                  const LABELS: Record<typeof transaction.type, Parameters<typeof t>[0]> = {
                    reservation_credit: 'wallet.transactions.credit',
                    withdrawal_debit: 'wallet.transactions.debit',
                    dispute_penalty_debit: 'wallet.transactions.dispute_penalty_debit',
                    dispute_penalty_credit: 'wallet.transactions.dispute_penalty_credit',
                    ticket_resolution_credit: 'wallet.transactions.ticket_resolution_credit',
                    ticket_resolution_debit: 'wallet.transactions.ticket_resolution_debit',
                  }
                  return (
                    <div key={transaction.id} className="flex items-center gap-3 py-3.5">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isCredit ? 'bg-success/15' : 'bg-danger/15'}`}>
                        {isCredit
                          ? <ArrowDown size={14} className="text-success" />
                          : <ArrowUp size={14} className="text-danger" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary">
                          {t(LABELS[transaction.type])}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">{fmt.dateTime(transaction.createdAt)}</p>
                        <p className="text-xs text-text-muted/60 mt-0.5 truncate">
                          {t('wallet.transactions.balanceAfter')}: {fmt.currency(transaction.balanceAfterCents)}
                        </p>
                      </div>
                      <p className={`text-sm font-semibold tabular-nums shrink-0 ${isCredit ? 'text-success' : 'text-danger'}`}>
                        {isCredit ? '+' : '-'}{fmt.currency(transaction.amountCents)}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Cómo funcionan */}
          <div className="mx-5 h-px bg-white/6 mt-6" />
          <div className="px-5 py-5 space-y-3">
            <p className="text-xs font-medium text-text-secondary">{t('perfil.creditos.howTitle')}</p>
            <div className="space-y-2">
              <div className="flex items-start gap-3 px-1 py-2">
                <ArrowDownLeft size={18} className="text-success shrink-0 mt-0.5" weight="bold" />
                <div>
                  <p className="text-sm font-medium text-text-primary">{t('perfil.creditos.earn')}</p>
                  <p className="text-xs text-text-muted mt-0.5">{t('perfil.creditos.earnHint')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 px-1 py-2">
                <ArrowUpRight size={18} className="text-brand-400 shrink-0 mt-0.5" weight="bold" />
                <div>
                  <p className="text-sm font-medium text-text-primary">{t('perfil.creditos.spend')}</p>
                  <p className="text-xs text-text-muted mt-0.5">{t('perfil.creditos.spendHint')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 px-1 py-2">
                <Lightning size={18} className="text-warning shrink-0 mt-0.5" weight="fill" />
                <div>
                  <p className="text-sm font-medium text-text-primary">{t('perfil.creditos.bonus')}</p>
                  <p className="text-xs text-text-muted mt-0.5">{t('perfil.creditos.bonusHint')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-8 bg-surface-0/90 backdrop-blur-md border-t border-white/6">
            <Button className="w-full" onClick={() => setWithdrawOpen(true)}>
              {t('wallet.withdraw.submit')}
            </Button>
          </div>

          <WithdrawDrawer
            open={withdrawOpen}
            onOpenChange={setWithdrawOpen}
            balanceInCents={profile.balanceInCents}
          />
        </>
      )}
    </div>
  )
}
