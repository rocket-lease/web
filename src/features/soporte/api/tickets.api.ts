import {
  GetMyTicketsResponseSchema,
  TicketResponseSchema,
  UploadSignResponseSchema,
  type CreateTicketRequest,
  type GetMyTicketsResponse,
  type TicketResponse,
} from '@rocket-lease/contracts'
import { apiClient } from '@/lib/api-client'

export const ticketsApi = {
  async create(data: CreateTicketRequest): Promise<TicketResponse> {
    return TicketResponseSchema.parse(await apiClient.post('/tickets', data))
  },

  async getMine(): Promise<GetMyTicketsResponse> {
    return GetMyTicketsResponseSchema.parse(await apiClient.get('/tickets/mine'))
  },

  async uploadPhoto(file: File): Promise<string> {
    const signed = UploadSignResponseSchema.parse(
      await apiClient.post('/uploads/sign', {
        resourceType: 'image',
        folder: 'rocket-lease/ticket-photos',
      }),
    )
    const formData = new FormData()
    Object.entries(signed.fields).forEach(([k, v]) => formData.append(k, v))
    formData.append('file', file)
    const res = await fetch(signed.uploadUrl, { method: 'POST', body: formData })
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
    const json = (await res.json()) as { secure_url?: string }
    if (!json.secure_url) throw new Error('Upload response missing secure_url')
    return json.secure_url
  },
}
