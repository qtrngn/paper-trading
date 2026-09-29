import type {User} from "firebase/auth"; 

export type AuthState = {
    user: User | null;
    loading: boolean;
    error: string | null;
};
 
export type AuthActions = {
    logout: () => Promise<void>;
};

export type AuthContextValue = AuthState & AuthActions;


