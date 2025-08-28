import { useSession } from "../stores/session";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function api(path: string, init: RequestInit = {}) {
  const t = await useSession.getState().getIdToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${t}`);
  headers.set(
    "Content-Type",
    headers.get("Content-Type") ?? "application/json"
  );

  const url = path.startsWith("http") ? path : `${API}${path}`;
  return fetch(url, { ...init, headers });
}
