import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/features/perfil/api/profile.api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { type UpdateMyProfileRequest } from '@rocket-lease/contracts';

const myProfileQueryKey = ['profile', 'me'] as const;

export function useMyProfile(profileId?: string) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const isOwnProfile = !profileId;
  const profileQueryKey = profileId ? (['profile', profileId] as const) : myProfileQueryKey;

  const profileQuery = useQuery({
    queryKey: profileQueryKey,
    enabled: isOwnProfile ? isAuthenticated : Boolean(profileId),
    queryFn: async () => {
      if (profileId) {
        return profileApi.getProfileById(profileId);
      }
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
    isOwnProfile,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    isUploadingAvatar: uploadAvatarMutation.isPending,
  };
}
