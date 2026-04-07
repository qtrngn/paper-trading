import { getDb } from "../db/mongo";

const STARTING_CASH = 100_000;

export type AccountDoc = {
  uid: string;
  cash: number;
  createdAt: Date;
  updatedAt: Date;
};

export async function getOrCreateAccount(uid: string): Promise<AccountDoc> {
  const db = await getDb();
  const accounts = db.collection<AccountDoc>("accounts");
  if (!global._mongoIndexesEnsured) {
    await accounts.createIndex({ uid: 1 }, { unique: true });
    global._mongoIndexesEnsured = true;
  }

  const now = new Date();
  await accounts.updateOne({ uid }, { $setOnInsert: { uid, cash: STARTING_CASH, createdAt: now }, $set: { updatedAt: now } }, { upsert: true });
  const account = await accounts.findOne({ uid });
  if (!account) {
    throw new Error("Failed to create or retrieve account");
  }
  return account;
}
