import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSession } from "../stores/session";

export default function Register() {
  const nav = useNavigate();
  const register = useSession(s => s.register);
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null); const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setErr(null); setBusy(true);
    try { await register(email, password); nav("/dashboard"); }
    catch (e: any) { setErr(e?.message || "Registration failed"); }
    finally { setBusy(false); }
  }

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-4">Create account</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input className="border p-2 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2 rounded" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button disabled={busy} className="bg-black text-white rounded p-2">{busy ? "…" : "Create account"}</button>
      </form>
      <p className="text-sm mt-3">Have an account? <Link to="/login" className="underline">Login</Link></p>
    </div>
  );
}
