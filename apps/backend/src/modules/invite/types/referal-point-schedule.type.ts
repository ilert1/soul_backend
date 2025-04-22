export type InviteeWalletsWithSumOfTx = Array<{
  fromWalletId: string;
  _sum: {
    amount: number | null;
  };
}> | null;

export type InviterDataFromDB = {
  id: string;
  user: {
    inviteeUser: {
      id: string;
      inviterUser: {
        id: string;
        wallet: {
          id: string;
        } | null;
      };
    } | null;
  } | null;
};
export type InviteData = {
  inviteId: string;
  inviterUserId: string;
  inviterWalletId: string;
};
export type InviterDataMap = Map<string, InviteData>;
