import {
  GetMyIdentityVerificationResponseSchema,
  SubmitIdentityVerificationResponseSchema,
  type GetMyIdentityVerificationResponse,
  type SubmitIdentityVerificationResponse,
  apiEndpoints,
} from '@rocket-lease/contracts';
import { apiClient } from '@/lib/api-client';

export type SubmitIdentityVerificationFiles = {
  frontDni: File
  backDni: File
  selfie: File
}

export const identityApi = {
  async getMyVerification(): Promise<GetMyIdentityVerificationResponse> {
    const response = await apiClient.get<unknown>(apiEndpoints.identity.meVerification);
    return GetMyIdentityVerificationResponseSchema.parse(response);
  },

  async submitMyVerification(
    payload: SubmitIdentityVerificationFiles,
  ): Promise<SubmitIdentityVerificationResponse> {
    const formData = new FormData()
    formData.append('frontDni', payload.frontDni)
    formData.append('backDni', payload.backDni)
    formData.append('selfie', payload.selfie)

    const response = await apiClient.postFormData<unknown>(
      apiEndpoints.identity.meVerification,
      formData,
    )
    return SubmitIdentityVerificationResponseSchema.parse(response);
  },
};