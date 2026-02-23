import type {User} from "firebase/auth"; 

export type Account = {
    cash: number;
    createdAt: string;
    updatedAt: string;
};

export type AuthState = {
    user: User | null;
    account: Account | null; 
    loading: boolean;
    error: string | null;
};
 
export type AuthActions = {
    refreshAccount: () => Promise<void>
    logout: () => Promise<void>;
};

export type AuthContextValue = AuthState & AuthActions;


