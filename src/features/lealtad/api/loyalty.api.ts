import { apiClient } from '@/lib/api-client';
import { apiEndpoints } from '@rocket-lease/contracts';
import type { LoyaltyProfile, ExperienceTransaction } from '@rocket-lease/contracts';
import { LoyaltyProfileSchema } from '@rocket-lease/contracts';

export async function fetchMyLoyaltyProfile(): Promise<LoyaltyProfile> {
  const res = await apiClient.get<unknown>(apiEndpoints.loyalty.me);
  return LoyaltyProfileSchema.parse(res);
}

export async function fetchMyTransactions(): Promise<ExperienceTransaction[]> {
  const res = await apiClient.get<unknown>(apiEndpoints.loyalty.myTransactions);
  return res as ExperienceTransaction[];
}

export async function fetchUserLevel(userId: string): Promise<{ level: string }> {
  return apiClient.get<{ level: string }>(apiEndpoints.loyalty.user(userId));
}
