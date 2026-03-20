import { auth } from "./firebase";

export async function getCurrentUserToken() {
    const user = auth.currentUser;
    if (!user) {
       throw new Error('User is not signed in'); 
    }
    const token = await user.getIdToken();
    return token; 
}