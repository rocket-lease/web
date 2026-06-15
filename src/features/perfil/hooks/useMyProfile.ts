import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/features/perfil/api/profile.api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { type UpdateMyProfileRequest } from '@rocket-lease/contracts';

const myProfileQueryKey = ['profile', 'me'] as const;

export function useMyProfile() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const accessToken = session?.access_token ?? localStorage.getItem('rocket_lease:access_token');

  const profileQuery = useQuery({
    queryKey: myProfileQueryKey,
    enabled: Boolean(accessToken),
    queryFn: async () => {
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
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    isUploadingAvatar: uploadAvatarMutation.isPending,
  };
}
