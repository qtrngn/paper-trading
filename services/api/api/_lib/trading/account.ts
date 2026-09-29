import { getDb } from '../db/mongo';

const STARTING_CASH = 100_000;

export type AccountDoc = {
  uid: string;
  cash: number;
  createdAt: Date;
  updatedAt: Date;
};

export async function getOrCreateAccount(uid: string): Promise<AccountDoc> {
  const db = await getDb();
  const accounts = db.collection<AccountDoc>('accounts');
  if (!global._mongoIndexesEnsured) {
    await accounts.createIndex({ uid: 1 }, { unique: true });
    global._mongoIndexesEnsured = true;
  }

  const now = new Date();
  const account = await accounts.findOneAndUpdate(
    { uid },
    {
      $setOnInsert: {
        uid,
        cash: STARTING_CASH,
        createdAt: now,
        updatedAt: now,
      },
    },
    {
      upsert: true,
      returnDocument: 'after',
    },
  );

  if (!account) {
    throw new Error('Failed to create or retrieve account');
  }
  return account;
}
