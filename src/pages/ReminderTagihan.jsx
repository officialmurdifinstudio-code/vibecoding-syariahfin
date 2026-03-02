import { useState, useEffect } from 'react';
import { Bell, Search, Filter, AlertCircle, CheckCircle2, Clock, CalendarDays, MoreVertical, Check, X, Phone, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

import { tagihanService } from '../services/firebaseServices';

export default function ReminderTagihan() {
  const [tagihan, setTagihan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const formatDate = (dateValue) => {
    // Handle Firebase Timestamp or JS Date
    const date = dateValue?.toDate ? dateValue.toDate() : new Date(dateValue);
    if(isNaN(date)) return '-';
    
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const fetchTagihan = async () => {
    // Asumsi role 'admin' sementara
    const response = await tagihanService.getDaftarTagihan('admin');
    if (response.success) {
      setTagihan(response.data);
    } else {
      console.error("Gagal mengambil data tagihan");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const initData = async () => {
      const response = await tagihanService.getDaftarTagihan('admin');
      if (response.success) {
        setTagihan(response.data);
      } else {
        console.error("Gagal mengambil data tagihan");
      }
      setIsLoading(false);
    };
    initData();
  }, []);

  const handleApproval = async (id, isApproved) => {
    if (window.confirm(`Apakah Anda yakin ingin ${isApproved ? 'MENYETUJUI' : 'MENOLAK'} pengajuan pembiayaan ini?`)) {
      // Jika disetujui, ubah status ke 'safe' / 'aktif'. 
      // Idealnya di backend kita akan menghasilkan cicilan detail (tanggal dsb).
      const newStatus = isApproved ? 'safe' : 'ditolak';
      const res = await tagihanService.updateStatusTagihan(id, newStatus);
      if (res.success) {
        alert(`Pengajuan berhasil ${isApproved ? 'disetujui' : 'ditolak'}.`);
        setIsLoading(true);
        fetchTagihan();
      } else {
        alert("Gagal memperbarui status: " + res.error);
      }
    }
  };

  // Logic filter & search
  const filteredTagihan = tagihan.filter((item) => {
    const namaCari = item.namaNasabah || item.userName || '';
    const barangCari = item.namaBarang || item.namaTujuan || '';
    const matchSearch = namaCari.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        barangCari.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchSearch;
    return matchSearch && item.status === filterType;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'danger':
        return (
          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
            <AlertCircle className="w-3.5 h-3.5 mr-1" /> Lewat Tempo
          </div>
        );
      case 'warning':
        return (
          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 mr-1" /> H-3 Tempo
          </div>
        );
      case 'pending':
        return (
          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 mr-1" /> Ajuan Baru
          </div>
        );
      case 'ditolak':
        return (
          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <X className="w-3.5 h-3.5 mr-1" /> Ditolak
          </div>
        );
      case 'safe':
      default:
        return (
          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Aman
          </div>
        );
    }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'pending': return 'border-l-4 border-l-blue-400 bg-blue-50/10';
      case 'danger': return 'border-l-4 border-l-red-500 bg-red-50/30';
      case 'warning': return 'border-l-4 border-l-amber-400 bg-amber-50/30';
      case 'safe': return 'border-l-4 border-l-emerald-500';
      default: return 'border-l-4 border-l-slate-300 opacity-60';
    }
  };

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <Bell className="w-6 h-6 mr-3 text-primary" />
            Reminder Tagihan Jatuh Tempo
          </h1>
          <p className="text-slate-500 text-sm mt-1">Pantau dan kelola jadwal cicilan nasabah secara realtime.</p>
        </div>

        {/* Action Bar (Search & Filter) */}
        <div className="flex w-full md:w-auto items-center space-x-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari nasabah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white outline-none transition-all"
            />
          </div>
          <div className="relative">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-9 pr-8 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white outline-none appearance-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Ajuan Baru (Pending)</option>
              <option value="danger">Lewat Tempo (Merah)</option>
              <option value="warning">Mendekati H-3 (Kuning)</option>
              <option value="safe">Aman (Hijau)</option>
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tabel Data (Cards for better responsive reading & UI) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
        {/* Table Header Desktop */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600 uppercase tracking-wider">
          <div className="col-span-3">Identitas</div>
          <div className="col-span-3">Item Pembiayaan</div>
          <div className="col-span-1 text-center">Tenor</div>
          <div className="col-span-2 text-right">Nominal</div>
          <div className="col-span-2 text-center">Jatuh Tempo</div>
          <div className="col-span-1 text-center">Aksi</div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-0 space-y-4 md:space-y-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-slate-500">Memuat data dari Firebase...</p>
            </div>
          ) : filteredTagihan.length > 0 ? (
            filteredTagihan.map((item) => (
              <div 
                key={item.id} 
                className={cn(
                  "grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 border border-slate-100 md:border-x-0 md:border-t-0 md:border-b md:rounded-none rounded-xl items-center hover:bg-slate-50 transition-colors",
                  getStatusStyle(item.status)
                )}
              >
                {/* Mobile Header / Desktop Col 1 */}
                <div className="col-span-12 md:col-span-3 flex justify-between md:block">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-sm uppercase">
                      {(item.namaNasabah || item.userName || 'U').charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{item.namaNasabah || item.userName}</h4>
                      <p className="text-xs text-slate-500">{item.id.slice(-6)}</p>
                    </div>
                  </div>
                  <div className="md:hidden mt-2">
                    {getStatusBadge(item.status)}
                  </div>
                </div>

                {/* Info Pembiayaan */}
                <div className="col-span-12 md:col-span-3">
                  <p className="text-sm font-medium text-slate-700">{item.namaBarang || item.namaTujuan}</p>
                  {item.status === 'pending' && (
                    <div className="mt-1">
                      <p className="text-[10px] text-slate-400 mb-1">Total: {formatRupiah(item.jumlahTagihan)}</p>
                      <div className="flex gap-2 flex-wrap">
                        {item.fileKtp && (
                          <a href={item.fileKtp} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 flex items-center hover:bg-primary hover:text-white transition">
                            <FileText className="w-3 h-3 mr-1" /> KTP
                          </a>
                        )}
                        {item.fileSlipGaji && (
                          <a href={item.fileSlipGaji} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-200 flex items-center hover:bg-blue-600 hover:text-white transition">
                            <FileText className="w-3 h-3 mr-1" /> Slip
                          </a>
                        )}
                        {item.fileJaminan && (
                          <a href={item.fileJaminan} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-200 flex items-center hover:bg-amber-600 hover:text-white transition">
                            <FileText className="w-3 h-3 mr-1" /> Jaminan
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tenor */}
                <div className="col-span-6 md:col-span-1 md:text-center text-sm">
                  <p className="text-slate-500 text-xs md:hidden mb-1">Tenor</p>
                  <span className="font-medium text-slate-700">
                    <span className="font-bold text-slate-900">{item.sisaTenor || item.tenor}</span> bln
                  </span>
                  {item.status !== 'pending' && item.cicilanKe && (
                    <p className="text-[10px] text-slate-400">Ke-{item.cicilanKe}</p>
                  )}
                </div>

                {/* Nominal */}
                <div className="col-span-6 md:col-span-2 text-right text-sm">
                  <p className="text-slate-500 text-xs md:hidden mb-1">Cicilan / Bulan</p>
                  <p className="font-bold text-slate-800">{formatRupiah(item.nominal || item.cicilanPerBulan)}</p>
                </div>

                {/* Tanggal & Badge */}
                <div className="col-span-12 md:col-span-2 md:text-center">
                  <div className="flex md:flex-col items-center justify-between md:justify-center mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="flex items-center text-sm font-medium text-slate-700">
                      <CalendarDays className="w-4 h-4 mr-2 text-slate-400 md:hidden" />
                      {item.status === 'pending' ? 'Tunggu Validasi' : formatDate(item.tanggalJatuhTempo || item.tanggalPengajuan)}
                    </div>
                    <div className="hidden md:block mt-1">
                      {getStatusBadge(item.status)}
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="col-span-12 md:col-span-1 flex justify-end md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 font-medium">
                  {item.status === 'pending' ? (
                    <div className="flex space-x-2">
                       <button onClick={() => handleApproval(item.id, true)} className="text-emerald-600 hover:bg-emerald-50 border border-emerald-200 p-1.5 rounded-lg transition-colors" title="Setujui/Terima">
                         <Check className="w-4 h-4" />
                       </button>
                       <button onClick={() => handleApproval(item.id, false)} className="text-red-500 hover:bg-red-50 border border-red-200 p-1.5 rounded-lg transition-colors" title="Tolak">
                         <X className="w-4 h-4" />
                       </button>
                    </div>
                  ) : (
                    <>
                      <button className="text-primary hover:text-emerald-700 text-sm flex items-center border border-primary/20 hover:bg-emerald-50 px-3 py-1.5 md:p-2 rounded-lg transition-colors">
                        <span className="md:hidden mr-2">Hubungi via WA</span>
                        <Phone className="w-4 h-4 hidden md:block" />
                      </button>
                      <button className="md:hidden text-slate-400 hover:bg-slate-100 p-2 rounded-lg ml-2">
                        <MoreVertical className="w-5 h-5"/>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-800">Tidak ada tagihan</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">Data tagihan dengan kriteria pencarian tersebut tidak ditemukan di sistem.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
