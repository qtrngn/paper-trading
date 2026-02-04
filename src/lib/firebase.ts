import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { config } from "@/config/config";

export const app = getApps().length ? getApp() : initializeApp(config.firebaseConfig);
export const auth = getAuth(app);



