export enum ActionType {
  redirectToMain = 'REDIRECT_TO_MAIN', // Перенаправить на главную страницу
  redirectToEvent = 'REDIRECT_TO_EVENT', // Перенаправить на страницу события
}

export type Action = {
  actionType?: ActionType;
  eventId?: string;
};
