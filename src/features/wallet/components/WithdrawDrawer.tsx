import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { Drawer, DrawerContent } from '@/ui/drawer'
import { useMyBankAccounts } from '@/features/perfil/hooks/useBankAccounts'
import { useWithdrawWalletBalance } from '@/features/wallet/hooks/useWallet'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'

interface WithdrawDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  balanceInCents: number
}

export function WithdrawDrawer({ open, onOpenChange, balanceInCents }: WithdrawDrawerProps) {
  const navigate = useNavigate()
  const { data: accounts = [], isLoading: accountsLoading } = useMyBankAccounts()
  const withdrawMutation = useWithdrawWalletBalance()

  const [bankAccountId, setBankAccountId] = useState('')
  const [amountPesos, setAmountPesos] = useState('')

  useEffect(() => {
    if (!bankAccountId && accounts.length > 0) setBankAccountId(accounts[0].id)
  }, [accounts, bankAccountId])

  useEffect(() => {
    if (!open) setAmountPesos('')
  }, [open])

  const selectedAccount = accounts.find(a => a.id === bankAccountId)
  const maxPesos = balanceInCents / 100
  const parsedAmount = Number.parseFloat(amountPesos)
  const amountExceedsBalance = Number.isFinite(parsedAmount) && parsedAmount > maxPesos

  const handleWithdraw = async () => {
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || amountExceedsBalance) return
    try {
      await withdrawMutation.mutateAsync({
        bankAccountId,
        amountCents: Math.round(parsedAmount * 100),
      })
      onOpenChange(false)
    } catch (_) {}
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="px-5 pt-5 pb-[max(2rem,env(safe-area-inset-bottom))] space-y-5">
          <div>
            <h2 className="text-base font-semibold text-text-primary">{t('wallet.withdraw.title')}</h2>
            <p className="text-xs text-text-muted mt-0.5">{t('wallet.withdraw.subtitle')}</p>
          </div>

          {accountsLoading ? (
            <p className="text-sm text-text-muted">{t('general.loading')}</p>
          ) : accounts.length === 0 ? (
            <div className="rounded-xl border border-warning/30 bg-warning/8 px-4 py-3 space-y-3">
              <div>
                <p className="text-sm font-semibold text-text-primary">{t('wallet.emptyAccounts.title')}</p>
                <p className="mt-0.5 text-sm text-text-secondary">{t('wallet.emptyAccounts.description')}</p>
              </div>
              <Button size="sm" onClick={() => navigate({ to: '/perfil/cuentas' })}>
                {t('wallet.emptyAccounts.cta')}
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-secondary">
                  {t('wallet.withdraw.bankAccount')}
                </label>
                <Select value={bankAccountId} onValueChange={setBankAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('wallet.withdraw.bankAccount')}>
                      {selectedAccount
                        ? `${selectedAccount.alias} · ${selectedAccount.maskedCbu}`
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.alias} · {account.maskedCbu}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-secondary">
                  {t('wallet.withdraw.amount')}
                </label>
                <Input
                  value={amountPesos}
                  onChange={e => {
                    const v = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
                    setAmountPesos(v)
                  }}
                  placeholder="0"
                  inputMode="decimal"
                />
                {amountExceedsBalance ? (
                  <p className="text-xs text-danger">
                    El monto supera tu saldo ({fmt.currency(balanceInCents)}).
                  </p>
                ) : (
                  <p className="text-xs text-text-muted">{t('wallet.withdraw.amountHint')}</p>
                )}
              </div>

              <Button
                className="w-full"
                disabled={withdrawMutation.isPending || !bankAccountId || !amountPesos || amountExceedsBalance}
                onClick={() => void handleWithdraw()}
              >
                {withdrawMutation.isPending ? t('general.loading') : t('wallet.withdraw.submit')}
              </Button>

              <p className="text-xs text-text-muted">{t('wallet.withdraw.processingHint')}</p>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
