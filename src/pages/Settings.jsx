import { useState } from 'react';
import { Save, User, Mail, Lock, Phone, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/firebaseServices';
import { auth } from '../services/firebaseConfig';
import { updatePassword } from 'firebase/auth';

export default function Settings() {
  const [formData, setFormData] = useState(() => {
    const localUser = localStorage.getItem('syariahfin_user');
    let user = null;
    if (localUser) {
      user = JSON.parse(localUser);
    }
    
    return {
      username: user ? (user.namaLengkap || 'Tanpa Nama') : '',
      email: user ? (user.email || '') : '',
      password: '',
      phone: user ? (user.noWhatsapp || '') : '',
      address: user ? (user.alamat || '') : ''
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      // 1. Ambil session user saat ini untuk identifikasi UserId (uid)
      const localUser = localStorage.getItem('syariahfin_user');
      if (!localUser) throw new Error("Sesi pengguna tidak ditemukan.");
      const sessionUser = JSON.parse(localUser);

      // 2. Jika password diisi, update password auth Firebase
      if (formData.password) {
        if (formData.password.length < 6) {
          throw new Error("Password baru harus lebih dari 6 karakter.");
        }
        if (auth.currentUser) {
          await updatePassword(auth.currentUser, formData.password);
        } else {
          throw new Error("Anda harus login ulang untuk mengubah password keamanan.");
        }
      }

      // 3. Update tabel pengguna di Firestore
      const res = await authService.updateUserProfile(sessionUser.uid, {
        namaLengkap: formData.username,
        noWhatsapp: formData.phone,
        alamat: formData.address
      });

      if (!res.success) throw new Error(res.error);

      // 4. Update data session lokal agar nama dan info di header terupdate
      sessionUser.namaLengkap = formData.username;
      sessionUser.noWhatsapp = formData.phone;
      sessionUser.alamat = formData.address;
      localStorage.setItem('syariahfin_user', JSON.stringify(sessionUser));

      setFormData(prev => ({ ...prev, password: '' })); // Kosongkan password setelah sukses
      setSuccessMessage("Pengaturan akun berhasil disimpan!");
      
      // Sembunyikan pesan sukses setelah 3 detik
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error) {
      alert("Gagal menyimpan profil: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 mb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pengaturan Akun</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola informasi profil dan keamanan akun Anda.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Informasi Dasar</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-primary focus:border-primary transition-colors bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-primary focus:border-primary transition-colors bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password Baru</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Kosongkan jika tidak ingin mengubah"
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-primary focus:border-primary transition-colors bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Kontak & Alamat</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nomor HP / WhatsApp</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-primary focus:border-primary transition-colors bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Lengkap</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <MapPin className="h-5 w-5 text-slate-400" />
                    </div>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={4}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-primary focus:border-primary transition-colors bg-slate-50 focus:bg-white resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center">
            <div className="w-full sm:w-auto mb-4 sm:mb-0">
               {successMessage && (
                 <div className="flex items-center text-sm text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg animate-in fade-in">
                   <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
                   {successMessage}
                 </div>
               )}
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-primary hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium py-2.5 px-6 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center min-w-[180px]"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Simpan Perubahan</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
