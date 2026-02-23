import { useContext } from "react";
import { AuthContext } from "./authContext";
import type { AuthContextValue } from "./types"; 

export function useAuth(): AuthContextValue {
 const authContext = useContext(AuthContext);
 if (!authContext) {
    throw new Error("useAuth must be used within AuthProvider");
 }
 return authContext;
}