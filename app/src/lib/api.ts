import axios from "axios";
import { getCurrentUserToken } from "./auth";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";

export const api = axios.create({
    baseURL: "",
    timeout: 10000,
});

// REQUEST
api.interceptors.request.use(async (config) => {
    const token = await getCurrentUserToken();
config.headers = config.headers ?? {};
config.headers.Authorization = `Bearer ${token}`;

return config;
},
(error) => Promise.reject(error)
);

// RESPONSE
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error?.response?.status;
        if (status === 401) {
            await signOut(auth);
        }
        return Promise.reject(error);
    }
)


