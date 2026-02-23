import axios from "axios"; 

export const isRequestCanceled = (err:unknown): boolean =>
    axios.isAxiosError(err) && err.code === "ERR_CANCELED";

export const toErrorMessage = (err: unknown): string => {
    if (!axios.isAxiosError(err)) {
        return err instanceof Error ? err.message : "Something went wrong"
    }

    const status = err?.response?.status; 
    const serverMsg = (err?.response?.data as {error?: string} | undefined)
        ?.error?.trim();

    if (serverMsg) return serverMsg;
    if (status === 401) return "Unauthorize";
    if (typeof status === "number") return `Request failed (${status})`;
    return "Network error"
} 



    


