import { useEffect, useMemo, useState } from 'react'
import { Skeleton } from '@/ui/skeleton'
import { Plus, Trash } from 'lucide-react'
import { Button } from '@/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/ui/dialog'
import { Input } from '@/ui/input'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { t } from '@/i18n/es'
import { useMyBankAccounts, useCreateBankAccount, useDeleteBankAccount } from '@/features/perfil/hooks/useBankAccounts'
import { BankAccountInputSchema } from '@rocket-lease/contracts'

type FormErrors = Partial<Record<'identifierName' | 'cbu', string>>

function validateBankAccountForm(identifierName: string, cbu: string): { errors: FormErrors; payload?: { alias: string; cbu: string } } {
  const normalizedIdentifierName = identifierName.trim()
  const normalizedCbu = cbu.trim()
  const errors: FormErrors = {}

  if (!normalizedIdentifierName) {
    errors.identifierName = t('bankAccount.form.identifierRequired')
  } else if (normalizedIdentifierName.length < 3 || normalizedIdentifierName.length > 50) {
    errors.identifierName = t('bankAccount.form.identifierLengthError')
  }

  if (!normalizedCbu) {
    errors.cbu = t('bankAccount.form.cbuRequired')
  } else if (!/^\d{22}$/.test(normalizedCbu)) {
    errors.cbu = t('bankAccount.form.cbuError')
  }

  if (errors.identifierName || errors.cbu) {
    return { errors }
  }

  const parsed = BankAccountInputSchema.safeParse({ alias: normalizedIdentifierName, cbu: normalizedCbu })
  if (!parsed.success) {
    return {
      errors: {
        identifierName: parsed.error.flatten().fieldErrors.alias?.[0] ?? errors.identifierName,
        cbu: parsed.error.flatten().fieldErrors.cbu?.[0] ?? errors.cbu,
      },
    }
  }

  return { errors: {}, payload: parsed.data }
}

