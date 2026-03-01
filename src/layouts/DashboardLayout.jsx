import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function DashboardLayout() {
  // Cek sesi login di local storage. Jika tidak ada, tendang kembali ke login
  const isAuthenticated = localStorage.getItem('syariahfin_user') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="w-full max-w-6xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
