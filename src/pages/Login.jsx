import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Di tahap 5 ini akan diganti dengan Firebase Auth
    // Mock login sedehana: Pindah ke dashboard setelah disubmit
    if (formData.email && formData.password) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center relative overflow-hidden">
      {/* Background Ornamen */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[30rem] h-[30rem] rounded-full bg-secondary/10 blur-3xl"></div>
      
      <div className="w-full max-w-md mx-auto px-6 relative z-10">
        <div className="text-center mb-8">
          <div className="bg-white mx-auto w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center border border-slate-100 mb-6">
            <Leaf className="w-9 h-9 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">Masuk ke Syariah<span className="text-primary">fin</span>.</h1>
          <p className="text-slate-500 text-sm">Masuk untuk mengelola keuangan dan nasabah Anda.</p>
        </div>

        <div className="bg-white py-8 px-6 md:px-8 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-primary focus:border-primary text-sm sm:text-base text-slate-900 transition-colors bg-slate-50/50 focus:bg-white"
                  placeholder="admin@syariahfin.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <a href="#" className="text-xs font-semibold text-primary hover:text-emerald-700 transition-colors">Lupa Password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-primary focus:border-primary text-sm sm:text-base text-slate-900 transition-colors bg-slate-50/50 focus:bg-white"
                  placeholder="••••••••"
                />
                 <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 mt-8 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-500/30 text-sm font-semibold text-white bg-primary hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98]"
            >
              Masuk
            </button>
            
          </form>

          <div className="mt-8 text-center text-sm">
            <p className="text-slate-500">
              Belum punya akun?{' '}
              <Link to="/register" className="font-semibold text-primary hover:text-emerald-700 transition-colors">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} Syariahfin. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
