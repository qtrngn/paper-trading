import { Navigate } from "react-router-dom";
import { useSession } from "../stores/session";

export default function RequireAuth ({children}: {children: JSX.Element}) {
    const { user, loading } = useSession();
    if (loading) return <div className="p-6">Loading...</div>;
    if (!user) return <Navigate to="/login" replace/>;
return children;
}