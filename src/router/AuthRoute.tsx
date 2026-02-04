import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export interface AuthRouteProps {
    children: ReactNode;
}

export default function AuthRoute({ children }: AuthRouteProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate('/login', { replace: true })
            }
            setLoading(false);
        });
        return unsubscribe;
    }, [navigate])

    if (loading) return <p>Loading...</p>;

    return <>{children}</>;
    
}