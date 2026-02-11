import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth'; 
  
export default function HomePage() {
  return (
    <div>
      <h2> 
      Home page
      </h2>
      <button onClick={() => signOut(auth)}>Sign out</button>
    </div>
  )

}