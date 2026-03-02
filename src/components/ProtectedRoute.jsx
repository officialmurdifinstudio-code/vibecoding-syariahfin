import { Navigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, requiredMenuId }) {
  const localUser = localStorage.getItem('syariahfin_user');
  
  // Jika belum login, redirect ke login
  if (!localUser) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(localUser);

  // Admin bypasses semua pengecekan menu
  if (user.role === 'admin') {
    return children;
  }

  // Jika halaman (misalnya Settings) tidak butuh menuId khusus, izinkan
  if (!requiredMenuId) {
    return children;
  }

  // Cek apakah user list punya hak akses menu dengan id yang dituju
  const allowedMenus = user.menus || [];
  if (!allowedMenus.includes(requiredMenuId)) {
    // Tampilan Akses Ditolak (403 Forbidden)
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[70vh]">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Akses Ditolak</h2>
        <p className="text-slate-500 max-w-md">
          Anda tidak memiliki izin (Access Role) untuk mengunjungi halaman ini secara langsung. 
          Silakan hubungi Administrator sistem untuk meminta hak akses.
        </p>
      </div>
    );
  }

  return children;
}
