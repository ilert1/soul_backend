type RewardMap = Record<number, number>;

// Награды за чекин
export const checkinReward: RewardMap = {
  1: 2,
  2: 4,
  3: 8,
  4: 16,
  5: 32,
  6: 64,
  7: 128,
} as const;
