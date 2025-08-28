import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSession } from "./stores/session";
import RequireAuth from "./routes/RequireAuth";


// PAGES
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Gate from "./pages/Gate";
import Kyc from "./pages/Kyc";           
import Review from "./pages/Review"; 

export default function App() {
  const init = useSession(s => s.init);
  useEffect(() => { init(); }, [init]); 

  return (
   <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected (must be signed in) */}
        <Route path="/gate" element={<RequireAuth><Gate /></RequireAuth>} />
        <Route path="/onboarding/kyc" element={<RequireAuth><Kyc /></RequireAuth>} />
        <Route path="/onboarding/review" element={<RequireAuth><Review /></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />

        {/* Default: send everyone to Gate.
            - If not signed in, RequireAuth inside /gate will bounce to /login
            - If signed in, Gate will route to KYC/Review/Dashboard */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
