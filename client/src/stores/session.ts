import { create } from "zustand";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  type User,
} from "firebase/auth";

// INITIALIZING FIREBASE
const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
});
export const auth = getAuth(app);

// DEFINED TYPES
type SessionState = {
  user: User | null;
  loading: boolean;
  // actions types
  init: () => void;
  register: ( email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getIdToken: () => Promise<string>;
};

export const useSession = create<SessionState>((set, get) => ({
  user: null,
  loading: true,
  init: () => {
    onAuthStateChanged(auth, (u) => set({ user: u, loading: false }));
  },
//   REGISTER
  register: async (email, password) => {
    await createUserWithEmailAndPassword(auth, email, password);
  },
//   LOGIN
  login: async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  },
//   LOGOUT
logout: async () => {await signOut(auth); },
// RESET PASSWORD
resetPassword: async (email) => { await sendPasswordResetEmail (auth, email); },
// GET ID TOKEN
getIdToken: async () => {
    const token = await get().user?.getIdToken();
    if(!token) throw new Error("Not authenticated");
    return token;
},
}));


