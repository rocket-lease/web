import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { useMyBankAccounts } from '@/features/perfil/hooks/useBankAccounts'
import { useWalletBalance, useWalletTransactions, useWithdrawWalletBalance } from '@/features/wallet/hooks/useWallet'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'

export function WalletPage() {
  const navigate = useNavigate()
  const { data: accounts = [], isLoading: accountsLoading } = useMyBankAccounts()
  const { data: balance, isLoading: balanceLoading, isError: balanceError } = useWalletBalance()
  const { data: transactions, isLoading: transactionsLoading } = useWalletTransactions()
  const withdrawMutation = useWithdrawWalletBalance()

  const [bankAccountId, setBankAccountId] = useState('')
  const [amountPesos, setAmountPesos] = useState('')

  useEffect(() => {
    if (!bankAccountId && accounts.length > 0) {
      setBankAccountId(accounts[0].id)
    }
  }, [accounts, bankAccountId])

  const hasAccounts = accounts.length > 0
  const hasTransactions = (transactions?.items.length ?? 0) > 0
  const balanceLabel = useMemo(() => {
    if (!balance) return t('general.loading')
    return fmt.currency(balance.balanceCents)
  }, [balance])

  const handleWithdraw = async () => {
    const amount = Number.parseFloat(amountPesos)
    if (!Number.isFinite(amount) || amount <= 0) return

    try {
      await withdrawMutation.mutateAsync({
        bankAccountId,
        amountCents: Math.round(amount * 100),
      })
      setAmountPesos('')
    } catch {
      // The mutation hook already shows the toast.
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader title={t('wallet.title')} showBack />

      <section className="mx-4 rounded-3xl border border-white/10 bg-linear-to-br from-brand-500/15 via-surface-1 to-surface-0 p-5 shadow-lg shadow-brand-500/10">
        <p className="text-xs uppercase tracking-[0.24em] text-text-muted">{t('wallet.balanceLabel')}</p>
        <div className="mt-2 text-3xl font-semibold text-text-primary">
          {balanceLoading ? t('general.loading') : balanceError ? t('error.default') : balanceLabel}
        </div>
        <p className="mt-2 text-sm text-text-secondary">{t('wallet.balanceHint')}</p>
      </section>

      {accountsLoading ? (
        <section className="mx-4 rounded-2xl border border-white/10 bg-surface-1 p-4 text-sm text-text-muted">
          {t('general.loading')}
        </section>
      ) : !hasAccounts ? (
        <section className="mx-4 rounded-2xl border border-warning/25 bg-warning/10 p-4">
          <p className="text-sm font-semibold text-text-primary">{t('wallet.emptyAccounts.title')}</p>
          <p className="mt-1 text-sm text-text-secondary">{t('wallet.emptyAccounts.description')}</p>
          <Button className="mt-4" onClick={() => navigate({ to: '/perfil/cuentas' })}>
            {t('wallet.emptyAccounts.cta')}
          </Button>
        </section>
      ) : (
        <section className="mx-4 rounded-2xl border border-white/10 bg-surface-1 p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-text-primary">{t('wallet.withdraw.title')}</p>
            <p className="mt-1 text-sm text-text-muted">{t('wallet.withdraw.subtitle')}</p>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-secondary">{t('wallet.withdraw.bankAccount')}</label>
            <select
              value={bankAccountId}
              onChange={(event) => setBankAccountId(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-surface-2 px-3 py-3 text-sm text-text-primary outline-none"
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.alias} · {account.maskedCbu}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-secondary">{t('wallet.withdraw.amount')}</label>
            <Input
              value={amountPesos}
              onChange={(event) => setAmountPesos(event.target.value)}
              placeholder="0"
              inputMode="decimal"
              className="bg-surface-2"
            />
            <p className="text-xs text-text-muted">{t('wallet.withdraw.amountHint')}</p>
          </div>

          <Button
            className="w-full"
            disabled={withdrawMutation.isPending || !bankAccountId || !amountPesos}
            onClick={() => void handleWithdraw()}
          >
            {withdrawMutation.isPending ? t('general.loading') : t('wallet.withdraw.submit')}
          </Button>

          <p className="text-xs text-text-muted">{t('wallet.withdraw.processingHint')}</p>
        </section>
      )}

      <section className="mx-4 rounded-2xl border border-white/10 bg-surface-1 p-4">
        <div>
          <p className="text-sm font-semibold text-text-primary">{t('wallet.transactions.title')}</p>
          <p className="mt-1 text-sm text-text-muted">{t('wallet.transactions.subtitle')}</p>
        </div>

        {transactionsLoading ? (
          <div className="mt-4 text-sm text-text-muted">{t('general.loading')}</div>
        ) : hasTransactions ? (
          <div className="mt-4 space-y-3">
            {transactions!.items.map((transaction) => (
              <div key={transaction.id} className="rounded-xl border border-white/8 bg-surface-2 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {transaction.type === 'reservation_credit'
                        ? t('wallet.transactions.credit')
                        : t('wallet.transactions.debit')}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">{fmt.dateTime(transaction.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${transaction.type === 'withdrawal_debit' ? 'text-danger' : 'text-success'}`}>
                      {transaction.type === 'withdrawal_debit' ? '-' : '+'}{fmt.currency(transaction.amountCents)}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      {t('wallet.transactions.balanceAfter')}: {fmt.currency(transaction.balanceAfterCents)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-white/10 p-4 text-sm text-text-muted">
            {t('wallet.transactions.empty')}
          </div>
        )}
      </section>
    </div>
  )
}