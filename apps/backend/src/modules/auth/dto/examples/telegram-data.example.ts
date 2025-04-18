export const TelegramDataExample = {
  initData:
    'query_id=AAHdF6IQAAAAAN0XohDhrB8b&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22John%22%2C%22last_name%22%3A%22Doe%22%2C%22username%22%3A%22johndoe%22%2C%22language_code%22%3A%22en%22%7D&auth_date=1600000000&hash=abc123def456',
  initDataUnsafe: {
    queryId: 'AAHdF6IQAAAAAN0XohDhrB8b',
    user: {
      id: '123456789',
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      languageCode: 'en',
      isPremium: true,
      photoUrl: 'https://example.com/photo.jpg',
    },
    chat: {
      id: 123456789,
      title: 'My Chat',
      type: 'group',
      photoUrl: 'https://example.com/chat_photo.jpg',
    },
    chatType: 'group',
    chatInstance: '123456789',
    startParam: 'start',
    canSendAfter: 10,
    authDate: 1600000000,
    hash: 'abc123def456',
  },
  invitationHash: 'abc123def456',
};

export const AuthResponseExample = {
  id: 'string',
  accessToken: 'string',
  refreshToken: 'string',
  action: null,
  analyzeProfile: null,
};

export const AuthResponseExampleNewUser = {
  id: 'string',
  accessToken: 'string',
  refreshToken: 'string',
  action: null,
  analyzeProfile: {
    pointsForPremium: 1000,
    ageOfProfileYears: 9,
    pointsForAgeOfProfile: 900,
    basePointsForRegistration: 20,
  },
};

export const AuthResponseExampleWithEventInvite = {
  id: 'string',
  accessToken: 'string',
  refreshToken: 'string',
  action: {
    actionType: 'REDIRECT_TO_EVENT',
    eventId: 'string',
  },
  analyzeProfile: {
    pointsForPremium: 1000,
    ageOfProfileYears: 9,
    pointsForAgeOfProfile: 900,
    basePointsForRegistration: 20,
  },
};

export const AuthResponseExampleWithInvite = {
  id: 'string',
  accessToken: 'string',
  refreshToken: 'string',
  action: {
    actionType: 'REDIRECT_TO_MAIN',
    eventId: 'string',
  },
  analyzeProfile: {
    pointsForPremium: 1000,
    ageOfProfileYears: 9,
    pointsForAgeOfProfile: 900,
    basePointsForRegistration: 20,
  },
};
