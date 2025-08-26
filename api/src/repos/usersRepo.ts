import { users } from "../db";

// READ THE FIRESTORE DOCUMENT FOR THE USER WITH THE GIVEN UID 
// IF IT EXISTS, RETURN THE DATA
// IF NOT, RETURN NULL
export async function getUser(uid: string) {
 const snap = await users().doc(uid).get();
 return snap.exists ? (snap.data() as any) : null;
}   

// CREATE OR UPDATE THE USER WITH THE GIVEN PATCH
// IF THE USER DOESN'T EXIST, IT WILL BE CREATED
// IF IT DOES EXIST, THE PATCH WILL BE MERGED WITH THE EXISTING DATA
export async function upsertUser (uid: string, patch:any) {
    await users().doc(uid).set(patch, { merge: true });
}

