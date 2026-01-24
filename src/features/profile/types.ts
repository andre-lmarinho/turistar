export type ProfileRecord = {
  userId: string;
  slug: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type ProfileSummary = {
  userId: string;
  slug: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};
