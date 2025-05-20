export const UserExampleCreate = {
  firstName: 'John',
  lastName: 'Doe',
  username: 'johndoe',
  languageCode: 'en',
  isActive: true,
  description: 'Люблю программировать и путешествовать.',
};

export const UserExampleRequestUpdate = {
  fullName: 'FirstName SecondName',
  languageCode: 'en',
  description: 'Люблю программировать и путешествовать.',
  countryId: 1,
  showSoulPointsToOthers: true,
  showActivityToOthers: true,
};

export const UserResponseExample = {
  id: 'e0252cb5-9472-42bf-b805-52782a08d9bc',
  fullName: 'John Doe',
  username: 'johndoe',
  languageCode: 'en',
  description: '',
  createdAt: '2025-03-29T12:55:23.708Z',
  updatedAt: '2025-03-29T19:02:23.652Z',
  country: null,
  experience: 0,
  rank: 'user',
  wallet: {
    id: '5bd90dfb-e15f-4a43-bf4c-21c3795dc8fe',
    balance: 0,
  },
  totalInvites: 3,
  availableInvites: 3,
  totalReferralPoints: 0,
  showSoulPointsToOthers: true,
  showActivityToOthers: true,
  avatarImage: {
    id: '011e9a67-b855-444a-a74b-d15445d12983',
    mimeType: 'image/svg+xml',
  },
  farmingTime: 28800,
  farmingRate: 1,
};

export const UserResponsePaginationExample = {
  items: [UserResponseExample],
  total: 1,
  page: 1,
  limit: 10,
  pages: 1,
};

export const LeaderbeardPositionExample = {
  position: 9,
  experience: 0,
  balance: 920,
};

export const LeaderbeardXPExample = [
  {
    id: 'bd995ab8-7506-4c88-a7d9-2863e7a149e4',
    fullName: 'John Doe',
    avatarImage: {
      id: '2feb9e33-a078-408b-8151-34b915d3b26d',
      mimeType: 'image/svg+xml',
    },
    country: {
      code: 'RU',
    },
    experience: 600,
  },
  {
    id: '6ced881d-f284-4fbe-9074-1c2782073049',
    fullName: 'John Doe',
    avatarImage: {
      id: '37bf5a46-e158-4e92-b9e3-4e547109f749',
      mimeType: 'image/svg+xml',
    },
    country: {
      code: 'RU',
    },
    experience: 400,
  },
];

export const LeaderbeardSPExample = [
  {
    id: 'bd995ab8-7506-4c88-a7d9-2863e7a149e4',
    fullName: 'John Doe',
    avatarImage: {
      id: '2feb9e33-a078-408b-8151-34b915d3b26d',
      mimeType: 'image/svg+xml',
    },
    country: {
      code: 'RU',
    },
    waller: { balance: 1020 },
  },
  {
    id: '6ced881d-f284-4fbe-9074-1c2782073049',
    fullName: 'John Doe',
    avatarImage: {
      id: '37bf5a46-e158-4e92-b9e3-4e547109f749',
      mimeType: 'image/svg+xml',
    },
    country: {
      code: 'RU',
    },
    waller: { balance: 1020 },
  },
];
