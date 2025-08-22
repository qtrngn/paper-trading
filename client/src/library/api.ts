import { useSession } from "../stores/session";

export async function api(path: string, init: RequestInit = {}) {
    const t = await useSession.getState().getIdToken();
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${t}`);
    headers.set("Content-Type", headers.get("Content-Type") ?? "application/json")
    return fetch (path, {...init, headers});
}