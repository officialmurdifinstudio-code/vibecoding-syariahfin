import { useState } from 'react';
import { Target, Wallet2, Calendar, TrendingUp, AlertCircle, ArrowRight, PlaneTakeoff } from 'lucide-react';

export default function TabunganUmroh() {
  const [formData, setFormData] = useState({
    targetDana: '',
    saldoSaatIni: '',
    targetBulan: 12,
  });

  // Format angka ke format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Auto format numbering untuk currency text inputs
    if (name === 'targetDana' || name === 'saldoSaatIni') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData({
        ...formData,
        [name]: numericValue ? parseInt(numericValue).toLocaleString('id-ID') : '',
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Kalkulasi (Derived state)
  const target = parseInt(formData.targetDana.replace(/[^0-9]/g, '')) || 0;
  const saldo = parseInt(formData.saldoSaatIni.replace(/[^0-9]/g, '')) || 0;
  const bulan = parseInt(formData.targetBulan) || 12;

  let kekeurangan = 0;
  let tabunganPerBulan = 0;
  let persentase = 0;

  if (target > 0) {
    kekeurangan = Math.max(0, target - saldo);
    persentase = Math.min(100, Math.round((saldo / target) * 100));
    if (bulan > 0) {
      tabunganPerBulan = kekeurangan / bulan;
    }
  }

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <PlaneTakeoff className="w-6 h-6 mr-3 text-primary" />
            Tracker Tabungan Umroh
          </h1>
          <p className="text-slate-500 text-sm mt-1">Pantau progress dan hitung estimasi setoran tabungan umroh Anda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Input Tabungan */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-5 pb-3 border-b border-slate-100 flex items-center">
            <Target className="w-5 h-5 text-primary mr-2" />
            Rencana Keberangkatan
          </h2>

          <div className="space-y-5">
            {/* Target Dana */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Target Dana Umroh (Rp)</label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="targetDana"
                  value={formData.targetDana}
                  onChange={handleInputChange}
                  placeholder="Contoh: 35.000.000"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-primary focus:border-primary text-sm sm:text-base text-slate-900 transition-shadow bg-slate-50"
                />
              </div>
            </div>

            {/* Saldo Saat Ini */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Saldo Tabungan Saat Ini (Rp)</label>
              <div className="relative">
                <Wallet2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="saldoSaatIni"
                  value={formData.saldoSaatIni}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-primary focus:border-primary text-sm sm:text-base text-slate-900 transition-shadow bg-slate-50"
                />
              </div>
            </div>

            {/* Target Waktu */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Target Keberangkatan (Bulan ke depan)</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  name="targetBulan"
                  value={formData.targetBulan}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-primary focus:border-primary text-sm sm:text-base text-slate-900 bg-white"
                >
                  {[3, 4, 5, 6, 8, 10, 12, 18, 24, 30, 36].map((m) => (
                    <option key={m} value={m}>{m} Bulan</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 flex items-start mt-6 border border-amber-100">
              <AlertCircle className="w-5 h-5 text-amber-500 mr-2 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800">
                Nilai tukar mata uang, inflasi, atau kebijakan maskapai dapat menyebabkan penyesuaian biaya umroh secara berkala. Pastikan menyisihkan dana sedikit lebih tinggi dari target awal.
              </p>
            </div>
          </div>
        </div>

        {/* Visualisasi Tabungan */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Progress Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10"></div>
            
            <h3 className="text-base font-semibold text-slate-800 mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              Status Pencapaian
            </h3>

            <div className="mb-4 flex justify-between items-end">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Terkumpul</p>
                <p className="text-2xl font-bold text-slate-800">{formatRupiah(saldo)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-500 mb-1">Target</p>
                <p className="text-base font-semibold text-slate-600">{formatRupiah(target)}</p>
              </div>
            </div>

            {/* Progress Bar Container */}
            <div className="relative pt-1 w-full mb-8">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-100">
                    Progres
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold inline-block text-primary">
                    {persentase}%
                  </span>
                </div>
              </div>
              
              <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-slate-100 shadow-inner">
                <div 
                  style={{ width: `${persentase}%` }} 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000 ease-out"
                ></div>
              </div>
              <p className="text-xs text-slate-500 text-center">
                Sisa kekurangan dana: <span className="font-semibold text-slate-700">{formatRupiah(kekeurangan)}</span>
              </p>
            </div>
          </div>

          {/* Action Card / Estimasi Setoran */}
          <div className="bg-gradient-to-br from-primary to-emerald-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
             {/* Dekorasi */}
             <div className="absolute inset-x-0 bottom-0">
               <svg viewBox="0 0 224 12" fill="currentColor" className="w-full -mb-1 text-white opacity-10 hidden sm:block" preserveAspectRatio="none">
                 <path d="M0,0 C48,12 144,12 224,0 L224,12 L0,12 L0,0 Z"></path>
               </svg>
             </div>

            <p className="text-sm font-medium text-emerald-100 mb-1 uppercase tracking-wide">Penyisihan Tabungan Rutin</p>
            <h4 className="text-3xl font-bold tracking-tight mb-2 flex items-end">
              {formatRupiah(tabunganPerBulan)}
              <span className="text-sm font-normal text-emerald-100 ml-1 mb-1">/ bulan</span>
            </h4>
            
            <p className="text-sm text-emerald-50 mb-6 leading-relaxed">
              Jika Anda menyisihkan sebesar nilai di atas setiap bulannya, target {formatRupiah(target)} Anda akan tercapai tepat pada waktu {bulan} bulan lagi.
            </p>

            <button className="w-full bg-white text-emerald-700 font-semibold py-3 px-4 rounded-xl flex items-center justify-center transition-transform hover:scale-[1.02] active:scale-95 shadow-sm">
              Buat Jadwal Autodebet <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
