import {
  GetMyDriverLicenseVerificationResponseSchema,
  SubmitDriverLicenseVerificationResponseSchema,
  type GetMyDriverLicenseVerificationResponse,
  type SubmitDriverLicenseVerificationResponse,
  apiEndpoints,
} from '@rocket-lease/contracts'
import { apiClient } from '@/lib/api-client'

export type SubmitDriverLicenseVerificationFiles = {
  frontLicense: File
  selfie: File
}

export const licenseApi = {
  async getMyVerification(): Promise<GetMyDriverLicenseVerificationResponse> {
    const response = await apiClient.get<unknown>(apiEndpoints.driverLicense.meVerification)
    return GetMyDriverLicenseVerificationResponseSchema.parse(response)
  },

  async submitMyVerification(
    payload: SubmitDriverLicenseVerificationFiles,
  ): Promise<SubmitDriverLicenseVerificationResponse> {
    const formData = new FormData()
    formData.append('frontLicense', payload.frontLicense)
    formData.append('selfie', payload.selfie)

    const response = await apiClient.postFormData<unknown>(
      apiEndpoints.driverLicense.meVerification,
      formData,
    )
    return SubmitDriverLicenseVerificationResponseSchema.parse(response)
  },
}