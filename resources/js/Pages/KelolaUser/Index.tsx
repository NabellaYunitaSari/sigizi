import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AppShell from '../../Components/AppShell';
import {
  UserPlus,
  Edit2,
  Trash2,
  X,
  Sparkles,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import { UserSession } from '../../Components/Navbar';

interface KelolaUserProps {
  usersList: any[];
  posyandus: any[];
}

export default function Index({ usersList: initialUsersList = [], posyandus = [] }: KelolaUserProps) {
  const page = usePage();
  const user = (page.props as any).auth?.user as UserSession | null;

  const [usersList, setUsersList] = useState<any[]>(initialUsersList);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    no_hp: '',
    password: '',
    role: 'kader',
    id_pos: posyandus[0]?.id || '',
  });

  const loadUsers = async () => {
    const res = await fetch('/api/users', { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      setUsersList(data);
    }
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setFormData({
      nama: '',
      username: '',
      no_hp: '',
      password: '',
      role: 'kader',
      id_pos: posyandus[0]?.id || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (u: any) => {
    setEditId(u.id);
    setFormData({
      nama: u.nama,
      username: u.username,
      no_hp: u.no_hp || '',
      password: '',
      role: u.role,
      id_pos: u.id_pos || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const url = editId ? `/api/users/${editId}` : '/api/users';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan akun user');

      setShowModal(false);
      loadUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus akun user ini?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers: { Accept: 'application/json' } });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menghapus akun');
      }
      loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Manajemen Akun • Khusus Admin / Bidan Koordinator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Kelola Akun Kader & Pengguna
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Tambah akun kader baru lengkap dengan nomor HP untuk fitur lupa password & verifikasi login
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-brand-600/20 min-h-[44px]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Akun Baru</span>
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Daftar Akun Pengguna</h3>
            <span className="text-xs text-slate-500">{usersList.length} Akun Terdaftar</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="p-3 font-bold">Nama Petugas</th>
                  <th className="p-3 font-bold">Nomor HP (Login & Reset)</th>
                  <th className="p-3 font-bold">Username</th>
                  <th className="p-3 font-bold">Peran (Role)</th>
                  <th className="p-3 font-bold">Posyandu</th>
                  <th className="p-3 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5">
                      {u.nama}
                      {u.role === 'admin' && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                    </td>
                    <td className="p-3 font-bold text-brand-700">
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-brand-600" />
                        {u.no_hp || '-'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-500">{u.username}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] capitalize ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : u.role === 'koordinator'
                            ? 'bg-sky-100 text-sky-700'
                            : 'bg-teal-100 text-teal-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">
                      {u.posyandu ? `Pos ${u.posyandu.nama_pos}` : 'Semua Pos (Desa)'}
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors min-h-[36px]"
                      >
                        <Edit2 className="w-3.5 h-3.5 inline mr-1" />
                        Edit
                      </button>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg text-xs transition-colors min-h-[36px]"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                          Hapus
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal User Form */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-lg">
                  {editId ? 'Edit Akun Pengguna' : 'Tambah Akun Kader / User'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Petugas *</label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Ibu Ani (Anggrek)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor HP (Dipakai Login & Reset) *</label>
                  <input
                    type="text"
                    required
                    value={formData.no_hp}
                    onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username Login *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Contoh: kader_anggrek"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kata Sandi {editId && '(Kosongkan jika tidak diubah)'} *
                  </label>
                  <input
                    type="password"
                    required={!editId}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Peran (Role) *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px] bg-white"
                    >
                      <option value="kader">Kader</option>
                      <option value="koordinator">Koordinator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {formData.role === 'kader' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Posyandu *</label>
                      <select
                        value={formData.id_pos}
                        onChange={(e) => setFormData({ ...formData, id_pos: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px] bg-white"
                      >
                        <option value="">Pilih Posyandu</option>
                        {posyandus.map((p) => (
                          <option key={p.id} value={p.id}>
                            Pos {p.nama_pos}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="pt-3 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl min-h-[44px]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md min-h-[44px] disabled:opacity-60"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Akun'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
