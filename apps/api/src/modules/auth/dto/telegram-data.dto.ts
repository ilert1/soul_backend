export class UserDataDto {
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
}

export class ChatDataDto {
  id: number;
  title: string;
  username?: string;
  type: string;
  photoUrl?: string;
}

export class InitDataUnsafeDto {
  queryId: string;
  user: UserDataDto;
  chat: ChatDataDto;
  chatType?: string;
  chatInstance?: string;
  startParam?: string;
  canSendAfter?: number;
  authDate: number;
  hash: string;
}

export class TelegramDataDto {
  initData: string;
  initDataUnsafe: InitDataUnsafeDto;
  invitationHash?: string;
}
