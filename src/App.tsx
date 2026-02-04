import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from '@/pages/Login';
import HomePage from '@/pages/Home';
import AuthRoute from '@/router/AuthRoute';
import '@/lib/firebase';


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthRoute><HomePage /></AuthRoute>} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;

