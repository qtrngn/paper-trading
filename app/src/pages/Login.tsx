import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthShell from "@/components/features/auth/AuthShell";
import { Eye, EyeClosed } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  // STATES
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // HELPERS
  const handleAuthentication = async (authFunction: () => Promise<void>) => {
    setError(null);
    setAuthenticating(true);
    try {
      await authFunction();
      navigate("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setAuthenticating(false);
    }
  };

    // HANDLERS
  const onSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleAuthentication(async () => {
      await signInWithEmailAndPassword(auth, email, password);
    });
  };

  const signInWithGoogle = async () => {
    await handleAuthentication(async () => {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    });
  };


  // UI RENDERING
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your account">
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <form onSubmit={onSubmit}>
        <FieldSet className="w-full text-white font-bold">
          <FieldGroup>
            {/* Email */}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>

            {/* Password */}
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white cursor-pointer p-0"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
                </button>
              </div>
            </Field>

            {/* Register link */}
            <p className="text-sm text-white">
              Don&apos;t have an account yet?{" "}
              <Link
                to="/register"
                className="text-white underline underline-offset-4 hover:opacity-90"
              >
                Create one
              </Link>
            </p>

            {/* Sign in button */}
            <Button
              type="submit"
              disabled={authenticating}
              className="w-full"
            >
              {authenticating ? "Signing in..." : "Sign in"}
            </Button>
          </FieldGroup>
        </FieldSet>
      </form>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-white/50">OR</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <Button
        type="button"
        onClick={signInWithGoogle}
        disabled={authenticating}
        className="w-full"
      >
        Continue with Google
      </Button>
    </AuthShell>
  );
}


