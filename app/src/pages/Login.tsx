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
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // HANDLERS
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

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


  const onSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleAuthentication(async () => {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
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
      {error && <p className="error-text-strong mb-3">{error}</p>}

      <form onSubmit={onSubmit}>
        <FieldSet className="auth-form-fieldset">
          <FieldGroup>
            {/* Email */}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
                </button>
              </div>
            </Field>

            {/* Register link */}
            <p className="auth-account-prompt">
              Don&apos;t have an account yet?{" "}
              <Link
                to="/register"
                className="auth-link"
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

      <div className="auth-divider-row">
        <div className="auth-divider" />
        <span className="auth-divider-label">OR</span>
        <div className="auth-divider" />
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

