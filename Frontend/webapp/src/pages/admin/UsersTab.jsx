import { useState } from 'react';

const iconEdit = () => <span className="cursor-pointer">✏️</span>;
const iconDelete = () => <span className="cursor-pointer">🗑️</span>;
const iconLogs = () => <span className="cursor-pointer">📄</span>;

export default function UsersTab({ users, fetchAllData, adminUser }) {
  const [showPassword, setShowPassword] = useState(false);
  const [editModal, setEditModal] = useState({ isOpen: false, user: null, form: { username: '', email: '', tier: '', password: '' } });
  const [logsModal, setLogsModal] = useState({ isOpen: false, user: null, logs: [] });

  const isValidEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]{1,35}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;
    return email && email.length <= 50 && re.test(email);
  };

  const isSafeText = (text) => {
    if (!text) return true;
    const re = /^[^<>`]{1,50}$/;
    return text.length <= 50 && re.test(text);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Mandar a cola de borrado?')) {
      await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}/delete`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_username: adminUser?.username }) 
      });
      fetchAllData();
    }
  };

  const handleSaveEdit = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${editModal.user.user_id}/update`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ ...editModal.form, admin_username: adminUser?.username }) 
    });
    setEditModal({ isOpen: false, user: null, form: {} });
    setShowPassword(false);
    fetchAllData();
  };

  const onSecureUserEdit = (e) => {
    e.preventDefault();
    if (!isSafeText(editModal.form.username)) return alert("El nombre de usuario contiene caracteres prohibidos.");
    if (!isValidEmail(editModal.form.email)) return alert("El correo electrónico es inválido.");
    if (editModal.form.password && !isSafeText(editModal.form.password)) return alert("La contraseña contiene caracteres prohibidos.");
    
    handleSaveEdit();
  };

  const openUserLogs = async (user) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${user.user_id}/logs`);
      if (res.ok) {
        const data = await res.json();
        setLogsModal({ isOpen: true, user, logs: data });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-10 bg-[#0B0F19] relative">
      <header className="mb-6 md:mb-10"><h2 className="text-2xl md:text-3xl font-bold text-white">Gestión de Usuarios</h2></header>
      
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-[#0B0F19] border-b border-slate-800">
            <tr className="text-slate-400 text-left font-medium whitespace-nowrap">
              <th className="p-4 md:p-5">Usuario</th>
              <th className="p-4 md:p-5">Email</th>
              <th className="p-4 md:p-5">Plan</th>
              <th className="p-4 md:p-5">Estado</th>
              <th className="p-4 md:p-5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {users.map(u => (
              <tr key={u.user_id} className="text-slate-200 hover:bg-slate-800/30 transition-colors">
                <td className="p-4 md:p-5 font-bold">{u.username}</td>
                <td className="p-4 md:p-5 text-slate-400">{u.email}</td>
                <td className="p-4 md:p-5"><span className="bg-slate-800 px-3 py-1 rounded-lg text-xs font-bold">{u.tier}</span></td>
                <td className="p-4 md:p-5">
                  <span className={`flex items-center gap-2 text-xs font-bold ${u.is_active ? 'text-green-400' : 'text-red-400'}`}>
                    <span className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    {u.is_active ? 'Activo' : 'En Cola'}
                  </span>
                </td>
                <td className="p-4 md:p-5 text-center space-x-2 whitespace-nowrap">
                  <button onClick={() => openUserLogs(u)} className="text-slate-400 hover:text-slate-300 p-2 bg-slate-800/50 rounded-lg transition-colors">{iconLogs()}</button>
                  <button 
                    onClick={() => {
                      setEditModal({ isOpen: true, user: u, form: { username: u.username, email: u.email, tier: u.tier, password: '' } });
                      setShowPassword(false);
                    }} 
                    className="text-blue-400 hover:text-blue-300 p-2 bg-blue-900/20 rounded-lg transition-colors"
                  >
                    {iconEdit()}
                  </button>
                  {u.is_active && <button onClick={() => handleDeleteUser(u.user_id)} className="text-red-400 hover:text-red-300 p-2 bg-red-900/20 rounded-lg transition-colors">{iconDelete()}</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#111827] border border-slate-800 p-6 md:p-8 rounded-3xl w-full max-w-md">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-6">Editar Usuario</h3>
            <form onSubmit={onSecureUserEdit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold ml-1 mb-1 block">Usuario</label>
                <input type="text" value={editModal.form.username} onChange={e => setEditModal({ ...editModal, form: { ...editModal.form, username: e.target.value } })} className="w-full bg-[#0B0F19] border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-blue-500" required />
              </div>
              
              <div>
                <label className="text-xs text-slate-400 font-bold ml-1 mb-1 block">Email</label>
                <input type="email" value={editModal.form.email} onChange={e => setEditModal({ ...editModal, form: { ...editModal.form, email: e.target.value } })} className="w-full bg-[#0B0F19] border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-blue-500" required />
              </div>
              
              <div>
                <label className="text-xs text-slate-400 font-bold ml-1 mb-1 block">Plan de Suscripción</label>
                <select value={editModal.form.tier} onChange={e => setEditModal({ ...editModal, form: { ...editModal.form, tier: e.target.value } })} className="w-full bg-[#0B0F19] border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-blue-500">
                  <option value="Básico">Básico</option>
                  <option value="Pro">Pro</option>
                  <option value="Élite">Élite</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold ml-1 mb-1 block">Forzar nueva contraseña (opcional)</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Dejar en blanco para no cambiarla"
                    value={editModal.form.password || ''} 
                    onChange={e => setEditModal({ ...editModal, form: { ...editModal.form, password: e.target.value } })} 
                    className="w-full bg-[#0B0F19] border border-slate-800 p-3 pr-12 rounded-xl text-red-400 outline-none focus:border-red-500 font-mono text-sm" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                  >
                    {showPassword ? (
                      <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    ) : (
                      <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors text-sm">Guardar</button>
                <button 
                  type="button" 
                  onClick={() => {
                    setEditModal({ isOpen: false, user: null, form: {} });
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

      {logsModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#111827] border border-slate-800 p-6 md:p-8 rounded-3xl w-full max-w-2xl shadow-2xl">
            <div className="flex justify-between items-start md:items-center mb-6">
              <h3 className="text-xl md:text-2xl font-bold text-white break-all pr-4">Actividad <span className="text-blue-400">@{logsModal.user?.username}</span></h3>
              <button onClick={() => setLogsModal({ isOpen: false, user: null, logs: [] })} className="text-slate-400 hover:text-white font-bold text-2xl">✖</button>
            </div>
            
            <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-4 max-h-80 overflow-y-auto custom-scrollbar">
              {logsModal.logs.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No hay actividad registrada.</p>
              ) : (
                <div className="space-y-3">
                  {logsModal.logs.map((log, i) => (
                    <div key={i} className="border-b border-slate-800/50 pb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div>
                        <p className="font-bold text-slate-300 text-sm">{log.action}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{log.details}</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded w-fit">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}