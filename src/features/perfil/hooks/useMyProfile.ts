import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/features/perfil/api/profile.api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { type UpdateMyProfileRequest } from '@/features/perfil/types/profile.contract';

const myProfileQueryKey = ['profile', 'me'] as const;

export function useMyProfile(profileId?: string) {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const accessToken = session?.access_token ?? localStorage.getItem('rocket_lease:access_token');
  const isOwnProfile = !profileId;
  const profileQueryKey = profileId ? (['profile', profileId] as const) : myProfileQueryKey;

  const profileQuery = useQuery({
    queryKey: profileQueryKey,
    enabled: isOwnProfile ? Boolean(accessToken) : Boolean(profileId),
    queryFn: async () => {
      if (profileId) {
        return profileApi.getProfileById(profileId);
      }
      if (!accessToken) throw new Error('Missing session token');
      return profileApi.getMyProfile(accessToken);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: UpdateMyProfileRequest) => {
      if (!accessToken) {
        throw new Error('Missing session token');
      }
      return profileApi.updateMyProfile(accessToken, payload);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(myProfileQueryKey, updated);
      queryClient.setQueryData(['profile', updated.id], updated);
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!accessToken) {
        throw new Error('Missing session token');
      }
      return profileApi.uploadAvatar(accessToken, file);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(myProfileQueryKey, updated);
      queryClient.setQueryData(['profile', updated.id], updated);
    },
  });

  return {
    ...profileQuery,
    isOwnProfile,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    isUploadingAvatar: uploadAvatarMutation.isPending,
  };
}
