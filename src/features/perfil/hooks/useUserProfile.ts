import { useQuery } from '@tanstack/react-query';
import { profileApi } from '@/features/perfil/api/profile.api';

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['profile', userId] as const,
    enabled: Boolean(userId),
    queryFn: () => profileApi.getProfileById(userId),
  });
}
