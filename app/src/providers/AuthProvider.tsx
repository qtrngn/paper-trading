import { useState, useEffect } from "react";
import { onIdTokenChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthContext } from "@/features/auth/authContext";
import { getAccount } from "@/features/auth/api";

// TYPES
import type { ReactNode } from "react";
import type { AuthContextValue, Account } from "@/features/auth/types";
import type { User } from "firebase/auth";


export default function AuthProvider({ children }: { children: ReactNode }) {
    // STATES
    const [user, setUser] = useState<User | null>(null);
    const [account, setAccount] = useState<Account | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const logout = async () => {
        try {
            await signOut(auth);
        } catch {
            setError("Failed to sign out!")
        }
    }

    const refreshAccount = async () => {
        if (!user) return;
        setError(null);
        setLoading(true);
        try {
            // TODO: fetch account using getAccount(idToken)
            const idToken = await user.getIdToken();
            const result = await getAccount(idToken);
            setAccount(result);
           
        } catch {
            setAccount(null); 
            setError("Failed to refresh account")
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let isMounted = true; 
        let authEventVersion = 0;

        const unsubscribe = onIdTokenChanged(auth, async (nextUser) => {
            authEventVersion = authEventVersion + 1;
            const myVersion = authEventVersion;
            
            setError(null);
            const isStale = () => !isMounted || myVersion !== authEventVersion;

        if(!nextUser) {
            setUser(null);
            setAccount(null);
            setLoading(false);
            return;
        } 
        setUser(nextUser);
        setLoading(true);
        try {
            const idToken = await nextUser.getIdToken();
            const result = await getAccount(idToken);
            if (isStale()) return; 
            setAccount(result);
        } catch {
            if (isStale()) return; 
            setAccount(null);
            setError("Failed to load account")
        } finally {
            if (!isStale()) setLoading(false);
        }
     })
    
      return() => {
        isMounted = false;
        unsubscribe();
      };  
   
    }, [])

    const value: AuthContextValue = {
        user,
        account,
        loading,
        error,
        logout,
        refreshAccount,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}












