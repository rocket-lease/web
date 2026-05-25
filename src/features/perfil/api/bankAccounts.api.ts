import {
  type BankAccountListResponse,
  type CreateBankAccountRequest,
  type CreateBankAccountResponse,
  BankAccountEndpoints,
  BankAccountListResponseSchema,
  CreateBankAccountResponseSchema,
} from '@rocket-lease/contracts'
import { apiClient } from '@/lib/api-client'

export const bankAccountsApi = {
  async listMine(): Promise<BankAccountListResponse> {
    const raw = await apiClient.get<unknown>(BankAccountEndpoints.listMine)
    return BankAccountListResponseSchema.parse(raw)
  },

  async create(data: CreateBankAccountRequest): Promise<CreateBankAccountResponse> {
    const raw = await apiClient.post<unknown>(BankAccountEndpoints.create, data)
    return CreateBankAccountResponseSchema.parse(raw)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(BankAccountEndpoints.delete(id))
  },
}
