import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSession } from "../stores/session";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

// BACKGROUND
import bg from "../images/bg.png";

export default function Register() {
  const nav = useNavigate();
  const register = useSession((s) => s.register);

  // keep same input logic/state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // UI-only state for show/hide (doesn't change submit logic)
  const [showPw, setShowPw] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await register(email, password);
      nav("/gate");
    } catch (e: any) {
      setErr(e?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="h-screen w-screen grid lg:grid-cols-2 bg-[#F5F7F8]">
      {/* BRAND */}
      <section className="relative hidden lg:block" aria-labelledby="promo-title">
        {/* BACKGROUND */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat h-full"
          style={{ backgroundImage: `url(${bg})` }}
          aria-hidden="true"
        />
        {/* OVERLAY */}
        <div className="absolute inset-0 bg-cyan-300/25 mix-blend-multiply" aria-hidden="true" />
        <div className="relative h-full">
          <header className="absolute top-8 left-10 text-2xl font-semibold text-black">
            papertrading
          </header>

          <div className="absolute left-10 top-52 max-w-xl">
            <p className="uppercase tracking-[0.15em] text-sm text-black/70 pl-1 ">
              WELCOME
            </p>
            <h1 id="promo-title" className="mt-3 font-serif text-[48px] leading-[1.1] text-black ">
              Simulated trades
              <br />
              Real insights
            </h1>
            <p className="mt-4 text-black/75 leading-relaxed">
              Papertrading is a simulated trading app where you can practice strategies with real-time
              prices, place virtual buy/sell orders, and track performance without putting real money
              on the line.
            </p>
          </div>
        </div>
      </section>

      {/* REGISTER CARD */}
      <section className="flex items-center justify-center p-6" aria-labelledby="register-title">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-[0_1px_0_rgba(0,0,0,0.06),0_20px_40px_rgba(0,0,0,0.06)]">
          <h2 id="register-title" className="text-center text-2xl font-semibold text-black">
            Create your account
          </h2>

          <form onSubmit={onSubmit} className="mt-6 space-y-4" aria-describedby={err ? "form-error" : undefined}>
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full h-12 rounded-xl border border-black/15 px-4 outline-none focus:ring-2 focus:ring-black/80 text-black"
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type={showPw ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="w-full h-12 rounded-xl border border-black/15 px-4 pr-14 outline-none focus:ring-2 focus:ring-black/80 text-black"
              />

              
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-black text-white leading-none hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-white/70"
                aria-pressed={showPw}
                aria-label={showPw ? "Hide password" : "Show password"}
                title={showPw ? "Hide" : "Show"}
              >
                {showPw ? (
                  <EyeSlashIcon className="h-5 w-5 block" aria-hidden="true" />
                ) : (
                  <EyeIcon className="h-5 w-5 block" aria-hidden="true" />
                )}
              </button>
            </div>

            {err && (
              <div id="form-error" className="text-red-600 text-sm" role="alert" aria-live="assertive">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              aria-busy={busy}
              className="w-full h-11 rounded-lg bg-black text-white disabled:opacity-60"
            >
              {busy ? "…" : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-black">
            Have an account?{" "}
            <Link to="/login" className="underline">
              Log in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
