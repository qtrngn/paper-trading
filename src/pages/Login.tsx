import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom"

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import AuthShell from '@/components/auth/AuthShell';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const onSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setAuthenticating(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed"
      setError(message)
    } finally {
      setAuthenticating(false)
    }

  }

  const signInWithGoogle = async () => {
    setError(null)
    setAuthenticating(true)

    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      navigate("/")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google sign-in failed"
      setError(message)
    } finally {
      setAuthenticating(false)
    }
  }
  
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your account">
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <form onSubmit={onSubmit}>
        <FieldSet className="w-full text-white font-bold">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Field>

            <p className="text-sm text-white">
              Don&apos;t have an account yet?{" "}
              <Link to="/register" className="text-white underline underline-offset-4 hover:opacity-90">
                Create one
              </Link>
            </p>

            <Button variant="default" type="submit" disabled={authenticating} className="w-full">
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


      <Button type="button" onClick={signInWithGoogle} disabled={authenticating} className="w-full">
        Continue with Google
      </Button>
    </AuthShell>
  )
}

