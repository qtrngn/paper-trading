import admin from "firebase-admin";

function loadServiceAccount() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (b64) {
    const json = Buffer.from(b64, "base64").toString("utf8");
    return JSON.parse(json);
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Missing FIREBASE_SERVICE_ACCOUNT");
  return JSON.parse(raw);
}

export function getAdmin() {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(loadServiceAccount()),
    });
  }
  return admin;
}
