import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthProvider from '@/providers/AuthProvider';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import HomePage from '@/pages/Home';
import AuthRoute from '@/router/AuthRoute';
import '@/lib/firebase';


const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthRoute><HomePage /></AuthRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;



