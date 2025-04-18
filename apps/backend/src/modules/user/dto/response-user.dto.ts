import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class UserWalletDto {
  @Expose()
  id: string;

  @Expose()
  balance: number;
}

@Exclude()
export class UserCountryDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  code: string;
}

@Exclude()
export class UserAvatarImage {
  @Expose()
  id: string;

  @Expose()
  mimeType: string;
}
@Exclude()
export class UserGlobalResponseDto {
  @Expose()
  id: string;

  @Expose()
  fullName: string;

  @Expose()
  username: string;

  @Expose()
  languageCode: string;

  @Expose()
  description: string;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  @Expose()
  country: UserCountryDto;

  @Expose()
  experience: number;

  @Expose()
  rank: string;

  @Expose()
  @Type(() => UserWalletDto)
  wallet: UserWalletDto;

  @Expose()
  totalInvites: number;

  @Expose()
  availableInvites: number;

  @Expose()
  totalReferralPoints: number;

  @Expose()
  showSoulPointsToOthers: boolean;

  @Expose()
  showActivityToOthers: boolean;

  @Expose()
  @Type(() => UserAvatarImage)
  avatarImage: UserAvatarImage;

  @Expose()
  farmingTime: number;

  @Expose()
  farmingRate: number;
}
