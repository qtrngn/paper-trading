import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../stores/session";
import { useAccount } from "../stores/account";

export default function Gate() {
  const nav = useNavigate();
  const { user, loading } = useSession();
  const fetchAccount = useAccount((s) => s.fetchAccount);
  const [msg, setMsg] = useState("Checking your account…");

  useEffect(() => {
    let cancelled = false;

    async function go() {
      if (loading) return;

      if (!user) {
        nav("/login", { replace: true });
        return;
      }

      try {
        const res = await fetchAccount();
        if (cancelled) return;

        if (res === "not_connected") {
          setMsg("No account on file — routing to KYC…");
          nav("/onboarding/kyc", { replace: true });
          return;
        }

        const acct = useAccount.getState().account;
        const status = (acct?.status ?? "").toUpperCase();

        if (status === "SUBMITTED" || status === "IN_REVIEW" || status.includes("PENDING")) {
          setMsg("Your application is under review — routing…");
          nav("/onboarding/review", { replace: true });
          return;
        }

        setMsg("All set — routing to dashboard…");
        nav("/dashboard", { replace: true });
      } catch (e: any) {
        const m = String(e?.message || "");

        if (/(no.*alpaca.*account|no.*account.*for user|no_account|account_not_found)/i.test(m)) {
          nav("/onboarding/kyc", { replace: true });
          return;
        }

        if (m.includes("401") || m.toLowerCase().includes("auth")) {
          nav("/login", { replace: true });
        } else {
          setMsg(`API error: ${m}`);
        }
      }
    }

    go();
    return () => { cancelled = true; };
  }, [user, loading, fetchAccount, nav]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-sm text-black/70">{msg}</div>
    </main>
  );
}
