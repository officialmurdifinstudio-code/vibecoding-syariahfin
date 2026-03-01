import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Mail, Lock, Eye, EyeOff, User, MapPin, CalendarDays, Phone, Loader2, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/firebaseServices';

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    namaLengkap: '',
    tempatTanggalLahir: '',
    alamat: '',
    noWhatsapp: '',
    email: '',
    password: '',
    konfirmasiPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.konfirmasiPassword) {
      alert('Password tidak cocok!');
      return;
    }
    
    setIsSubmitting(true);
    
    // Pendaftaran ke Firebase + Firestore
    const res = await authService.registerUser(formData);
    setIsSubmitting(false);

    if (res.success) {
      setShowSuccessMessage(true);
      
      // Tahan sebentar untuk menampilkan pesan sukses, lalu arahkan ke Login
      setTimeout(() => {
        // Kita passing state melalui navigate untuk ditangkap di halaman login
        navigate('/login', { state: { registered: true } });
      }, 4000);
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col py-10 justify-center relative overflow-hidden">
      {/* Background Ornamen */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[30rem] h-[30rem] rounded-full bg-secondary/10 blur-3xl"></div>
      
      <div className="w-full max-w-lg mx-auto px-6 relative z-10">
        <div className="text-center mb-8">
          <div className="bg-white mx-auto w-14 h-14 rounded-2xl shadow-sm flex items-center justify-center border border-slate-100 mb-5">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Daftar Akun Syariah<span className="text-primary">fin</span></h1>
          <p className="text-slate-500 text-sm">Buat akun untuk memulai peran Anda di sistem.</p>
        </div>

        <div className="bg-white py-8 px-6 md:px-8 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100">
          <form onSubmit={handleRegister} className="space-y-5">
            
            {/* Nama Lengkap */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nama Lengkap</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="namaLengkap"
                  required
                  value={formData.namaLengkap}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-primary focus:border-primary text-sm sm:text-base text-slate-900 transition-colors bg-slate-50/50 focus:bg-white"
                  placeholder="Nama Lengkap Sesuai KTP"
                />
              </div>
            </div>

            {/* Tempat Tanggal Lahir */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tempat, Tanggal Lahir</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarDays className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="tempatTanggalLahir"
                  required
                  value={formData.tempatTanggalLahir}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-primary focus:border-primary text-sm sm:text-base text-slate-900 transition-colors bg-slate-50/50 focus:bg-white"
                  placeholder="Misal: Jakarta, 17 Agustus 1990"
                />
              </div>
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Alamat Lengkap (Sesuai KTP)</label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                  <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                <textarea
                  name="alamat"
                  required
                  rows="2"
                  value={formData.alamat}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-primary focus:border-primary text-sm sm:text-base text-slate-900 transition-colors bg-slate-50/50 focus:bg-white resize-none"
                  placeholder="Masukkan alamat lengkap..."
                />
              </div>
            </div>

            {/* No WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">No. WhatsApp</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  name="noWhatsapp"
                  required
                  value={formData.noWhatsapp}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-primary focus:border-primary text-sm sm:text-base text-slate-900 transition-colors bg-slate-50/50 focus:bg-white"
                  placeholder="081234567890"
                />
              </div>
            </div>

            {/* Email */}
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
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
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
                </div>
              </div>

               {/* Konfirmasi Password */}
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ulangi Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="konfirmasiPassword"
                    required
                    value={formData.konfirmasiPassword}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-primary focus:border-primary text-sm sm:text-base text-slate-900 transition-colors bg-slate-50/50 focus:bg-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                {showPassword ? <EyeOff className="h-4 w-4 mr-1.5" /> : <Eye className="h-4 w-4 mr-1.5" />}
                {showPassword ? 'Sembunyikan' : 'Tampilkan'} Password
              </button>
            </div>

            {showSuccessMessage && (
               <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl flex items-start text-sm border border-emerald-100 mt-2 mb-4 animate-in fade-in slide-in-from-bottom-2">
                 <CheckCircle2 className="w-5 h-5 mr-2 shrink-0 text-emerald-600 mt-0.5" />
                 <div>
                   <p className="font-semibold mb-1">Pendaftaran Berhasil!</p>
                   <p>Sistem mendaftarkan Anda sebagai <b>Nasabah</b>. Mohon tunggu aktivasi akun dari Admin sebelum Anda dapat masuk.</p>
                 </div>
               </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || showSuccessMessage}
              className="w-full flex justify-center items-center py-3 mt-8 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-500/30 text-sm font-bold text-white bg-primary hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2"/> Memproses Data...</>
              ) : (
                "Daftar Sekarang"
              )}
            </button>
            
          </form>

          <div className="mt-8 text-center text-sm">
            <p className="text-slate-500">
              Sudah memiliki akun?{' '}
              <Link to="/login" className="font-semibold text-primary hover:text-emerald-700 transition-colors">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
