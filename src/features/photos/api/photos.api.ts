
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const VEHICLE_PHOTOS_BUCKET = 'rocket-lease/vehicle-photos'
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

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

export const photosApi = {
  async uploadVehicleImage(file: File): Promise<string> {
    const timestamp = Math.floor(Date.now() / 1000)
    const signature = await buildCloudinarySignature({
        folder: VEHICLE_PHOTOS_BUCKET,
        timestamp: String(timestamp),
    })

    const fd = new FormData()
    fd.append('file', file)
    fd.append('api_key', CLOUDINARY_API_KEY)
    fd.append('timestamp', String(timestamp))
    fd.append('signature', signature)
    fd.append('folder', VEHICLE_PHOTOS_BUCKET)

    const res = await fetch(UPLOAD_URL, { method: 'POST', body: fd })
    if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Cloudinary upload failed: ${res.status} ${txt}`)
    }

    const json = await res.json()
    return (json.secure_url ?? json.url) as string
    }
}