import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import SimulasiPembiayaan from './pages/SimulasiPembiayaan';
import TabunganUmroh from './pages/TabunganUmroh';
import ReminderTagihan from './pages/ReminderTagihan';
import Settings from './pages/Settings';
import PortalAdmin from './pages/PortalAdmin';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={
            <ProtectedRoute requiredMenuId="dashboard"><Dashboard /></ProtectedRoute>
          } />
          <Route path="simulasi" element={
            <ProtectedRoute requiredMenuId="simulasi"><SimulasiPembiayaan /></ProtectedRoute>
          } />
          <Route path="umroh" element={
            <ProtectedRoute requiredMenuId="umroh"><TabunganUmroh /></ProtectedRoute>
          } />
          <Route path="reminder" element={
            <ProtectedRoute requiredMenuId="reminder"><ReminderTagihan /></ProtectedRoute>
          } />
          <Route path="settings" element={
            <ProtectedRoute><Settings /></ProtectedRoute>
          } />
          <Route path="portal-admin" element={
            <ProtectedRoute requiredMenuId="portal_admin"><PortalAdmin /></ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
