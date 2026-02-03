// LOGIN
export type LoginInput = {
    email: string;
    password: string;
}

// REGISTER
export type RegisterInput = {
    email: string;
    password: string;
    confirmPassword: string;
}

// AUTH USER
export type AuthUser ={
    uid: string;
    email: string | null;
    displayName: string | null;
} 

// AUTH STATUS
export type AuthStatus = "loading" | "signin" | "register" | "error" | "success" | "logout"; 

// AUTH STATE
export type AuthState = {
    status: AuthStatus;
    user: AuthUser | null;
}

// AUTH ERROR CODE
export type AuthErrorCode = "auth/user-not-found" | "auth/invalid-email" | "auth/invalid-password" | "auth/email-already-exists" | "auth/invalid-credential" | "auth/too-many-requests" | "auth/internal-error" | "unknown";

// AUTH ERROR
export type AuthError = {
    code: AuthErrorCode;
    message: string;
}