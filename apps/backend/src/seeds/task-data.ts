import { TaskList, TaskType } from '@prisma/client';

export const tasks = [
  {
    key: TaskList.CHECKIN,
    type: TaskType.DAILY,
    title: 'Ежедневный чекин',
    description: 'Заходи каждый день, чтобы получать награды!',
    goal: 7,
    rewardSp: 0,
  },
  {
    key: TaskList.PROFILE_COMPLETED,
    type: TaskType.SECTION_TRAINING,
    title: 'Заполнить профиль',
    description: 'Заполните свой профиль, чтобы получить награду!',
    goal: 1,
    rewardSp: 100,
  },
];
