import { useState } from 'react';
import { Bell, Search, Filter, AlertCircle, CheckCircle2, Clock, CalendarDays, MoreVertical } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

import { useEffect } from 'react';
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

  useEffect(() => {
    const fetchTagihan = async () => {
      setIsLoading(true);
      // Asumsi role 'admin' sementara
      const response = await tagihanService.getDaftarTagihan('admin');
      if (response.success) {
        setTagihan(response.data);
      } else {
        console.error("Gagal mengambil data tagihan");
      }
      setIsLoading(false);
    };

    fetchTagihan();
  }, []);

  // Logic filter & search
  const filteredTagihan = tagihan.filter((item) => {
    const matchSearch = item.namaNasabah.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.namaBarang.toLowerCase().includes(searchTerm.toLowerCase());
    
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
      case 'danger': return 'border-l-4 border-l-red-500 bg-red-50/30';
      case 'warning': return 'border-l-4 border-l-amber-400 bg-amber-50/30';
      case 'safe': return 'border-l-4 border-l-emerald-500';
      default: return 'border-l-4 border-l-slate-300';
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
                      {item.namaNasabah.charAt(0)}{item.namaNasabah.split(' ')[1]?.[0] || ''}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{item.namaNasabah}</h4>
                      <p className="text-xs text-slate-500">{item.id}</p>
                    </div>
                  </div>
                  <div className="md:hidden">
                    {getStatusBadge(item.status)}
                  </div>
                </div>

                {/* Info Pembiayaan */}
                <div className="col-span-12 md:col-span-3">
                  <p className="text-sm font-medium text-slate-700">{item.namaBarang}</p>
                </div>

                {/* Tenor */}
                <div className="col-span-6 md:col-span-1 md:text-center text-sm">
                  <p className="text-slate-500 text-xs md:hidden mb-1">Sisa Tenor</p>
                  <span className="font-medium text-slate-700">
                    <span className="font-bold text-slate-900">{item.sisaTenor}</span> bln
                  </span>
                  <p className="text-[10px] text-slate-400">Ke-{item.cicilanKe}</p>
                </div>

                {/* Nominal */}
                <div className="col-span-6 md:col-span-2 text-right text-sm">
                  <p className="text-slate-500 text-xs md:hidden mb-1">Cicilan / Bulan</p>
                  <p className="font-bold text-slate-800">{formatRupiah(item.nominal)}</p>
                </div>

                {/* Tanggal & Badge */}
                <div className="col-span-12 md:col-span-2 md:text-center">
                  <div className="flex md:flex-col items-center justify-between md:justify-center mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="flex items-center text-sm font-medium text-slate-700">
                      <CalendarDays className="w-4 h-4 mr-2 text-slate-400 md:hidden" />
                      {formatDate(item.tanggalJatuhTempo)}
                    </div>
                    <div className="hidden md:block mt-1">
                      {getStatusBadge(item.status)}
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="col-span-12 md:col-span-1 flex justify-end md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 font-medium">
                  <button className="text-primary hover:text-emerald-700 text-sm flex items-center border border-primary/20 hover:bg-emerald-50 px-3 py-1.5 md:p-2 rounded-lg transition-colors">
                    <span className="md:hidden mr-2">Hubungi via WA</span>
                    <svg className="w-4 h-4 hidden md:block" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0a12 12 0 1 0 12 12A12.013 12.013 0 0 0 12 0Zm-.59 18h-1.54v-5.46h-2.12v-1.42h2.12V9.8a3.14 3.14 0 0 1 3.32-3.4h1.92v1.44h-1.37c-1.13 0-1.43.53-1.43 1.37v1.92h2.8l-.37 1.42h-2.43Z"/></svg>
                    <svg className="w-4 h-4 md:hidden" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.01 2.014c-5.513 0-9.997 4.478-9.997 9.99 0 1.765.46 3.486 1.334 5.01L2 22.013l5.127-1.344a9.927 9.927 0 0 0 4.882 1.272h.005c5.51 0 9.994-4.478 9.994-9.991C22.008 6.47 17.525 1.99 12.01 2.014Zm0 16.297a8.29 8.29 0 0 1-4.24-1.164l-.3-.178-3.15.827.842-3.072-.196-.312a8.261 8.261 0 0 1-1.265-4.41C3.702 5.378 8.16 2.9cd 11.2cd c5.51 0 9.994-4.478 9.994-9.991... Z" /></svg>
                  </button>
                  <button className="md:hidden text-slate-400 hover:bg-slate-100 p-2 rounded-lg ml-2">
                    <MoreVertical className="w-5 h-5"/>
                  </button>
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
