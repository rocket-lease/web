import type { UserLevel } from '@rocket-lease/contracts'

export const LEVEL_DISCOUNT_PCT: Record<UserLevel, number> = {
  bronze: 0,
  silver: 5,
  gold: 10,
  platinum: 15,
}
