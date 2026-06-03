import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import type {
  BankAccount,
  CreateBankAccountRequest,
} from '@rocket-lease/contracts'
import { bankAccountsApi } from '@/features/perfil/api/bankAccounts.api'
import { t } from '@/i18n/es'
import { getErrorMessage } from '@/lib/error-mapper'

const myBankAccountsKey = ['bankAccounts', 'mine'] as const

export function useMyBankAccounts(): UseQueryResult<BankAccount[], Error> {
  return useQuery({
    queryKey: myBankAccountsKey,
    queryFn: () => bankAccountsApi.listMine(),
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateBankAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateBankAccountRequest) => bankAccountsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: myBankAccountsKey })
      toast.success(t('bankAccount.addSuccess'))
    },
    onError: (err) => {
      toast.error(getErrorMessage(err))
    },
  })
}

export function useDeleteBankAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bankAccountsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: myBankAccountsKey })
      toast.success(t('bankAccount.deleteSuccess'))
    },
    onError: (err) => {
      toast.error(getErrorMessage(err))
    },
  })
}
