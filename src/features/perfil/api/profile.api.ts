import {
  GetMyProfileResponseSchema,
  type GetMyProfileResponse,
  type GetUserProfileResponse,
  GetUserProfileResponseSchema,
  UpdateMyProfileRequestSchema,
  UpdateMyProfileResponseSchema,
  type UpdateMyProfileRequest,
  type UpdateMyProfileResponse,
} from '@rocket-lease/contracts';
import { apiClient } from '@/lib/api-client';

export const profileApi = {
  async getMyProfile(): Promise<GetMyProfileResponse> {
    const raw = await apiClient.get<unknown>('/profile/me');
    return GetMyProfileResponseSchema.parse(raw);
  },

  async getProfileById(profileId: string): Promise<GetUserProfileResponse> {
    const raw = await apiClient.get<unknown>(`/profile/${profileId}`);
    return GetUserProfileResponseSchema.parse(raw);
  },

  async updateMyProfile(
    body: UpdateMyProfileRequest,
  ): Promise<UpdateMyProfileResponse> {
    const payload = UpdateMyProfileRequestSchema.parse(body);
    const raw = await apiClient.patch<unknown>('/profile/me', payload);
    return UpdateMyProfileResponseSchema.parse(raw);
  },

  async uploadAvatar(file: File): Promise<GetMyProfileResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const raw = await apiClient.postFormData<unknown>(
      '/profile/me/avatar',
      formData,
    );
    return GetMyProfileResponseSchema.parse(raw);
  },
};
