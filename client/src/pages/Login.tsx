import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSession } from "../stores/session";

export default function Login() {
  const nav = useNavigate();
  const login = useSession((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login(email, password);
      nav("/dashboard");
    } catch (e: any) {
      setErr(e?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* LEFT: hero */}
      <div className="relative hidden lg:block">
        {/* Use your own water image here for a perfect match */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(/images/water-hero.jpg)", // put an image in /public/images
          }}
        />
        {/* soft teal wash if your image is darker */}
        <div className="absolute inset-0 bg-cyan-300/25 mix-blend-multiply" />
        <div className="relative h-full">
          <div className="absolute top-8 left-10 text-2xl font-semibold">
            Papertrading
          </div>

          <div className="absolute left-10 right-10 top-32 max-w-xl">
            <div className="uppercase tracking-[0.15em] text-sm text-black/70">
              Limited time
            </div>
            <h1 className="mt-3 font-serif text-[48px] leading-[1.1]">
              Dive into our
              <br />
              Summer Match
            </h1>
            <p className="mt-4 text-black/75 leading-relaxed">
              We’re finishing summer strong with a 2% match on an eligible
              margin account transfer — or 1% on just about anything else.
              Offer ends September 5, so don’t forget to register soon.
            </p>
            <a href="#" className="mt-3 inline-block underline">
              T&amp;Cs apply.
            </a>
          </div>
        </div>
      </div>

      {/* RIGHT: login card */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-[0_1px_0_rgba(0,0,0,0.06),0_20px_40px_rgba(0,0,0,0.06)]">
          <h2 className="text-center text-2xl font-semibold">Welcome back</h2>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="sr-only">Email</span>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 rounded-xl border border-black/15 px-4 outline-none focus:ring-2 focus:ring-black/80"
              />
            </label>

            <label className="block relative">
              <span className="sr-only">Password</span>
              <input
                type={showPw ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 rounded-xl border border-black/15 px-4 pr-12 outline-none focus:ring-2 focus:ring-black/80"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute inset-y-0 right-3 my-auto h-8 w-8 rounded-full grid place-items-center text-black/60"
                aria-label={showPw ? "Hide password" : "Show password"}
                title={showPw ? "Hide" : "Show"}
              >
                {showPw ? "🙈" : "👁️"}
              </button>
            </label>

            <div className="text-sm">
              <Link to="/reset" className="underline">
                Forgot password?
              </Link>
            </div>

            {err && <div className="text-red-600 text-sm">{err}</div>}

            <button
              disabled={busy}
              className="w-full h-11 rounded-full bg-black text-white disabled:opacity-60"
            >
              {busy ? "…" : "Log in"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm">
            Don’t have an account?{" "}
            <Link to="/register" className="underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="hidden lg:flex col-span-2 items-center justify-between px-10 py-6 text-sm text-black/70">
        <a href="#" className="underline">
          Help Centre
        </a>
        <div className="space-x-4">
          <span>Download our mobile apps</span>
          <a href="#" className="underline">
            iPhone
          </a>
          <a href="#" className="underline">
            Android
          </a>
        </div>
      </div>
    </div>
  );
}
