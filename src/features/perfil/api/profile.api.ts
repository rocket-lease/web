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

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000';

async function request<T>(
  path: string,
  init: RequestInit,
  parser: (input: unknown) => T,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const detail =
      typeof payload === 'object' && payload && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : 'Request failed';

    const error = new Error(detail) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return parser(payload);
}

export const profileApi = {
  async getMyProfile(accessToken: string): Promise<GetMyProfileResponse> {
    return request(
      '/profile/me',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      (input) => GetMyProfileResponseSchema.parse(input),
    );
  },

  async getProfileById(profileId: string): Promise<GetUserProfileResponse> {
    const raw = await apiClient.get<unknown>(`/profile/${profileId}`);
    return GetUserProfileResponseSchema.parse(raw);
  },

  async updateMyProfile(
    accessToken: string,
    body: UpdateMyProfileRequest,
  ): Promise<UpdateMyProfileResponse> {
    const payload = UpdateMyProfileRequestSchema.parse(body);

    return request(
      '/profile/me',
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(payload),
      },
      (input) => UpdateMyProfileResponseSchema.parse(input),
    );
  },

  async uploadAvatar(accessToken: string, file: File): Promise<GetMyProfileResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/profile/me/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const detail =
        typeof payload === 'object' && payload && 'message' in payload
          ? String((payload as { message: unknown }).message)
          : 'Request failed';

      const error = new Error(detail) as Error & { status?: number };
      error.status = response.status;
      throw error;
    }

    return GetMyProfileResponseSchema.parse(payload);
  },
};
