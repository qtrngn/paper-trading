import admin from "firebase-admin";

// If you deploy later with env-only secrets, you'll set FIREBASE_SERVICE_ACCOUNT.
// For local dev you're using GOOGLE_APPLICATION_CREDENTIALS=./keys/...
const inline = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!admin.apps.length) {
  admin.initializeApp(
    inline
      ? { credential: admin.credential.cert(JSON.parse(inline)) }
      : { credential: admin.credential.applicationDefault() } // uses GOOGLE_APPLICATION_CREDENTIALS
  );
}

export const auth = admin.auth();
