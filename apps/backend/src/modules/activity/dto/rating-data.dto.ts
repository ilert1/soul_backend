import { Activity, Event, Rating } from '@prisma/client';

export type CombinedTypeSetRating = Omit<
  Activity,
  'userId' | 'joinedAt' | 'isConfirmedAt'
> & {
  event: EventWithRating & { ratingDetails: Omit<Rating, 'eventId'> | null };
};

export type CombinedTypeCancelRating = Omit<
  Activity,
  'joinedAt' | 'eventId' | 'isConfirmed' | 'isConfirmedAt' | 'receivedPoints'
> & {
  event: Partial<Event> & { ratingDetails: Omit<Rating, 'eventId'> | null };
};

type EventWithRating = Omit<
  Event,
  | 'title'
  | 'description'
  | 'imageId'
  | 'entryCondition'
  | 'currencyId'
  | 'entryFee'
  | 'guestLimit'
  | 'creatorId'
  | 'createdAt'
  | 'updatedAt'
  | 'isArchived'
  | 'placeId'
> & { ratingDetails: Omit<Rating, 'eventId'> | null };
