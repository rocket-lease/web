import { UploadSignResponseSchema } from '@rocket-lease/contracts'
import { apiClient } from '@/lib/api-client'

type CloudinaryUploadResponse = {
  secure_url?: string
  url?: string
  public_id?: string
}

export type VehiclePhotoUploadResult = {
  url: string
  publicId: string
}

const extractPublicIdFromUrl = (url: string) => {
  const uploadSegment = '/upload/'
  const uploadIndex = url.indexOf(uploadSegment)

  if (uploadIndex === -1) {
    return url
  }

  const pathAfterUpload = decodeURIComponent(url.slice(uploadIndex + uploadSegment.length))
  const withoutVersion = pathAfterUpload.replace(/^v\d+\//, '')
  return withoutVersion.replace(/\.[^.]+$/, '')
}

export const photosApi = {
  async uploadVehicleImage(file: File): Promise<VehiclePhotoUploadResult> {
    const signed = UploadSignResponseSchema.parse(
      await apiClient.post('/uploads/sign', {
        resourceType: 'image',
        folder: 'rocket-lease/vehicle-photos',
      }),
    )

    const formData = new FormData()
    Object.entries(signed.fields).forEach(([key, value]) => formData.append(key, value))
    formData.append('file', file)

    const res = await fetch(signed.uploadUrl, { method: 'POST', body: formData })
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`Upload failed: ${res.status} ${txt}`)
    }

    const json = (await res.json()) as CloudinaryUploadResponse
    const url = json.secure_url ?? json.url

    if (!url || !json.public_id) {
      throw new Error('Upload response missing required data')
    }

    return { url, publicId: json.public_id }
  },

  async deleteVehicleImage(publicIdOrUrl: string): Promise<void> {
    const publicId = publicIdOrUrl.startsWith('http')
      ? extractPublicIdFromUrl(publicIdOrUrl)
      : publicIdOrUrl
    await apiClient.delete(`/uploads?publicId=${encodeURIComponent(publicId)}`)
  },
}
