import { requireUid } from '../_lib/requireUid';
import { getDb } from '../_lib/mongo';

const STARTING_CASH= 100_000; 

type AccountDoc = {
    uid: string; 
    cash: number;
    createAt: Date; 
    updateAt: Date;
}

export default async function handler(req: any, res:any) {
    if (req.method !== "GET") {
        return res.status(405).json({error: "Method is not allowed"})
    }
    try {
        const uid = await requireUid(req);
        const db = await getDb();
        const accounts = db.collection<AccountDoc>("accounts");

        if (!global._mongoIndexesEnsured) {
            await accounts.createIndex({uid:1}, {unique:true})
        }

        const now = new Date(); 

        await accounts.updateOne(
            {uid},
            {$setOnInsert: {uid, cash: STARTING_CASH, createdAt: now},
            $set: {updatedAt: now},
        }, 
        { upsert: true}
        )
        const account = await accounts.findOne (
            {uid},
            {projection: {_id: 0, uid: 0}}
        );
        return res.status(200).json({account})

    } catch (err:unknown) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Error in in api/account:", err)
        }
        return res.status(401).json({error: "Unauthorize"})
    }
}