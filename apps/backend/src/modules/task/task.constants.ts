import { TaskList } from '@prisma/client';

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

export const subTaskToMainTask: Partial<Record<TaskList, TaskList>> = {
  [TaskList.SUBSCRIBED_INSTAGRAM]: TaskList.CHECKED_SOCIAL_MEDIA,
  [TaskList.SUBSCRIBED_SOUL_FORUM]: TaskList.CHECKED_SOCIAL_MEDIA,
  [TaskList.SHARED_WITH_FRIEND]: TaskList.SHARED_ABOUT_SOUL,
  [TaskList.ADDED_REFLINK_IN_TG_PROFILE]: TaskList.SHARED_ABOUT_SOUL,
  [TaskList.VOTED_SOUL_FORUM]: TaskList.PREMIUM_SUPPORT,
} as const;

export const mainTaskToSubTasks: Partial<Record<TaskList, TaskList[]>> = {
  [TaskList.CHECKED_SOCIAL_MEDIA]: [
    TaskList.SUBSCRIBED_INSTAGRAM,
    TaskList.SUBSCRIBED_SOUL_FORUM,
  ],
  [TaskList.SHARED_ABOUT_SOUL]: [
    TaskList.SHARED_WITH_FRIEND,
    TaskList.ADDED_REFLINK_IN_TG_PROFILE,
  ],
  [TaskList.PREMIUM_SUPPORT]: [TaskList.VOTED_SOUL_FORUM],
} as const;
