import { create } from "zustand";
import { useSession } from "./session";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type FetchAccountResult = "ok" | "not_connected";

export type Account = {
  id?: string;
  status?: string;
  cash?: number;
  equity?: number;
  buying_power?: number;
};

function parseJsonSafe(text: string) {
  try { return JSON.parse(text); } catch { return null; }
}

function looksLikeNoAccount(status: number, body: any, rawText: string) {
  if (status === 404) return true; // most APIs use 404
  const code = String(body?.code ?? "").toLowerCase();
  const err  = String(body?.error ?? rawText ?? "").toLowerCase();
  // be generous with patterns seen in various backends
  return [
    "no_account", "not_connected", "account_not_found", "no_brokerage_account",
    "no alpaca account", "no alpaca account_id", "no account id", "no account for user"
  ].some((k) => code.includes(k) || err.includes(k));
}

export const useAccount = create<{
  account: Account | null;
  fetchAccount: () => Promise<FetchAccountResult>;
  reset: () => void;
}>()((set) => ({
  account: null,

  async fetchAccount() {
    const token = await useSession.getState().getIdToken();
    const r = await fetch(`${API}/api/broker/accounts/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const text = await r.text();                // read once
    const body = text ? parseJsonSafe(text) : null;

    // Map any “no account” shape to business state
    if (!r.ok && looksLikeNoAccount(r.status, body, text)) {
      return "not_connected";
    }

    // Real failures bubble up
    if (!r.ok) {
      const msg = body?.error || `HTTP ${r.status}`;
      throw new Error(msg);
    }

    // Success
    const data = body as { ok?: boolean; account?: Account };
    set({ account: data?.account ?? null });
    return "ok";
  },

  reset() { set({ account: null }); },
}));
