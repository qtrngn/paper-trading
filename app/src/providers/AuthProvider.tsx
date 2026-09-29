import { useState, useEffect } from "react";
import { onIdTokenChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthContext } from "@/features/auth/authContext";

// TYPES
import type { ReactNode } from "react";
import type { AuthContextValue } from "@/features/auth/types";
import type { User } from "firebase/auth";


export default function AuthProvider({ children }: { children: ReactNode }) {
    // STATES
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const logout = async () => {
        try {
            await signOut(auth);
        } catch {
            setError("Failed to sign out!")
        }
    }

    useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, (nextUser) => {
            setError(null);

        if(!nextUser) {
            setUser(null);
            setLoading(false);
            return;
        } 
        setUser(nextUser);
        setLoading(false);
     })
    
      return() => {
        unsubscribe();
      };  
   
    }, [])

    const value: AuthContextValue = {
        user,
        loading,
        error,
        logout,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}












