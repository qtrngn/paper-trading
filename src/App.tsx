import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import HomePage from '@/pages/Home';
import AuthRoute from '@/router/AuthRoute';
import '@/lib/firebase';


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthRoute><HomePage /></AuthRoute>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;

