import { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Edit2, Trash2, CheckCircle, Ban, Clock, Shield, CheckSquare, Square, X, Loader2 } from 'lucide-react';
import { authService } from '../services/firebaseServices';
const availableMenus = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'simulasi', name: 'Simulasi Pembiayaan' },
  { id: 'umroh', name: 'Tabungan Umroh' },
  { id: 'reminder', name: 'Reminder Tagihan' },
  { id: 'portal_admin', name: 'Portal Admin' }
];

export default function PortalAdmin() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await authService.getUsers();
      if (res.success) {
        const formatted = res.data.map(u => ({
          id: u.id,
          name: u.namaLengkap || 'Tanpa Nama',
          email: u.email,
          role: u.role || 'nasabah',
          status: u.is_active ? 'active' : 'pending',
          menus: u.menus || [],
          margin: u.margin || ''
        }));
        setUsers(formatted);
      }
      setIsLoading(false);
    };

    fetchUsers();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'nasabah',
    status: 'active',
    menus: [],
    margin: ''
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3 mr-1" /> Aktif</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
      case 'banned':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><Ban className="w-3 h-3 mr-1" /> Banned</span>;
      default:
        return null;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border border-purple-200 bg-purple-50 text-purple-700"><Shield className="w-3 h-3 mr-1" /> Admin</span>;
      case 'pengurus':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border border-blue-200 bg-blue-50 text-blue-700">Pengurus</span>;
      case 'nasabah':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border border-slate-200 bg-slate-50 text-slate-700">Nasabah</span>;
      default:
        return null;
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ ...user });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'nasabah',
        status: 'active',
        menus: ['dashboard'],
        margin: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMenuToggle = (menuId) => {
    setFormData(prev => {
      const menus = prev.menus.includes(menuId)
        ? prev.menus.filter(id => id !== menuId)
        : [...prev.menus, menuId];
      return { ...prev, menus };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingUser) {
      const dataUpdate = {
        namaLengkap: formData.name,
        email: formData.email,
        role: formData.role,
        is_active: formData.status === 'active',
        menus: formData.menus,
        margin: formData.margin ? Number(formData.margin) : null
      };
      
      const res = await authService.updateUserRoleStatus(editingUser.id, dataUpdate);
      
      if (res.success) {
        setUsers(users.map(u => u.id === editingUser.id ? { 
          ...u, 
          name: formData.name, 
          email: formData.email, 
          role: formData.role, 
          status: formData.status, 
          menus: formData.menus,
          margin: formData.margin
        } : u));
      } else {
        alert("Gagal mengubah pengguna: " + res.error);
      }
    } else {
      alert("Fitur tambah Admin manual segera hadir. Tambah pengguna lokal harap melalui laman /register.");
    }
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      const res = await authService.deleteUser(id);
      if (res.success) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        alert("Gagal menghapus: " + res.error);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const is_active = newStatus === 'active';
    const res = await authService.updateUserRoleStatus(id, { is_active });
    if (res.success) {
      setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
    }
  };
  
  const handleRoleChange = async (id, newRole) => {
    const res = await authService.updateUserRoleStatus(id, { role: newRole });
    if (res.success) {
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 mb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <Users className="w-6 h-6 mr-2 text-primary" />
            Portal Admin
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manajemen pengguna, akses peran, dan hak akses menu.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-xl shadow-sm transition-colors flex items-center text-sm"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Tambah Pengguna
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="relative w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-primary focus:border-primary transition-colors bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pengguna</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Akses Menu</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 text-sm">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{user.name}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="text-xs font-medium border-none bg-transparent focus:ring-0 cursor-pointer p-0 w-24"
                      >
                        <option value="admin">Admin</option>
                        <option value="pengurus">Pengurus</option>
                        <option value="nasabah">Nasabah</option>
                      </select>
                      <div className="mt-1">{getRoleBadge(user.role)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusChange(user.id, e.target.value)}
                        className="text-xs font-medium border-none bg-transparent focus:ring-0 cursor-pointer p-0 w-24"
                      >
                        <option value="active">Aktif</option>
                        <option value="pending">Pending</option>
                        <option value="banned">Banned</option>
                      </select>
                      <div className="mt-1">{getStatusBadge(user.status)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.menus.length > 0 ? (
                          user.menus.map(menuId => {
                            const menu = availableMenus.find(m => m.id === menuId);
                            return menu ? (
                              <span key={menuId} className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium border border-slate-200">
                                {menu.name}
                              </span>
                            ) : null;
                          })
                        ) : (
                          <span className="text-xs text-slate-400 italic">Tidak ada akses</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleOpenModal(user)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Pengguna"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 text-sm">
                    Tidak ada pengguna yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative z-10 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-slate-800">
                {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleFormChange}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-primary focus:border-primary transition-colors"
                  placeholder="Masukkan nama pengguna"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleFormChange}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-primary focus:border-primary transition-colors"
                  placeholder="email@contoh.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role / Peran</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-primary focus:border-primary transition-colors"
                  >
                    <option value="nasabah">Nasabah</option>
                    <option value="pengurus">Pengurus</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status Keanggotaan</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-primary focus:border-primary transition-colors"
                  >
                    <option value="active">Aktif</option>
                    <option value="pending">Pending</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3 border-t border-slate-100 pt-4">Hak Akses Menu</label>
                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {availableMenus.map(menu => (
                    <label key={menu.id} className="flex items-center space-x-3 cursor-pointer p-1 rounded hover:bg-emerald-50/50 transition-colors">
                      <div className="relative flex items-center justify-center" onClick={() => handleMenuToggle(menu.id)}>
                        {formData.menus.includes(menu.id) ? (
                          <CheckSquare className="w-5 h-5 text-primary" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <span className="text-sm text-slate-700 font-medium select-none">{menu.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 border-t border-slate-100 pt-4">Margin Pembiayaan Khusus (%)</label>
                <input
                  type="number"
                  name="margin"
                  step="0.1"
                  min="1"
                  max="50"
                  value={formData.margin || ''}
                  onChange={handleFormChange}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-primary focus:border-primary transition-colors bg-white mt-1"
                  placeholder="Kosongkan untuk ikut margin global"
                />
                <p className="text-[10px] text-slate-500 mt-1">Isi hanya jika Anda ingin memberikan penetapan margin yang berbeda pada simulasi pembiayaan untuk Nasabah ini.</p>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-emerald-700 shadow-sm transition-colors"
                >
                  {editingUser ? 'Simpan Perubahan' : 'Tambah Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
