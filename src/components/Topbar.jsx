import { useState, useRef, useEffect } from 'react';
import { Bell, UserCircle, Search, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebaseConfig';
import { signOut } from 'firebase/auth';

export default function Topbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Ambil state awal dari lokal storage jika ada
  const [user] = useState(() => {
    const localUser = localStorage.getItem('syariahfin_user');
    return localUser ? JSON.parse(localUser) : null;
  });

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error", error);
    }
    localStorage.removeItem('syariahfin_user');
    navigate('/login');
  };

  const handleSettings = () => {
    setIsDropdownOpen(false);
    navigate('/settings');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-96 transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
        <Search className="w-4 h-4 text-slate-400 mr-2" />
        <input 
          type="text" 
          placeholder="Cari fitur, nasabah, atau transaksi..." 
          className="bg-transparent border-none focus:outline-none text-sm w-full text-slate-700 placeholder-slate-400"
        />
      </div>
      <div className="flex items-center space-x-5">
        <button className="relative p-2 text-slate-400 hover:text-primary hover:bg-emerald-50 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 border-l border-slate-200 pl-5 focus:outline-none"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-slate-800 leading-none mb-1">
                {user?.namaLengkap || 'Tanpa Nama'}
              </p>
              <p className="text-xs text-slate-500 leading-none capitalize">
                {user?.role || 'Guest'}
              </p>
            </div>
            <UserCircle className="w-9 h-9 text-slate-300 hover:text-primary transition-colors cursor-pointer" strokeWidth={1} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
              <button 
                onClick={handleSettings}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary flex items-center transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Pengaturan Akun
              </button>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
