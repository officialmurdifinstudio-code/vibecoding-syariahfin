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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="simulasi" element={<SimulasiPembiayaan />} />
          <Route path="umroh" element={<TabunganUmroh />} />
          <Route path="reminder" element={<ReminderTagihan />} />
          <Route path="settings" element={<Settings />} />
          <Route path="portal-admin" element={<PortalAdmin />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
