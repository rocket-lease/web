
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const VEHICLE_PHOTOS_BUCKET = 'rocket-lease/vehicle-photos'
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
const DESTROY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`

type CloudinaryUploadResponse = {
  secure_url?: string
  url?: string
  public_id?: string
}

export type VehiclePhotoUploadResult = {
  url: string
  publicId: string
}

const buildCloudinarySignature = async (params: Record<string, string>) => {
  const stringToSign = Object.entries(params)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  const buf = await crypto.subtle.digest(
    'SHA-1',
    new TextEncoder().encode(`${stringToSign}${CLOUDINARY_API_SECRET}`),
  )

  return Array.from(new Uint8Array(buf))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
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
    const timestamp = Math.floor(Date.now() / 1000)
    const signature = await buildCloudinarySignature({
      folder: VEHICLE_PHOTOS_BUCKET,
      timestamp: String(timestamp),
    })

    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', CLOUDINARY_API_KEY)
    formData.append('timestamp', String(timestamp))
    formData.append('signature', signature)
    formData.append('folder', VEHICLE_PHOTOS_BUCKET)

    const res = await fetch(UPLOAD_URL, { method: 'POST', body: formData })
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`Cloudinary upload failed: ${res.status} ${txt}`)
    }

    const json = (await res.json()) as CloudinaryUploadResponse
    const url = json.secure_url ?? json.url

    if (!url || !json.public_id) {
      throw new Error('Cloudinary upload response missing required data')
    }

    return {
      url,
      publicId: json.public_id,
    }
  },

  async deleteVehicleImage(publicIdOrUrl: string): Promise<void> {
    const publicId = publicIdOrUrl.startsWith('http') ? extractPublicIdFromUrl(publicIdOrUrl) : publicIdOrUrl
    const timestamp = Math.floor(Date.now() / 1000)
    const signature = await buildCloudinarySignature({
      public_id: publicId,
      timestamp: String(timestamp),
    })

    const formData = new FormData()
    formData.append('public_id', publicId)
    formData.append('api_key', CLOUDINARY_API_KEY)
    formData.append('timestamp', String(timestamp))
    formData.append('signature', signature)

    const res = await fetch(DESTROY_URL, { method: 'POST', body: formData })
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`Cloudinary delete failed: ${res.status} ${txt}`)
    }

    const json = (await res.json().catch(() => ({}))) as { result?: string }
    if (json.result && json.result !== 'ok' && json.result !== 'not found') {
      throw new Error(`Cloudinary delete failed: ${json.result}`)
    }
  },
}