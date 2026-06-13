import { useQuery } from '@tanstack/react-query';
import { fetchMyLoyaltyProfile, fetchMyTransactions } from '../api/loyalty.api';

export function useLoyaltyProfile() {
  return useQuery({
    queryKey: ['loyalty', 'profile'],
    queryFn: fetchMyLoyaltyProfile,
    staleTime: 30_000,
  });
}

export function useLoyaltyTransactions() {
  return useQuery({
    queryKey: ['loyalty', 'transactions'],
    queryFn: fetchMyTransactions,
    staleTime: 60_000,
  });
}
