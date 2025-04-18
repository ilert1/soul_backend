export const NotificationResponseExample = {
  id: '407e0g9i-ei65-7d9g-d9ih-43h6ff98i68d',
  title: 'Системное уведомление',
  data: {
    message: 'У вас есть новое уведомление',
  },
  isRead: false,
  userId: 'e64c7d5e-e38a-461a-99e1-38eae06f75a0',
  createdAt: '2025-02-26T13:50:00.000Z',
  updatedAt: '2025-02-26T13:50:00.000Z',
};

export const NotificationEventUpdateExample = {
  id: '104b7d6f-bf32-4a6d-a6fe-10e3cc65f95a',
  title:
    'Создатель изменил детали встречи «Дегустация крафтового пива»: дата, время',
  data: {
    type: 'event.update',
    id: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
    title: 'Дегустация крафтового пива',
    date: '26.02.2025',
    changes: 'дата, время',
  },
  isRead: false,
  userId: 'e64c7d5e-e38a-461a-99e1-38eae06f75a0',
  createdAt: '2025-02-26T10:00:00.000Z',
  updatedAt: '2025-02-26T10:00:00.000Z',
};

export const NotificationEventCancelExample = {
  id: '205c8e7g-cg43-5b7e-b7gf-21f4dd76g46b',
  title: 'Создатель отменил встречу «Дегустация крафтового пива»',
  data: {
    type: 'event.archive',
    id: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
    title: 'Дегустация крафтового пива',
    date: '26.02.2025',
  },
  isRead: false,
  userId: 'e64c7d5e-e38a-461a-99e1-38eae06f75a0',
  createdAt: '2025-02-26T11:30:00.000Z',
  updatedAt: '2025-02-26T11:30:00.000Z',
};

export const PaginatedNotificationResponseExample = {
  items: [
    NotificationResponseExample,
    NotificationEventUpdateExample,
    NotificationEventCancelExample,
  ],
  total: 3,
  page: 1,
  size: 10,
  pages: 1,
};
