import {getAdmin} from './firebaseAdmin';

export async function requireUid(req:any): Promise<string> {
    const header = req.headers.authorization || "";
    const match = header.match(/^Bearer (.+)$/);
    if (!match) throw new Error("Missing authorization token")

    const token = match[1];
    const admin = getAdmin();
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded.uid;  
}