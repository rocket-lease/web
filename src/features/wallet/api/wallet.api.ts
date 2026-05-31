import { apiEndpoints, WalletBalanceSchema, WalletTransactionsResponseSchema, WithdrawResponseSchema, type WalletBalance, type WalletTransactionsResponse, type WithdrawRequest, type WithdrawResponse } from '@rocket-lease/contracts'
import { apiClient } from '@/lib/api-client'

export const walletApi = {
  async getBalance(): Promise<WalletBalance> {
    const raw = await apiClient.get<unknown>(apiEndpoints.wallet.balance)
    return WalletBalanceSchema.parse(raw)
  },

  async listTransactions(): Promise<WalletTransactionsResponse> {
    const raw = await apiClient.get<unknown>(apiEndpoints.wallet.transactions)
    return WalletTransactionsResponseSchema.parse(raw)
  },

  async withdraw(data: WithdrawRequest): Promise<WithdrawResponse> {
    const raw = await apiClient.post<unknown>(apiEndpoints.wallet.withdraw, data)
    return WithdrawResponseSchema.parse(raw)
  },
}