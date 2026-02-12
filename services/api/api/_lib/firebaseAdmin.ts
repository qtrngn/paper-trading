import admin from 'firebase-admin';

function loadServiceAccount() {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw) throw new Error("Missing FIREBASE_SERVICE_ACCOUNT");
    return JSON.parse(raw);
}

export function getAdmin() {
    if (admin.apps.length === 0) {
        admin.initializeApp({
            credential: admin.credential.cert(loadServiceAccount()),
        })
    }
    return admin;
}