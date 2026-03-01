export default function Dashboard() {
  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Utama</h1>
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Selamat Datang di Syariahfin</h2>
          <p className="text-slate-500 max-w-sm">Kelola pembiayaan menjelang Idul Fitri dan tabungan Umroh nasabah Anda dengan mudah dan sesuai syariah.</p>
        </div>
      </div>
    </div>
  );
}
