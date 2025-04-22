// Награды за чекин
type CheckinRewardMap = Record<number, number>;

export const checkinReward: CheckinRewardMap = {
  1: 2,
  2: 4,
  3: 8,
  4: 16,
  5: 32,
  6: 64,
  7: 128,
} as const;
