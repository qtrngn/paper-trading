import {requireUid} from './_lib/requireUid';

export default async function handler(req:any, res:any) {
    try {
        if (req.method !== "GET") {
            return res.status(405).json({error: "Method not allowed"})
        }

        const uid = await requireUid(req);
        return res.status(200).json({uid});
    } catch (err:any) {
        return res.status(401).json({error: err?.message || "Unauthorized"})
    }
}