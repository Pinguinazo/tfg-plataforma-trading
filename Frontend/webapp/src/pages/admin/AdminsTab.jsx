import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const iconEdit = () => <span className="cursor-pointer">✏️</span>;
const iconDelete = () => <span className="cursor-pointer">🗑️</span>;

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

export default function AdminsTab({ adminUser }) {
  const [admins, setAdmins] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/managers`);
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const showMessage = (msg, type = 'error') => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleCustomValidation = (e, customMessage) => {
    if (e.target.validity.patternMismatch) {
      e.target.setCustomValidity(customMessage);
    } else {
      e.target.setCustomValidity('');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Borrar este administrador permanentemente?')) return;
    await fetch(`${API_URL}/api/admin/managers/${id}`, { method: 'DELETE' });
    fetchAdmins();
  };

  const onSecureAdminSubmit = async (e) => {
    e.preventDefault();
    
    const url = editingId 
      ? `${API_URL}/api/admin/managers/${editingId}` 
      : `${API_URL}/api/admin/managers`;
      
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const errorData = await res.json();
        return showMessage(errorData.error || 'Error al guardar administrador', 'error');
      }

      setModalOpen(false);
      setForm({ username: '', email: '', password: '' });
      setEditingId(null);
      setShowPassword(false);
      fetchAdmins();
    } catch (error) {
      showMessage('Error de conexión con el servidor', 'error');
    }
  };

  const openCreate = () => {
    setForm({ username: '', email: '', password: '' });
    setEditingId(null);
    setMessage(null);
    setModalOpen(true);
  };

  const openEdit = (admin) => {
    setForm({ username: admin.username, email: admin.email, password: '' });
    setEditingId(admin.admin_id);
    setMessage(null);
    setModalOpen(true);
  };

  return (
    <div className="flex-1 p-4 md:p-10 bg-[#0B0F19] relative">
      <header className="mb-6 md:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Admins Secundarios</h2>
          <p className="text-slate-500 text-sm mt-1">Solo el Master puede gestionar estas cuentas.</p>
        </div>
        <button onClick={openCreate} className="bg-red-700 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-red-900/20">
          + Nuevo Admin
        </button>
      </header>

      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-[#0B0F19] border-b border-slate-800">
            <tr className="text-slate-400 text-left font-medium whitespace-nowrap">
              <th className="p-4 md:p-5">Usuario</th>
              <th className="p-4 md:p-5">Email</th>
              <th className="p-4 md:p-5">Creado Por</th>
              <th className="p-4 md:p-5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {admins.length === 0 ? (
              <tr><td colSpan="4" className="text-center p-8 text-slate-500">No hay admins secundarios creados.</td></tr>
            ) : (
              admins.map(a => (
                <tr key={a.admin_id} className="text-slate-200 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 md:p-5 font-bold text-red-400">@{a.username}</td>
                  <td className="p-4 md:p-5 text-slate-400">{a.email}</td>
                  <td className="p-4 md:p-5"><span className="bg-slate-800 px-3 py-1 rounded-lg text-xs font-bold">{a.created_by}</span></td>
                  <td className="p-4 md:p-5 text-center space-x-2 whitespace-nowrap">
                    <button onClick={() => openEdit(a)} className="text-blue-400 hover:text-blue-300 p-2 bg-blue-900/20 rounded-lg transition-colors">{iconEdit()}</button>
                    <button onClick={() => handleDelete(a.admin_id)} className="text-red-400 hover:text-red-300 p-2 bg-red-900/20 rounded-lg transition-colors">{iconDelete()}</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CREAR/EDITAR ADMIN */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#111827] border border-slate-800 p-6 md:p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-6">
              {editingId ? 'Editar Administrador' : 'Nuevo Administrador'}
            </h3>

            {message && (
              <div className="mb-4 p-3 rounded-xl border font-bold text-sm bg-red-900/20 border-red-900/50 text-red-400">
                {message.text}
              </div>
            )}

            <form onSubmit={onSecureAdminSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold ml-1 mb-1 block">Nombre de Usuario</label>
                <input 
                  type="text" 
                  placeholder="Username" 
                  value={form.username} 
                  onChange={e => { e.target.setCustomValidity(''); setForm({...form, username: e.target.value}); }} 
                  onInvalid={e => handleCustomValidation(e, "El nombre no puede contener símbolos como < > o `")}
                  pattern="[^<>\`]{1,50}"
                  className="w-full bg-[#0B0F19] border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-red-500" 
                  required 
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold ml-1 mb-1 block">Correo Electrónico</label>
                <input 
                  type="email" 
                  placeholder="admin@correo.com" 
                  value={form.email} 
                  onChange={e => { e.target.setCustomValidity(''); setForm({...form, email: e.target.value}); }} 
                  onInvalid={e => handleCustomValidation(e, "Introduce un correo válido.")}
                  pattern="[a-zA-Z0-9._%\+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,10}"
                  className="w-full bg-[#0B0F19] border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-red-500" 
                  required 
                />
              </div>
              
              <div>
                <label className="text-xs text-slate-400 font-bold ml-1 mb-1 block">Contraseña</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder={editingId ? 'Nueva contraseña (dejar blanco)' : 'Contraseña segura'} 
                    value={form.password || ''} 
                    onChange={e => { e.target.setCustomValidity(''); setForm({...form, password: e.target.value}); }} 
                    onInvalid={e => handleCustomValidation(e, "La contraseña contiene caracteres no permitidos.")}
                    pattern="[^<>\`]{1,50}"
                    className="w-full bg-[#0B0F19] border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-red-500 pr-12" 
                    required={!editingId} 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors">
                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors text-sm">Guardar</button>
                <button 
                  type="button" 
                  onClick={() => {
                    setModalOpen(false);
                    setShowPassword(false);
                  }} 
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}