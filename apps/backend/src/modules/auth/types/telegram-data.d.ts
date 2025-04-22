export type TelegramData = {
  initData: string;
  initDataUnsafe: initDataUnsafe;
  invitationHash?: string;
};

type initDataUnsafe = {
  queryId: string;
  user: UserData;
  chat: ChatData;
  chatType?: string;
  chatInstance?: string;
  startParam?: string;
  canSendAfter?: number;
  authDate: number;
  hash: string;
  isBot?: boolean;
};

type UserData = {
  id: string;
  username?: string;
  firstName: string;
  lastName?: string;
  isBot?: boolean;
  languageCode?: string;
  isPremium?: boolean;
  addedToAttachmentMenu?: boolean;
  allowsWriteToPm?: boolean;
  photoUrl?: string;
};

type ChatData = {
  id: number;
  title: string;
  username?: string;
  type: string;
  photoUrl?: string;
};

type TelegramUserDataAnalyze = {
  pointsForPremium: number;
  ageOfProfileYears: number;
  pointsForAgeOfProfile: number;
  basePointsForRegistration: number;
};
