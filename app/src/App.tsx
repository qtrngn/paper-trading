import { BrowserRouter, Route, Routes } from "react-router-dom";
import "@/lib/firebase";
import AuthProvider from "@/providers/AuthProvider";
import AuthRoute from "@/router/AuthRoute";
import AppLayout from "@/components/layout/AppLayout";

import LoginPage from "@/pages/Login";
import RegisterPage from "@/pages/Register";
import HomePage from "@/pages/Home";
import StockDetailPage from "@/pages/StockDetail";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            element={
              <AuthRoute>
                <AppLayout />
              </AuthRoute>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/stocks/:symbol" element={<StockDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App; 
