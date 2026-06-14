import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/useAuthStore'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import Esperando from './pages/Esperando'
import Liga from './pages/Liga'
import Plantilla from './pages/Plantilla'

function PrivateRoute({ children }) {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
        <Route path="/esperando" element={<PrivateRoute><Esperando /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/liga" element={<PrivateRoute><Liga /></PrivateRoute>} />
        <Route path="/plantilla" element={<PrivateRoute><Plantilla /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}