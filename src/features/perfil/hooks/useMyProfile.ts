import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/features/perfil/api/profile.api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { type UpdateMyProfileRequest } from '@rocket-lease/contracts';

const myProfileQueryKey = ['profile', 'me'] as const;

export function useMyProfile() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const profileQuery = useQuery({
    queryKey: myProfileQueryKey,
    enabled: isAuthenticated,
    queryFn: async () => {
      return profileApi.getMyProfile();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: UpdateMyProfileRequest) => {
      return profileApi.updateMyProfile(payload);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(myProfileQueryKey, updated);
      queryClient.setQueryData(['profile', updated.id], updated);
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      return profileApi.uploadAvatar(file);
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