export function MisCuentasPage() {
  const { data: accounts = [], isLoading, isError, refetch } = useMyBankAccounts()
  const createMutation = useCreateBankAccount()
  const deleteMutation = useDeleteBankAccount()

  const [modalOpen, setModalOpen] = useState(false)
  const [identifierName, setIdentifierName] = useState('')
  const [cbu, setCbu] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [showAccountDetailModal, setShowAccountDetailModal] = useState(false)
  const [showNoAccountsWarning, setShowNoAccountsWarning] = useState(false)

  useEffect(() => {
    if (accounts.length === 0) {
      setSelectedAccountId(null)
      return
    }

    if (selectedAccountId && !accounts.some((account) => account.id === selectedAccountId)) {
      setSelectedAccountId(null)
      setShowAccountDetailModal(false)
    }
  }, [accounts, selectedAccountId])

  const resetForm = () => {
    setIdentifierName('')
    setCbu('')
    setFieldErrors({})
    setSubmitError(null)
  }

  const openModal = () => {
    resetForm()
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    resetForm()
  }

  const handleAdd = async () => {
    const validation = validateBankAccountForm(identifierName, cbu)
    setFieldErrors(validation.errors)
    setSubmitError(null)

    if (!validation.payload) {
      return
    }

    try {
      await createMutation.mutateAsync(validation.payload)
      closeModal()
    } catch {
      setSubmitError(t('bankAccount.form.submitError'))
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(t('bankAccount.deleteConfirm'))
    if (!confirmed) return

    const wasLastAccount = accounts.length === 1
    await deleteMutation.mutateAsync(id)
    if (wasLastAccount) {
      setShowNoAccountsWarning(true)
    }
  }

  const hasAccounts = useMemo(() => accounts.length > 0, [accounts])
  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId],
  )

  return (
    <div className="flex flex-col">
      <PageHeader
        title={t('bankAccount.title')}
        showBack
        actions={(
          <Button size="sm" onClick={openModal}>
            <Plus className="h-4 w-4" />
            {t('bankAccount.add')}
          </Button>
        )}
      />

      <div className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1].map(i => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="space-y-3 rounded-2xl border border-danger/20 bg-danger/10 p-4 text-text-primary">
            <p>{t('error.default')}</p>
            <Button variant="secondary" onClick={() => refetch()}>
              {t('general.retry')}
            </Button>
          </div>
        ) : !hasAccounts ? (
          <div className="rounded-2xl border border-warning/25 bg-warning/10 p-4">
            <p className="text-sm font-semibold text-text-primary">{t('bankAccount.emptyState.title')}</p>
            <p className="mt-1 text-sm text-text-secondary">{t('bankAccount.emptyState.description')}</p>
          </div>
        ) : hasAccounts ? (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedAccountId(account.id)
                  setShowAccountDetailModal(true)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setSelectedAccountId(account.id)
                    setShowAccountDetailModal(true)
                  }
                }}
                className={`rounded-2xl border p-4 flex items-start justify-between gap-3 cursor-pointer transition-colors ${
                  selectedAccountId === account.id
                    ? 'border-brand-500/60 bg-brand-500/10'
                    : 'border-white/8 bg-surface-1 hover:border-white/20'
                }`}
              >
                <div className="min-w-0">
                  <div className="font-semibold text-text-primary">{account.alias}</div>
                  <div className="mt-1 text-sm text-text-muted">{account.maskedCbu}</div>
                </div>
                <Button
                  variant="ghost"
                  onClick={(event) => {
                    event.stopPropagation()
                    void handleDelete(account.id)
                  }}
                  disabled={deleteMutation.isPending}
                  aria-label={t('bankAccount.deleteConfirm')}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <Dialog open={modalOpen} onOpenChange={(open) => (open ? setModalOpen(true) : closeModal())}>
        <DialogContent className="w-[calc(100vw-1rem)]! max-w-[calc(100vw-1rem)]! bg-surface-1 border-white/10 p-4! sm:w-full! sm:max-w-lg! sm:p-6!">
          <DialogHeader>
            <DialogTitle>{t('bankAccount.modal.title')}</DialogTitle>
            <DialogDescription>{t('bankAccount.modal.description')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-text-secondary">
                  {t('bankAccount.identifierName')}
                </label>
                <Input
                  value={identifierName}
                  onChange={(event) => {
                    setIdentifierName(event.target.value)
                    if (fieldErrors.identifierName) setFieldErrors((current) => ({ ...current, identifierName: undefined }))
                  }}
                  placeholder={t('bankAccount.form.identifierPlaceholder')}
                  error={fieldErrors.identifierName}
                  className="bg-surface-2"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-text-secondary">
                  {t('bankAccount.cbu')}
                </label>
                <Input
                  value={cbu}
                  onChange={(event) => {
                    setCbu(event.target.value)
                    if (fieldErrors.cbu) setFieldErrors((current) => ({ ...current, cbu: undefined }))
                  }}
                  placeholder={t('bankAccount.form.cbuPlaceholder')}
                  error={fieldErrors.cbu}
                  className="bg-surface-2"
                  inputMode="numeric"
                  autoComplete="off"
                />
              </div>

            {submitError && (
              <div className="rounded-xl border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
                {submitError}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="ghost" onClick={closeModal}>
              {t('general.cancel')}
            </Button>
            <Button onClick={handleAdd} disabled={createMutation.isPending}>
              {createMutation.isPending ? t('general.loading') : t('bankAccount.add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNoAccountsWarning} onOpenChange={setShowNoAccountsWarning}>
        <DialogContent className="w-[calc(100vw-1rem)]! max-w-[calc(100vw-1rem)]! bg-surface-1 border-white/10 p-4! sm:w-full! sm:max-w-md! sm:p-6!">
          <DialogHeader>
            <DialogTitle>{t('bankAccount.lastDeleted.title')}</DialogTitle>
            <DialogDescription>{t('bankAccount.lastDeleted.description')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowNoAccountsWarning(false)}>{t('general.close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAccountDetailModal && Boolean(selectedAccount)} onOpenChange={setShowAccountDetailModal}>
        <DialogContent className="w-[calc(100vw-1rem)]! max-w-[calc(100vw-1rem)]! bg-surface-1 border-white/10 p-4! sm:w-full! sm:max-w-md! sm:p-6!">
          {selectedAccount && (
            <>
              <DialogHeader>
                <DialogTitle>{t('bankAccount.detail.title')}</DialogTitle>
                <DialogDescription>{t('bankAccount.detail.identifier')}: {selectedAccount.alias}</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                <p className="text-text-secondary">
                  <span className="font-medium text-text-primary">{t('bankAccount.detail.identifier')}: </span>
                  {selectedAccount.alias}
                </p>
                <p className="text-text-secondary">
                  <span className="font-medium text-text-primary">{t('bankAccount.detail.fullCbu')}: </span>
                  {selectedAccount.cbu}
                </p>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowAccountDetailModal(false)}>{t('general.close')}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
