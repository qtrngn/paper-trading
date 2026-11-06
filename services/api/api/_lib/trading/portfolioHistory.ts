import {getDb} from "../db/mongo";

export type PortfolioHistoryDoc = {
    uid: string;
    timestamp: Date;
    cash: number;
    marketValue: number | null;
    equity: number | null; 
}

export async function savePortfolioSnapshot(snapshot: PortfolioHistoryDoc): Promise<void> {
    const db = await getDb();
    const history = db.collection<PortfolioHistoryDoc>("portfolioHistory");
    await history.insertOne(snapshot);
}

export async function getPortfolioHistory(uid: string): Promise<PortfolioHistoryDoc[]> {
    const db = await getDb();
    const history = db.collection<PortfolioHistoryDoc>("portfolioHistory");
    return await history.find({ uid }).sort({ timestamp: 1 }).toArray();
}

export async function recordPortfolioSnapshot(uid: string): Promise<void> {
    
}