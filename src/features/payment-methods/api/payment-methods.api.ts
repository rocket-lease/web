import { apiClient } from '@/lib/api-client'
import {
  PaymentMethodEndpoints,
  type SavedPaymentMethod,
  type CreateSavedPaymentMethod,
  type UpdateSavedPaymentMethod,
} from '@rocket-lease/contracts'

export const paymentMethodsApi = {
  list: () => 
    apiClient.get<SavedPaymentMethod[]>(PaymentMethodEndpoints.list()),
    
  create: (data: CreateSavedPaymentMethod) => 
    apiClient.post<SavedPaymentMethod>(PaymentMethodEndpoints.create(), data),
    
  update: (id: string, data: UpdateSavedPaymentMethod) => 
    apiClient.patch<SavedPaymentMethod>(PaymentMethodEndpoints.update(id), data),
    
  delete: (id: string) => 
    apiClient.delete<void>(PaymentMethodEndpoints.delete(id)),
}
