import { getDb } from "../db/mongo";

export type PositionDoc = {
  id: string;
  uid: string;
  symbol: string;
  qty: number;
  averageCost: number;
  createdAt: Date;
  updatedAt: Date;
};

export async function getPositionBySymbol(uid: string, symbol: string): Promise<PositionDoc | null> {
  const db = await getDb();
  const positions = db.collection<PositionDoc>("positions");
  const position = await positions.findOne({ uid, symbol });
  return position;
}
