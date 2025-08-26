import { getFirestore } from "firebase-admin/firestore";

export const db = getFirestore();
export const users = () => db.collection("users");


