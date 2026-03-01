import { NavLink } from 'react-router-dom';
import { Home, Calculator, Wallet, Bell, Leaf, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Simulasi Pembiayaan', path: '/simulasi', icon: Calculator },
  { name: 'Tabungan Umroh', path: '/umroh', icon: Wallet },
  { name: 'Reminder Tagihan', path: '/reminder', icon: Bell },
  { name: 'Portal Admin', path: '/portal-admin', icon: Users },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-slate-200 h-full flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <Leaf className="w-8 h-8 text-primary mr-2" />
        <span className="text-xl font-bold text-slate-800 tracking-tight">Syariah<span className="text-primary">fin</span></span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-emerald-50 text-primary shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
          <h4 className="text-sm font-semibold text-primary mb-1">Pusat Bantuan</h4>
          <p className="text-xs text-slate-600 mb-3">Hubungi layanan pelanggan kami 24/7</p>
          <button className="w-full bg-primary text-white text-xs font-medium py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
            Hubungi CS
          </button>
        </div>
      </div>
    </div>
  );
}
