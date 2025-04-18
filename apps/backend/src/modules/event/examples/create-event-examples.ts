export const CreateEventExamples = {
  example: {
    summary:
      'Пример данных для создания события с платным входом и бонусным фондом 1000 на первые 5 гостей',
    value: {
      title: 'Концерт классической музыки',
      description:
        'Уникальная возможность насладиться живым исполнением классической музыки от местных артистов.',
      startDate: '2025-11-15T00:00:00Z',
      finishDate: '2025-11-15T00:01:00Z',
      entryCondition: 'PAID',
      currencyId: 11,
      entryFee: 300,
      guestLimit: 100,
      place: {
        name: 'Концертный зал Филармонии',
        description: 'Один из лучших залов для классической музыки в городе.',
        latitude: 55.751244,
        longitude: 37.618423,
        address: 'г. Москва, ул. Арбат, 10',
      },
      deposit: 1000,
      bonusDistributionType: 'FIRST_N',
      bonusDistributionN: 5,
    },
  },
  example2: {
    summary:
      'Пример данных для создания встречи с бесплатным входом и бонусным фондом 1000 на всех гостей',
    value: {
      title: 'Литературная встреча с автором',
      description:
        'Интерактивная встреча с известным писателем, где он расскажет о своем новом романе и ответит на вопросы зрителей.',
      startDate: '2025-12-01T18:00:00Z',
      finishDate: '2025-12-01T20:00:00Z',
      entryCondition: 'FREE',
      guestLimit: 50,
      place: {
        name: 'Культурный центр «Чайка»',
        description:
          'Современное пространство для культурных мероприятий и мастер-классов.',
        latitude: 55.7558,
        longitude: 37.6173,
        address: 'г. Москва, ул. Тверская, 20',
      },
      deposit: 1000,
      bonusDistributionType: 'ALL',
    },
  },
};
