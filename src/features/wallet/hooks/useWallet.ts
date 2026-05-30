import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { WithdrawRequest } from '@rocket-lease/contracts'
import { walletApi } from '@/features/wallet/api/wallet.api'
import { t } from '@/i18n/es'

const walletBalanceKey = ['wallet', 'balance'] as const
const walletTransactionsKey = ['wallet', 'transactions'] as const

export function useWalletBalance() {
  return useQuery({
    queryKey: walletBalanceKey,
    queryFn: () => walletApi.getBalance(),
    staleTime: 1000 * 60,
  })
}

export function useWalletTransactions() {
  return useQuery({
    queryKey: walletTransactionsKey,
    queryFn: () => walletApi.listTransactions(),
    staleTime: 1000 * 30,
  })
}

export function useWithdrawWalletBalance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: WithdrawRequest) => walletApi.withdraw(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: walletBalanceKey })
      void queryClient.invalidateQueries({ queryKey: walletTransactionsKey })
      toast.success(t('wallet.withdraw.success'))
    },
    onError: () => {
      toast.error(t('error.default'))
    },
  })
}