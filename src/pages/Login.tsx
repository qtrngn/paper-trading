import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [authenticating, setAuthenticating] = useState(false);

  const SignInWithGoogle = async () => {
    setAuthenticating(true);

    signInWithPopup(auth, new GoogleAuthProvider())
      .then(response => {
        console.log(response.user.uid)
        navigate('/')
      })
      .catch((error) => {
        console.log(error);
        setAuthenticating(false);

      })
  }
  return (
    <div>
      <p>Login page</p>
      <button onClick={SignInWithGoogle} disabled={authenticating}>
        Sign in with Google
      </button>
    </div>
  )
}