import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Cards from './pages/Cards';
import Badges from './pages/Badges';
import Payments from './pages/Payments';
import Profile from './pages/Profile';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/cards" element={<Cards />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/badges" element={<Badges />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/profile" element={<Profile />} />

            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;