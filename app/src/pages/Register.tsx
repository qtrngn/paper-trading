import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthShell from "@/components/features/auth/AuthShell";

export default function RegisterPage() {
  // STATES
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password != confirmPassword) {
      setError("Passwords are not matching.");
      return;
    }

    setRegistering(true);

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = credential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: user.email,
        createdAt: serverTimestamp(),
      });
      navigate("/login");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setError(message);
    } finally {
      setRegistering(false);
    }
  };
  // FORM LAYOUT
  return (
    <AuthShell title="Register" subtitle="Create an account with us">
      <form onSubmit={onSubmit}>
        <FieldSet className="w-full text-white font-bold">
          <FieldGroup>
            {/* First name */}
            <Field>
              <FieldLabel htmlFor="firstName">First Name</FieldLabel>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </Field>

            {/* Last name */}
            <Field>
              <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </Field>

            {/* Email */}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>

            {/* Password */}
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </Field>

            {/* Confirm password */}
            <Field>
              <FieldLabel htmlFor="confirmPassword">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </Field>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" disabled={registering} className="w-full">
              {registering ? "Creating..." : "Create account"}
            </Button>
          </FieldGroup>
        </FieldSet>
      </form>
    </AuthShell>
  );
}
