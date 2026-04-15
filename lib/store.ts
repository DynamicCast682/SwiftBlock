export interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __swiftblock_users: StoredUser[] | undefined;
}

export const users: StoredUser[] =
  global.__swiftblock_users ?? (global.__swiftblock_users = []);
