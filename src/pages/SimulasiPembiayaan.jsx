import { useState, useEffect } from 'react';
import { Calculator, Package, Wallet, Info, CheckCircle2, Loader2, Sparkles, Settings } from 'lucide-react';
import { simulasiService, systemService, authService } from '../services/firebaseServices';

const TENOR_OPTIONS = [3, 6, 9, 12, 18, 24, 36];

export default function SimulasiPembiayaan() {
  const [formData, setFormData] = useState({
    namaBarang: '',
    hargaBarang: '',
    uangMuka: '',
    margin: 10,
    tenor: 12,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isLoadingMargin, setIsLoadingMargin] = useState(true);
  const [isMarginKhusus, setIsMarginKhusus] = useState(false);

  useEffect(() => {
    const fetchMargin = async () => {
      // Prioritaskan margin pribadi pengguna jika diatur di Firestore
      const localSession = localStorage.getItem('syariahfin_user');
      let usedMargin = 10;
      let isKhusus = false;

      if (localSession) {
        const user = JSON.parse(localSession);
        const userProf = await authService.getUserProfile(user.uid);
        if (userProf.success && userProf.data.margin) {
          usedMargin = userProf.data.margin;
          isKhusus = true;
        }
      }

      // Fallback ke System Setting jika user tidak punya margin khusus
      if (!isKhusus) {
        const sysRes = await systemService.getMarginSetting();
        if (sysRes.success) usedMargin = sysRes.margin;
      }

      setFormData(prev => ({ ...prev, margin: usedMargin }));
      setIsMarginKhusus(isKhusus);
      setIsLoadingMargin(false);
    };
    fetchMargin();
  }, []);

  // Format angka ke format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  // Kalkulasi langsung dari state form (Derived State)
  const harga = parseInt(formData.hargaBarang.replace(/[^0-9]/g, '')) || 0;
  const dp = parseInt(formData.uangMuka.replace(/[^0-9]/g, '')) || 0;
  
  let pokokPembiayaan = 0;
  let totalMargin = 0;
  let totalPembiayaan = 0;
  let cicilanPerBulan = 0;

  if (harga > 0 && harga > dp) {
    pokokPembiayaan = harga - dp;
    const marginRate = formData.margin / 100;
    totalMargin = pokokPembiayaan * marginRate * (formData.tenor / 12); 
    totalPembiayaan = pokokPembiayaan + totalMargin;
    cicilanPerBulan = totalPembiayaan / formData.tenor;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format khusus nilai uang
    if (name === 'hargaBarang' || name === 'uangMuka') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData({
        ...formData,
        [name]: numericValue ? parseInt(numericValue).toLocaleString('id-ID') : '',
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSimpan = async () => {
    if(!formData.namaBarang || !formData.hargaBarang) {
      alert("Harap lengkapi nama dan harga barang!");
      return;
    }

    setIsSubmitting(true);
    
    const dataToSave = {
      namaBarang: formData.namaBarang,
      hargaBarang: harga,
      uangMuka: dp,
      tenor: formData.tenor,
      marginRate: formData.margin,
      pokokPembiayaan,
      totalMargin,
      totalPembiayaan,
      cicilanPerBulan,
      // userId: "USER_ID", // TODO: Integrate real auth logic here
    };

    const res = await simulasiService.simpanSimulasi(dataToSave);
    setIsSubmitting(false);

    if(res.success) {
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
      
      // Reset form
      setFormData({
        namaBarang: '',
        hargaBarang: '',
        uangMuka: '',
        margin: 10,
        tenor: 12,
      });
    } else {
      alert("Gagal menyimpan data: " + res.error);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Simulasi Pembiayaan (Murabahah)</h1>
          <p className="text-slate-500 text-sm mt-1">Kalkulator estimasi margin dan cicilan per bulan secara transparan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Input Container */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-5 pb-3 border-b border-slate-100 flex items-center">
            <Calculator className="w-5 h-5 text-primary mr-2" />
            Detail Permohonan
          </h2>

          <div className="space-y-5">
            {/* Nama/Jenis Barang */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nama Barang / Keperluan</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Package className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="namaBarang"
                  value={formData.namaBarang}
                  onChange={handleInputChange}
                  placeholder="Contoh: Paket Umroh, Modal Usaha, Renovasi Rumah..."
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-primary focus:border-primary text-sm sm:text-base text-slate-900 transition-shadow"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Harga Barang */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Harga Barang (Rp)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 sm:text-sm">Rp</span>
                  </div>
                  <input
                    type="text"
                    name="hargaBarang"
                    value={formData.hargaBarang}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-primary focus:border-primary text-sm sm:text-base text-slate-900 transition-shadow"
                  />
                </div>
              </div>

              {/* Uang Muka (DP) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Uang Muka / DP (Rp)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 sm:text-sm">Rp</span>
                  </div>
                  <input
                    type="text"
                    name="uangMuka"
                    value={formData.uangMuka}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-primary focus:border-primary text-sm sm:text-base text-slate-900 transition-shadow"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Tenor */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tenor (Bulan)</label>
                <select
                  name="tenor"
                  value={formData.tenor}
                  onChange={handleInputChange}
                  className="block w-full pl-3 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-primary focus:border-primary text-sm sm:text-base text-slate-900 bg-white"
                >
                  {TENOR_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t} Bulan</option>
                  ))}
                </select>
              </div>

              {/* Margin */}
              <div>
                <label className="flex text-sm font-medium text-slate-700 mb-2 justify-between">
                  <span>Margin (% per tahun)</span>
                </label>
                <div className="bg-emerald-50 text-emerald-800 px-4 h-11 rounded-xl border border-emerald-100 flex items-center justify-between shadow-sm">
                   {isLoadingMargin ? (
                     <Loader2 className="w-5 h-5 animate-spin text-emerald-600 mx-auto" />
                   ) : (
                     <div className="flex items-center justify-between w-full">
                       <div className="text-base font-bold">{formData.margin}% <span className="text-xs font-normal opacity-70">p.a</span></div>
                       <div className={`text-[10px] sm:text-xs font-medium flex items-center bg-white px-2 py-0.5 rounded-full border shadow-sm ${isMarginKhusus ? 'text-amber-600 border-amber-200' : 'text-emerald-600 border-emerald-100'}`}>
                         {isMarginKhusus ? (
                           <><Sparkles className="w-3 h-3 mr-1 text-amber-500" /> Ditetapkan Khusus (Personal)</>
                         ) : (
                           <><Settings className="w-3 h-3 mr-1 text-emerald-500" /> Ditetapkan Pusat (Default)</>
                         )}
                       </div>
                     </div>
                   )}
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex items-start text-sm border border-blue-100">
              <Info className="w-5 h-5 mr-2 shrink-0 text-blue-500 mt-0.5" />
              <p>Simulasi menggunakan skema <span className="font-semibold">Murabahah</span> (Jual Beli). Margin keuntungan (Flat) disepakati di awal dan tidak akan berubah hingga tenor selesai (Non-Floating).</p>
            </div>

          </div>
        </div>

        {/* Kalkulasi Ringkasan Container */}
        <div className="lg:col-span-5 relative">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-xl overflow-hidden sticky top-6 text-white border border-slate-700">
            {/* Dekorasi Abstract */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 rounded-full bg-blue-500/10 blur-3xl"></div>
            
            <div className="relative p-6 px-7">
              <h3 className="text-lg font-medium text-slate-300 mb-6 flex items-center">
                <Wallet className="w-5 h-5 mr-2 text-secondary" />
                Ringkasan Pembiayaan
              </h3>

              <div className="space-y-5">
                <div className="flex justify-between items-end border-b border-slate-700/50 pb-3">
                  <span className="text-slate-400 text-sm">Pokok Pembiayaan</span>
                  <span className="font-medium">{formatRupiah(pokokPembiayaan)}</span>
                </div>
                
                <div className="flex justify-between items-end border-b border-slate-700/50 pb-3">
                  <div>
                    <span className="block text-slate-400 text-sm">Total Margin</span>
                    <span className="text-xs text-slate-500">{(formData.margin)}% p.a</span>
                  </div>
                  <span className="font-medium text-secondary">{formatRupiah(totalMargin)}</span>
                </div>

                <div className="flex justify-between items-end border-b border-slate-700/50 pb-3 pt-2">
                  <span className="text-slate-300 font-medium">Total Harga Jual (Pokok + Margin)</span>
                  <span className="font-semibold text-lg">{formatRupiah(totalPembiayaan)}</span>
                </div>

                <div className="pt-4 mt-6 bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                  <span className="block text-sm text-slate-400 mb-1 text-center font-medium uppercase tracking-wider">Estimasi Cicilan per Bulan</span>
                  <div className="text-center mt-2">
                    <span className="text-4xl font-bold tracking-tight text-white">{formatRupiah(cicilanPerBulan)}</span>
                    <span className="text-slate-400 text-sm ml-1 line-through hidden">/bln</span>
                  </div>
                  <div className="mt-4 flex justify-between text-xs text-slate-400">
                    <span>Selama {formData.tenor} bulan</span>
                    <span>Angsuran Tetap</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={handleSimpan}
                  disabled={isSubmitting || submitSuccess}
                  className="flex-1 bg-primary hover:bg-emerald-500 text-white py-3 px-4 rounded-xl font-medium transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Menyimpan...</>
                  ) : submitSuccess ? (
                    <><CheckCircle2 className="w-5 h-5 mr-2" /> Tersimpan!</>
                  ) : (
                    "Simpan Simulasi"
                  )}
                </button>
                <button className="px-4 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-xl font-medium transition-all active:scale-[0.98]">
                  Cetak PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
